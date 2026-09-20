export type AccountType = 'cash' | 'bank' | 'credit_card' | 'e_wallet';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
  accountNumber?: string;
  bankName?: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  accountId: string;
  toAccountId?: string; // For transfers
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  date: string; // ISO format YYYY-MM-DD
  note?: string;
  slipUrl?: string;
  tags?: string[];
  creditCardId?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  lastFourDigits: string;
  creditLimit: number;
  currentBalance: number; // Amount spent this cycle
  statementDay: number; // Day of month (e.g., 20)
  dueDay: number; // Day of month (e.g., 10)
  cardColor: string;
  apr?: number;
  isPaidThisMonth?: boolean;
}

export type SubscriptionCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: SubscriptionCycle;
  category: string;
  nextBillingDate: string; // YYYY-MM-DD
  icon: string;
  color: string;
  isActive: boolean;
  linkedAccountId?: string;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  totalCreditCardDebt: number;
  monthlySubscriptionTotal: number;
  totalLentPending: number;
  totalInvestmentValue: number;
  totalInvestmentCost: number;
  totalInvestmentProfitLoss: number;
}

export type LoanStatus = 'pending' | 'partial' | 'paid';

export interface LoanRepayment {
  id: string;
  amount: number;
  date: string; // ISO format YYYY-MM-DD
  toAccountId?: string;
  note?: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  borrowerName: string;
  borrowerContact?: string;
  originalAmount: number;
  totalPaid: number;
  lentDate: string; // ISO format YYYY-MM-DD
  dueDate?: string; // ISO format YYYY-MM-DD
  fromAccountId?: string;
  note?: string;
  status: LoanStatus;
  repayments: LoanRepayment[];
  createdAt: string;
}

export type InvestmentAssetType =
  | 'us_stock'
  | 'thai_stock'
  | 'crypto'
  | 'fund'
  | 'gold'
  | 'other';

export type InvestmentPlatform =
  | 'dime'
  | 'binance'
  | 'bitkub'
  | 'innovestx'
  | 'streaming'
  | 'webull'
  | 'ibkr'
  | 'huasengheng'
  | 'exness'
  | 'xm'
  | 'mtsgold'
  | 'other';

export interface InvestmentHolding {
  id: string;
  symbol: string; // e.g. "VOO", "NVDA", "BTC", "PTT"
  name: string; // e.g. "Vanguard S&P 500 ETF", "Bitcoin"
  platform: InvestmentPlatform | string;
  platformName?: string; // e.g. "Dime!", "Binance"
  assetType: InvestmentAssetType;
  units: number; // e.g. 1.25 shares, 0.045 BTC
  avgBuyPrice: number; // cost per unit in holding's currency
  currentPrice: number; // current market price per unit
  currency: 'THB' | 'USD';
  exchangeRate: number; // default 35.5 THB/USD if USD
  note?: string;
  updatedAt: string; // ISO format
}

export type InvestmentTradeType = 'buy' | 'sell' | 'dividend';

export interface InvestmentTransaction {
  id: string;
  holdingId: string;
  symbol: string;
  type: InvestmentTradeType;
  units: number;
  pricePerUnit: number;
  totalAmount: number; // in holding currency
  exchangeRate: number;
  date: string; // ISO format YYYY-MM-DD
  fromAccountId?: string;
  note?: string;
  createdAt: string;
}

