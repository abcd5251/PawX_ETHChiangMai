import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { userWallets } from '@/models/Schema';
import { extract_CA } from '@/processor/extract_CA';
import { extract_ticker } from '@/processor/extractor';
import { swapBNBToToken } from '@/trade/trade_bsc';
import { swapSOLToTokenJupiter } from '@/trade/trade_sol';
import { searchTokens } from '@/utils/token_info';

type ChainOption = 'bsc' | 'solana' | 'both';
type SniperType = 'ca' | 'keywords' | 'both';

type SniperConfig = {
  accounts: string[];
  chain: ChainOption;
  type: SniperType;
  amount: string;
  slippage: string;
  gasFee: string;
  updatedAt: string;
};

type CsvToken = {
  name: string;
  symbol: string;
  ca: string;
  chain: string;
};

const OUTPUT_MAPPING_FILE = 'add_token.csv';

const normalizeChain = (chain: string | null | undefined) => {
  if (!chain) {
    return null;
  }
  const normalized = chain.toLowerCase();
  if (normalized === 'bsc' || normalized === 'binance-smart-chain') {
    return 'bsc';
  }
  if (normalized === 'sol' || normalized === 'solana') {
    return 'solana';
  }
  return null;
};

const isChainAllowed = (selected: ChainOption, chain: 'bsc' | 'solana') => {
  if (selected === 'both') {
    return true;
  }
  return selected === chain;
};

const parseSlippageBps = (value: string) => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return 100;
  }
  return Math.max(1, Math.round(parsed * 100));
};

const normalizeAmount = (value: string) => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return '0.001';
  }
  return value;
};

const searchTokenInCsv = (symbol: string): CsvToken[] => {
  const filePath = path.join(process.cwd(), 'token_mapping.csv');
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const rows = lines[0]?.toLowerCase().includes('symbol') ? lines.slice(1) : lines;
  const target = symbol.trim().toLowerCase();
  const parsedRows = rows
    .map((line) => {
      const [name, sym, ca, chain] = line.split(',').map(part => part.trim());
      if (!name || !sym || !ca || !chain) {
        return null;
      }
      return { name, symbol: sym, ca, chain };
    })
    .filter((row): row is CsvToken => Boolean(row));
  return parsedRows.filter(row => row.symbol.toLowerCase() === target);
};

const ensureOutputMappingFile = () => {
  const filePath = path.join(process.cwd(), OUTPUT_MAPPING_FILE);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, 'name,symbol,ca,chain\n', 'utf8');
  }
};

const saveTokenToMapping = async (name: string, symbol: string, ca: string, chain: string) => {
  ensureOutputMappingFile();
  const filePath = path.join(process.cwd(), OUTPUT_MAPPING_FILE);
  const row = `${name},${symbol},${ca},${chain}\n`;
  fs.appendFileSync(filePath, row, 'utf8');
};

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const text = body?.text as string | undefined;
  const config = body?.config as SniperConfig | undefined;
  const requestAmount = body?.amount as string | undefined;
  const userId = body?.userId as string | undefined;

  if (!text || !config || !userId) {
    return NextResponse.json({ trades: [] }, { status: 400 });
  }

  const walletByTelegram = await db
    .select()
    .from(userWallets)
    .where(eq(userWallets.telegramUserId, userId))
    .limit(1);
  const walletById = walletByTelegram.length === 0 && Number.isFinite(Number(userId))
    ? await db
        .select()
        .from(userWallets)
        .where(eq(userWallets.id, Number(userId)))
        .limit(1)
    : [];
  const wallet = walletByTelegram[0] ?? walletById[0];

  if (!wallet) {
    return NextResponse.json({ trades: [] }, { status: 401 });
  }

  const slippageBps = parseSlippageBps(config.slippage);
  const amount = normalizeAmount(requestAmount ?? config.amount);
  const trades: Array<{ hash: string; chain: 'bsc' | 'solana' }> = [];

  const executeTrade = async (chain: 'bsc' | 'solana', ca: string) => {
    if (!isChainAllowed(config.chain, chain)) {
      return false;
    }
    try {
      if (chain === 'bsc') {
        const result = await swapBNBToToken(ca, amount, slippageBps, wallet.evmPrivateKey);
        if (result?.hash) {
          trades.push({ hash: result.hash, chain });
          return true;
        }
      } else {
        const result = await swapSOLToTokenJupiter(ca, amount, slippageBps, wallet.solPrivateKey);
        if (result?.hash) {
          trades.push({ hash: result.hash, chain });
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  const caExtraction = extract_CA(text);
  const extraction = extract_ticker(text);

  const resolvedCA = caExtraction.CA ?? extraction.CA;
  const resolvedChain = caExtraction.chain ?? extraction.chain;

  if (resolvedCA) {
    if (config.type !== 'keywords') {
      const fallbackChain = resolvedCA.startsWith('0x') ? 'bsc' : 'solana';
      const chain = normalizeChain(resolvedChain) ?? fallbackChain;
      if (chain) {
        await executeTrade(chain, resolvedCA);
      }
    }
    return NextResponse.json({ trades });
  }

  if (!extraction.has_ticker || extraction.ticker.length === 0 || config.type === 'ca') {
    return NextResponse.json({ trades });
  }

  for (const symbol of extraction.ticker) {
    const csvMatches = searchTokenInCsv(symbol);
    if (csvMatches.length > 0) {
      const match = csvMatches[0]!;
      const chain = normalizeChain(match.chain);
      if (chain) {
        await executeTrade(chain, match.ca);
      }
      continue;
    }

    const tokens = await searchTokens(symbol, undefined, 1);
    const targetToken = tokens[0];
    if (!targetToken) {
      continue;
    }

    const chain = normalizeChain(targetToken.chain);
    if (!chain) {
      continue;
    }

    const success = await executeTrade(chain, targetToken.token_id);
    if (success) {
      await saveTokenToMapping(targetToken.name, symbol, targetToken.token_id, targetToken.chain);
    }
  }

  return NextResponse.json({ trades });
};
