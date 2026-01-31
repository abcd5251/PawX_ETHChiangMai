import * as fs from 'fs';
import * as path from 'path';

const CSV_PATH = path.resolve(__dirname, '../../token_mapping.csv');

function loadTickersFromCsv(): Set<string> {
    const tickers = new Set<string>();
    try {
        if (fs.existsSync(CSV_PATH)) {
            const content = fs.readFileSync(CSV_PATH, 'utf-8');
            const lines = content.split(/\r?\n/);
            // Skip header
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const parts = line.split(',');
                    // symbol is the second column (index 1)
                    if (parts.length >= 2) {
                        const symbol = parts[1].trim().toUpperCase();
                        if (symbol) {
                            tickers.add(symbol);
                        }
                    }
                }
            }
        } else {
            console.warn(`Warning: CSV file not found at ${CSV_PATH}`);
        }
    } catch (error) {
        console.error("Error loading tickers from CSV:", error);
    }
    return tickers;
}

export const TICKERS = loadTickersFromCsv();

// List of tickers to ignore (uppercase)
export const IGNORED_TICKERS = new Set([
    "DYOR", "IRL", "APP", "CEO", "CTO", "KBW", "TOKEN","UI", "UX","UIUX", "DEX", "US", "AND", "OR", "NOT", "QE", "BUILD","DM", "AI", "FUD","SEC","IN", "CZ", "YOLO","ATH","GM", "AM", "PM", "RWA","IF", "CEX","BBW","FOX", "QA", "KOL", "CA", "JUST", "DAT", "CAUTION", "KYC", "GAS", "SG", "ALERT","AFTER","TLDR","YOUR","CVC","BC", "BUIDL", "AUM","UAE","ZH", "VIP", "PS","UTC", "IOS", "AMA", "MEME","TVL","FYI", "EU", "BREAKING", "UK"
]);
