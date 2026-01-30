import { db } from '@/libs/DB';
import { userWallets } from '@/models/Schema';
import { eq } from 'drizzle-orm';
import { Wallet } from 'ethers';
import { Keypair } from '@solana/web3.js';
import { NextResponse } from 'next/server';

type TelegramMessage = {
  message?: {
    text?: string;
    chat?: { id?: number | string };
    from?: { id?: number | string };
  };
};

export const POST = async (request: Request) => {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'BOT_TOKEN not configured' }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as TelegramMessage | null;
  const text = body?.message?.text;
  if (!text || !text.startsWith('/start')) {
    return NextResponse.json({ ok: true });
  }

  const chatId = body?.message?.chat?.id ?? body?.message?.from?.id;
  if (!chatId) {
    return NextResponse.json({ ok: true });
  }

  const userId = String(chatId);
  const sendMessage = async (textMessage: string) => {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: textMessage,
        }),
      });
    } catch (error) {
      console.error('Telegram sendMessage failed', error);
    }
  };

  try {
    const existing = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.telegramUserId, userId))
      .limit(1);

    let evmAddress: string;
    let evmPrivateKey: string;
    let solAddress: string;
    let solPrivateKey: string;

    if (existing.length > 0 && existing[0]) {
      evmAddress = existing[0].evmAddress;
      evmPrivateKey = existing[0].evmPrivateKey;
      solAddress = existing[0].solAddress;
      solPrivateKey = existing[0].solPrivateKey;
    } else {
      const evmWallet = Wallet.createRandom();
      const solKeypair = Keypair.generate();
      evmAddress = evmWallet.address;
      evmPrivateKey = evmWallet.privateKey;
      solAddress = solKeypair.publicKey.toBase58();
      solPrivateKey = Buffer.from(solKeypair.secretKey).toString('hex');

      await db.insert(userWallets).values({
        telegramUserId: userId,
        evmAddress,
        solAddress,
        evmPrivateKey,
        solPrivateKey,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const loginUrl = `${appUrl}/sniper?user_id=${encodeURIComponent(userId)}`;

    await sendMessage(`Registration successful.`);
    await sendMessage(`EVM Address: ${evmAddress}`);
    await sendMessage(`EVM Private Key: ${evmPrivateKey}`);
    await sendMessage(`Solana Address: ${solAddress}`);
    await sendMessage(`Solana Private Key: ${solPrivateKey}`);
    await sendMessage(`Login link: ${loginUrl}`);
  } catch (error) {
    console.error('Telegram webhook failed', error);
    await sendMessage('Webhook error. Please try again later.');
  }

  return NextResponse.json({ ok: true });
};
