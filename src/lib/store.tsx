"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { 
  Account, 
  Category, 
  CreditCard, 
  InvestmentHolding, 
  InvestmentTradeType, 
  InvestmentTransaction, 
  Loan, 
  LoanRepayment, 
  LoanStatus, 
  MonthlySummary, 
  Subscription, 
  Transaction 
} from "./types";
import { useAuth } from "./auth-context";
import { createClient } from "./supabase/client";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  creditCards: CreditCard[];
  subscriptions: Subscription[];
  loans: Loan[];
  investments: InvestmentHolding[];
  investmentTransactions: InvestmentTransaction[];
  categories: Category[];
  summary: MonthlySummary;
  isHydrated: boolean;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (acc: Omit<Account, "id">) => void;
  updateAccount: (id: string, partial: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addCreditCard: (card: Omit<CreditCard, "id">) => void;
  payCreditCard: (cardId: string, fromAccountId: string, amount: number) => void;
  deleteCreditCard: (id: string) => void;
  addSubscription: (sub: Omit<Subscription, "id">) => void;
  updateSubscription: (id: string, partial: Partial<Subscription>) => void;
  toggleSubscription: (id: string) => void;
  deleteSubscription: (id: string) => void;
  addLoan: (
    loanData: Omit<Loan, "id" | "totalPaid" | "status" | "repayments" | "createdAt">,
    deductFromAccount?: boolean
  ) => void;
  recordRepayment: (
    loanId: string,
    repayment: { amount: number; date: string; toAccountId?: string; note?: string },
    depositToAccount?: boolean
  ) => void;
  deleteRepayment: (loanId: string, repaymentId: string) => void;
  updateLoan: (id: string, partial: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  addInvestmentHolding: (
    holding: Omit<InvestmentHolding, "id" | "updatedAt">,
    deductFromAccount?: boolean,
    accountId?: string
  ) => void;
  updateInvestmentHolding: (id: string, partial: Partial<InvestmentHolding>) => void;
  updateHoldingPrice: (id: string, newPrice: number) => void;
  recordInvestmentTrade: (
    holdingId: string,
    trade: {
      type: InvestmentTradeType;
      units: number;
      pricePerUnit: number;
      date: string;
      fromAccountId?: string;
      note?: string;
    },
    syncAccount?: boolean
  ) => void;
  deleteInvestmentHolding: (id: string) => void;
  resetToDefaultData: () => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-1", name: "อาหารและเครื่องดื่ม", type: "expense", icon: "Utensils", color: "#F59E0B" },
  { id: "cat-2", name: "เดินทาง / คมนาคม", type: "expense", icon: "Car", color: "#3B82F6" },
  { id: "cat-3", name: "ช้อปปิ้ง / ของใช้", type: "expense", icon: "ShoppingBag", color: "#EC4899" },
  { id: "cat-4", name: "ที่พัก / สาธารณูปโภค", type: "expense", icon: "Home", color: "#8B5CF6" },
  { id: "cat-5", name: "สุขภาพ / ยา", type: "expense", icon: "HeartPulse", color: "#EF4444" },
  { id: "cat-6", name: "ความบันเทิง / ไลฟ์สไตล์", type: "expense", icon: "Film", color: "#06B6D4" },
  { id: "cat-7", name: "ค่าสมาชิก / Subscriptions", type: "expense", icon: "CreditCard", color: "#6366F1" },
  { id: "cat-8", name: "เงินเดือน / รายได้หลัก", type: "income", icon: "Briefcase", color: "#10B981" },
  { id: "cat-9", name: "โบนัส / ค่าล่วงเวลา", type: "income", icon: "Sparkles", color: "#14B8A6" },
  { id: "cat-10", name: "ปันผล / การลงทุน", type: "income", icon: "TrendingUp", color: "#84CC16" },
  { id: "cat-11", name: "งานพิเศษ / ฟรีแลนซ์", type: "income", icon: "Laptop", color: "#10B981" },
  { id: "cat-12", name: "เงินให้ยืม / ลูกหนี้", type: "expense", icon: "HandCoins", color: "#F97316" },
  { id: "cat-13", name: "รับคืนเงินยืม / ได้เงินคืน", type: "income", icon: "HandCoins", color: "#10B981" },
];

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Mappers from Supabase DB (snake_case) to Frontend (camelCase)
function mapAccountRow(r: any): Account {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    balance: Number(r.balance),
    currency: r.currency || "THB",
    icon: r.icon || undefined,
    color: r.color || undefined,
    accountNumber: r.account_number || undefined,
    bankName: r.bank_name || undefined,
  };
}

function mapCreditCardRow(r: any): CreditCard {
  return {
    id: r.id,
    name: r.name,
    bank: r.bank,
    lastFourDigits: r.last_four_digits,
    creditLimit: Number(r.credit_limit),
    currentBalance: Number(r.current_balance),
    statementDay: Number(r.statement_day),
    dueDay: Number(r.due_day),
    cardColor: r.card_color || "#1E293B",
    isPaidThisMonth: Boolean(r.is_paid_this_month),
  };
}

function mapSubscriptionRow(r: any): Subscription {
  return {
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    currency: r.currency || "THB",
    billingCycle: r.billing_cycle,
    category: r.category,
    nextBillingDate: r.next_billing_date,
    icon: r.icon,
    color: r.color,
    isActive: Boolean(r.is_active),
    linkedAccountId: r.linked_account_id || undefined,
  };
}

function mapTransactionRow(r: any): Transaction {
  return {
    id: r.id,
    type: r.type,
    amount: Number(r.amount),
    accountId: r.account_id,
    toAccountId: r.to_account_id || undefined,
    categoryId: r.category_id || "",
    categoryName: r.category_name || "",
    categoryIcon: r.category_icon || "",
    creditCardId: r.credit_card_id || undefined,
    date: r.date,
    note: r.note || undefined,
    slipUrl: r.slip_url || undefined,
    tags: r.tags || undefined,
  };
}

function mapLoanRow(r: any): Loan {
  const repayments = (r.repayments || []).map((rep: any) => ({
    id: rep.id,
    amount: Number(rep.amount),
    date: rep.date,
    toAccountId: rep.to_account_id || undefined,
    note: rep.note || undefined,
    createdAt: rep.created_at || new Date().toISOString(),
  }));

  return {
    id: r.id,
    borrowerName: r.borrower_name,
    borrowerContact: r.borrower_contact || undefined,
    originalAmount: Number(r.original_amount),
    totalPaid: Number(r.total_paid),
    lentDate: r.lent_date,
    dueDate: r.due_date || undefined,
    fromAccountId: r.from_account_id || undefined,
    note: r.note || undefined,
    status: r.status as LoanStatus,
    repayments,
    createdAt: r.created_at || new Date().toISOString(),
  };
}

function mapInvestmentRow(r: any): InvestmentHolding {
  return {
    id: r.id,
    symbol: r.symbol,
    name: r.name,
    platform: r.platform,
    platformName: r.platform_name || undefined,
    assetType: r.asset_type,
    units: Number(r.units),
    avgBuyPrice: Number(r.avg_buy_price),
    currentPrice: Number(r.current_price),
    currency: r.currency || "USD",
    exchangeRate: Number(r.exchange_rate) || 35.5,
    note: r.note || undefined,
    updatedAt: r.updated_at || new Date().toISOString(),
  };
}

function mapInvestmentTxRow(r: any): InvestmentTransaction {
  return {
    id: r.id,
    holdingId: r.holding_id,
    symbol: r.symbol,
    type: r.type,
    units: Number(r.units),
    pricePerUnit: Number(r.price_per_unit),
    totalAmount: Number(r.total_amount),
    exchangeRate: Number(r.exchange_rate) || 35.5,
    date: r.date,
    fromAccountId: r.from_account_id || undefined,
    note: r.note || undefined,
    createdAt: r.created_at || new Date().toISOString(),
  };
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const supabase = createClient();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [investments, setInvestments] = useState<InvestmentHolding[]>([]);
  const [investmentTransactions, setInvestmentTransactions] = useState<InvestmentTransaction[]>([]);
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load data from Supabase when user is logged in, or LocalStorage when guest
  useEffect(() => {
    setIsHydrated(false);

    if (!supabase || !user) {
      // Guest mode / LocalStorage fallback
      try {
        const savedAccounts = localStorage.getItem("krapao_accounts");
        const savedTransactions = localStorage.getItem("krapao_transactions");
        const savedCreditCards = localStorage.getItem("krapao_credit_cards");
        const savedSubscriptions = localStorage.getItem("krapao_subscriptions");
        const savedLoans = localStorage.getItem("krapao_loans");
        const savedInvestments = localStorage.getItem("krapao_investments");
        const savedInvTxs = localStorage.getItem("krapao_investment_txs");

        setAccounts(savedAccounts ? JSON.parse(savedAccounts) : []);
        setTransactions(savedTransactions ? JSON.parse(savedTransactions) : []);
        setCreditCards(savedCreditCards ? JSON.parse(savedCreditCards) : []);
        setSubscriptions(savedSubscriptions ? JSON.parse(savedSubscriptions) : []);
        setLoans(savedLoans ? JSON.parse(savedLoans) : []);
        setInvestments(savedInvestments ? JSON.parse(savedInvestments) : []);
        setInvestmentTransactions(savedInvTxs ? JSON.parse(savedInvTxs) : []);
      } catch (e) {
        console.error("Failed to load local finance data:", e);
      } finally {
        setIsHydrated(true);
      }
      return;
    }

    let isMounted = true;

    async function loadSupabaseData() {
      try {
        const [
          { data: dbAccounts },
          { data: dbCards },
          { data: dbSubs },
          { data: dbTxs },
          { data: dbLoans },
          { data: dbInvs },
          { data: dbInvTxs },
        ] = await Promise.all([
          supabase!.from("accounts").select("*").eq("user_id", user!.id),
          supabase!.from("credit_cards").select("*").eq("user_id", user!.id),
          supabase!.from("subscriptions").select("*").eq("user_id", user!.id),
          supabase!.from("transactions").select("*").eq("user_id", user!.id).order("date", { ascending: false }),
          supabase!.from("loans").select("*, repayments:loan_repayments(*)").eq("user_id", user!.id),
          supabase!.from("investments").select("*").eq("user_id", user!.id),
          supabase!.from("investment_transactions").select("*").eq("user_id", user!.id),
        ]);

        if (!isMounted) return;

        const loadedAccounts = (dbAccounts || []).map(mapAccountRow);
        const loadedCards = (dbCards || []).map(mapCreditCardRow);
        const loadedTxs = (dbTxs || []).map(mapTransactionRow);

        // Merge cards from DB with current state so credit cards are never lost if DB is empty
        const allCardsMap = new Map<string, CreditCard>();
        creditCards.forEach((c) => allCardsMap.set(c.id, c));
        loadedCards.forEach((c) => allCardsMap.set(c.id, c));
        const mergedCards = Array.from(allCardsMap.values());

        // Recalculate credit card currentBalance based on transactions for perfect accuracy
        const updatedCards = mergedCards.map((card) => {
          const cardTxsSum = loadedTxs
            .filter((tx) => tx.creditCardId === card.id && tx.type === "expense")
            .reduce((sum, tx) => sum + Number(tx.amount), 0);

          const effectiveBalance = card.isPaidThisMonth
            ? card.currentBalance
            : Math.max(card.currentBalance, cardTxsSum);

          // Auto-sync balance to Supabase DB if mismatched
          if (effectiveBalance !== card.currentBalance && user && supabase && isValidUUID(card.id)) {
            supabase
              .from("credit_cards")
              .update({ current_balance: effectiveBalance })
              .eq("id", card.id)
              .eq("user_id", user.id)
              .then(({ error }) => {
                if (error) console.error("Failed to sync updated credit card balance:", error);
              });
          }

          return { ...card, currentBalance: effectiveBalance };
        });

        // Recalculate account balance from transactions if DB balance is 0 but income transactions exist
        const updatedAccounts = loadedAccounts.map((acc) => {
          const accTxsNet = loadedTxs
            .filter((tx) => !tx.creditCardId && tx.accountId === acc.id)
            .reduce((sum, tx) => {
              if (tx.type === "income") return sum + Number(tx.amount);
              if (tx.type === "expense") return sum - Number(tx.amount);
              return sum;
            }, 0);

          const effectiveBal = acc.balance === 0 && accTxsNet > 0 ? accTxsNet : acc.balance;

          if (effectiveBal !== acc.balance && user && supabase && isValidUUID(acc.id)) {
            syncAccountBalanceToDb(acc.id, effectiveBal);
          }

          return { ...acc, balance: effectiveBal };
        });

        setAccounts(updatedAccounts);
        setCreditCards(updatedCards);
        setSubscriptions((dbSubs || []).map(mapSubscriptionRow));
        setTransactions(loadedTxs);
        setLoans((dbLoans || []).map(mapLoanRow));
        setInvestments((dbInvs || []).map(mapInvestmentRow));
        setInvestmentTransactions((dbInvTxs || []).map(mapInvestmentTxRow));
      } catch (err) {
        console.error("Failed to load Supabase DB data:", err);
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    }

    loadSupabaseData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Save to localStorage when not authenticated
  useEffect(() => {
    if (!isHydrated || user) return;
    try {
      localStorage.setItem("krapao_accounts", JSON.stringify(accounts));
      localStorage.setItem("krapao_transactions", JSON.stringify(transactions));
      localStorage.setItem("krapao_credit_cards", JSON.stringify(creditCards));
      localStorage.setItem("krapao_subscriptions", JSON.stringify(subscriptions));
      localStorage.setItem("krapao_loans", JSON.stringify(loans));
      localStorage.setItem("krapao_investments", JSON.stringify(investments));
      localStorage.setItem("krapao_investment_txs", JSON.stringify(investmentTransactions));
    } catch (e) {
      console.error("Failed to save local finance data:", e);
    }
  }, [accounts, transactions, creditCards, subscriptions, loans, investments, investmentTransactions, isHydrated, user]);

  // Calculate Monthly Summary
  const summary: MonthlySummary = React.useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      // Credit card swipes are liabilities, not direct cash outflow from accounts
      if (!tx.creditCardId) {
        if (tx.type === "income") totalIncome += Number(tx.amount);
        if (tx.type === "expense") totalExpense += Number(tx.amount);
      }
    });

    const totalCreditCardDebt = creditCards.reduce(
      (sum, card) => sum + Number(card.currentBalance),
      0
    );

    const monthlySubscriptionTotal = subscriptions
      .filter((s) => s.isActive)
      .reduce((sum, sub) => {
        const amt = Number(sub.amount);
        return sum + (sub.billingCycle === "yearly" ? amt / 12 : amt);
      }, 0);

    const totalLentPending = loans
      .filter((l) => l.status !== "paid")
      .reduce(
        (sum, l) => sum + Math.max(0, Number(l.originalAmount) - Number(l.totalPaid)),
        0
      );

    let totalInvestmentValue = 0;
    let totalInvestmentCost = 0;

    investments.forEach((inv) => {
      const rate = inv.currency === "USD" ? Number(inv.exchangeRate) || 35.5 : 1;
      const costTHB = Number(inv.units) * Number(inv.avgBuyPrice) * rate;
      const valueTHB = Number(inv.units) * Number(inv.currentPrice) * rate;
      totalInvestmentCost += costTHB;
      totalInvestmentValue += valueTHB;
    });

    const totalInvestmentProfitLoss = totalInvestmentValue - totalInvestmentCost;

    return {
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      totalCreditCardDebt,
      monthlySubscriptionTotal,
      totalLentPending,
      totalInvestmentValue,
      totalInvestmentCost,
      totalInvestmentProfitLoss,
    };
  }, [transactions, creditCards, subscriptions, loans, investments]);

  // Sync account balance helper to Supabase
  const syncAccountBalanceToDb = async (accId: string, updatedBalance: number) => {
    if (!user || !supabase || !isValidUUID(accId)) return;
    try {
      await supabase
        .from("accounts")
        .update({ balance: updatedBalance })
        .eq("id", accId)
        .eq("user_id", user.id);
    } catch (e) {
      console.error("Failed to sync account balance to DB:", e);
    }
  };

  // Sync credit card balance helper to Supabase
  const syncCreditCardToDb = async (cardId: string, balance: number, isPaid: boolean) => {
    if (!user || !supabase || !isValidUUID(cardId)) return;
    try {
      await supabase
        .from("credit_cards")
        .update({ current_balance: balance, is_paid_this_month: isPaid })
        .eq("id", cardId)
        .eq("user_id", user.id);
    } catch (e) {
      console.error("Failed to sync credit card to DB:", e);
    }
  };

  const addTransaction = (txData: Omit<Transaction, "id">) => {
    const newId = generateUUID();
    const newTx: Transaction = {
      ...txData,
      id: newId,
    };

    setTransactions((prev) => [newTx, ...prev]);

    let updatedAccountBalance: number | null = null;
    let updatedToAccountBalance: number | null = null;

    // Update account balance optimistically (only for non-credit card transactions)
    setAccounts((prev) =>
      prev.map((acc) => {
        if (!newTx.creditCardId && newTx.accountId && acc.id === newTx.accountId) {
          let newBal = Number(acc.balance);
          if (newTx.type === "income") newBal += Number(newTx.amount);
          else if (newTx.type === "expense" || newTx.type === "transfer") newBal -= Number(newTx.amount);
          updatedAccountBalance = newBal;
          if (user && supabase && isValidUUID(acc.id)) {
            syncAccountBalanceToDb(acc.id, newBal);
          }
          return { ...acc, balance: newBal };
        }
        if (newTx.type === "transfer" && acc.id === newTx.toAccountId) {
          const newBal = Number(acc.balance) + Number(newTx.amount);
          updatedToAccountBalance = newBal;
          if (user && supabase && isValidUUID(acc.id)) {
            syncAccountBalanceToDb(acc.id, newBal);
          }
          return { ...acc, balance: newBal };
        }
        return acc;
      })
    );

    let updatedCardBalance: number | null = null;

    // If transaction linked to credit card
    if (newTx.creditCardId && newTx.type === "expense") {
      setCreditCards((prev) =>
        prev.map((c) => {
          if (c.id === newTx.creditCardId) {
            const newBal = Number(c.currentBalance) + Number(newTx.amount);
            updatedCardBalance = newBal;
            if (user && supabase && isValidUUID(c.id)) {
              syncCreditCardToDb(c.id, newBal, false);
            }
            return { ...c, currentBalance: newBal, isPaidThisMonth: false };
          }
          return c;
        })
      );
    }

    if (user && supabase) {
      const payload = {
        id: newId,
        user_id: user.id,
        type: newTx.type,
        amount: newTx.amount,
        account_id: isValidUUID(newTx.accountId) ? newTx.accountId : null,
        to_account_id: newTx.toAccountId && isValidUUID(newTx.toAccountId) ? newTx.toAccountId : null,
        category_id: newTx.categoryId && isValidUUID(newTx.categoryId) ? newTx.categoryId : null,
        category_name: newTx.categoryName || null,
        category_icon: newTx.categoryIcon || null,
        credit_card_id: newTx.creditCardId && isValidUUID(newTx.creditCardId) ? newTx.creditCardId : null,
        date: newTx.date,
        note: newTx.note || null,
        slip_url: newTx.slipUrl || null,
        tags: newTx.tags || null,
      };

      const syncAndInsert = async () => {
        try {
          // Auto-upsert linked credit card to DB if missing from foreign table
          if (payload.credit_card_id) {
            const cardObj = creditCards.find((c) => c.id === payload.credit_card_id);
            if (cardObj) {
              const cardBal = updatedCardBalance !== null ? updatedCardBalance : (Number(cardObj.currentBalance) + Number(newTx.amount));
              await supabase.from("credit_cards").upsert({
                id: cardObj.id,
                user_id: user.id,
                name: cardObj.name,
                bank: cardObj.bank,
                last_four_digits: cardObj.lastFourDigits,
                credit_limit: cardObj.creditLimit,
                current_balance: cardBal,
                statement_day: cardObj.statementDay,
                due_day: cardObj.dueDay,
                card_color: cardObj.cardColor,
                is_paid_this_month: false,
              }, { onConflict: "id" });
            }
          }

          // Auto-upsert linked primary account to DB if missing from foreign table
          if (payload.account_id) {
            const accObj = accounts.find((a) => a.id === payload.account_id);
            if (accObj) {
              let computedBal = Number(accObj.balance);
              if (newTx.type === "income") computedBal += Number(newTx.amount);
              else if (newTx.type === "expense" || newTx.type === "transfer") computedBal -= Number(newTx.amount);
              const accBal = updatedAccountBalance !== null ? updatedAccountBalance : computedBal;

              await supabase.from("accounts").upsert({
                id: accObj.id,
                user_id: user.id,
                name: accObj.name,
                type: accObj.type,
                balance: accBal,
                currency: accObj.currency || "THB",
                icon: accObj.icon || null,
                color: accObj.color || null,
                account_number: accObj.accountNumber || null,
                bank_name: accObj.bankName || null,
              }, { onConflict: "id" });
            }
          }

          // Auto-upsert target transfer account to DB if missing from foreign table
          if (payload.to_account_id) {
            const toAccObj = accounts.find((a) => a.id === payload.to_account_id);
            if (toAccObj) {
              const computedToBal = Number(toAccObj.balance) + Number(newTx.amount);
              const toAccBal = updatedToAccountBalance !== null ? updatedToAccountBalance : computedToBal;

              await supabase.from("accounts").upsert({
                id: toAccObj.id,
                user_id: user.id,
                name: toAccObj.name,
                type: toAccObj.type,
                balance: toAccBal,
                currency: toAccObj.currency || "THB",
                icon: toAccObj.icon || null,
                color: toAccObj.color || null,
                account_number: toAccObj.accountNumber || null,
                bank_name: toAccObj.bankName || null,
              }, { onConflict: "id" });
            }
          }

          // Insert transaction into Supabase
          const { error } = await supabase.from("transactions").insert(payload);
          if (error) {
            console.error("Primary transaction insert failed:", error);
            // Fallback for foreign key or constraint error: retry with sanitized foreign keys
            if (error.code === "23503" || error.code === "23502") {
              const fallbackPayload = {
                ...payload,
                account_id: null,
                credit_card_id: null,
              };
              const { error: fallbackErr } = await supabase.from("transactions").insert(fallbackPayload);
              if (fallbackErr) {
                console.error("Fallback transaction insert also failed:", fallbackErr);
              }
            }
          }
        } catch (e) {
          console.error("Error during transaction sync:", e);
        }
      };

      syncAndInsert();
    }
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    // Revert account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        let newBal = Number(acc.balance);
        let changed = false;
        if (!target.creditCardId && target.accountId && acc.id === target.accountId) {
          changed = true;
          if (target.type === "income") newBal -= Number(target.amount);
          else if (target.type === "expense" || target.type === "transfer") newBal += Number(target.amount);
        }
        if (target.type === "transfer" && acc.id === target.toAccountId) {
          changed = true;
          newBal -= Number(target.amount);
        }
        if (changed && user && supabase && isValidUUID(acc.id)) {
          syncAccountBalanceToDb(acc.id, newBal);
        }
        return changed ? { ...acc, balance: newBal } : acc;
      })
    );

    // Revert credit card balance if deleted transaction was credit card expense
    if (target.creditCardId && target.type === "expense") {
      setCreditCards((prev) =>
        prev.map((c) => {
          if (c.id === target.creditCardId) {
            const newBal = Math.max(0, Number(c.currentBalance) - Number(target.amount));
            if (user && supabase && isValidUUID(c.id)) {
              syncCreditCardToDb(c.id, newBal, false);
            }
            return { ...c, currentBalance: newBal };
          }
          return c;
        })
      );
    }

    if (user && supabase && isValidUUID(id)) {
      supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id).then(({ error }) => {
        if (error) console.error("Failed to delete transaction from Supabase:", error);
      });
    }
  };



  const addAccount = (accData: Omit<Account, "id">) => {
    const newId = generateUUID();
    const newAcc: Account = {
      ...accData,
      id: newId,
    };
    setAccounts((prev) => [...prev, newAcc]);

    if (user && supabase) {
      supabase
        .from("accounts")
        .insert({
          id: newId,
          user_id: user.id,
          name: newAcc.name,
          type: newAcc.type,
          balance: newAcc.balance,
          currency: newAcc.currency,
          icon: newAcc.icon || null,
          color: newAcc.color || null,
          account_number: newAcc.accountNumber || null,
          bank_name: newAcc.bankName || null,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to insert account in Supabase:", error);
        });
    }
  };

  const updateAccount = (id: string, partial: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...partial } : acc))
    );

    if (user && supabase && isValidUUID(id)) {
      const payload: any = {};
      if (partial.name !== undefined) payload.name = partial.name;
      if (partial.type !== undefined) payload.type = partial.type;
      if (partial.balance !== undefined) payload.balance = partial.balance;
      if (partial.currency !== undefined) payload.currency = partial.currency;
      if (partial.icon !== undefined) payload.icon = partial.icon;
      if (partial.color !== undefined) payload.color = partial.color;
      if (partial.accountNumber !== undefined) payload.account_number = partial.accountNumber;
      if (partial.bankName !== undefined) payload.bank_name = partial.bankName;

      supabase
        .from("accounts")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id)
        .then(({ error }) => {
          if (error) console.error("Failed to update account in Supabase:", error);
        });
    }
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));

    if (user && supabase && isValidUUID(id)) {
      supabase.from("accounts").delete().eq("id", id).eq("user_id", user.id).then(({ error }) => {
        if (error) console.error("Failed to delete account from Supabase:", error);
      });
    }
  };

  const addCreditCard = (cardData: Omit<CreditCard, "id">) => {
    const newId = generateUUID();
    const newCard: CreditCard = {
      ...cardData,
      id: newId,
    };
    setCreditCards((prev) => [...prev, newCard]);

    if (user && supabase) {
      supabase
        .from("credit_cards")
        .insert({
          id: newId,
          user_id: user.id,
          name: newCard.name,
          bank: newCard.bank,
          last_four_digits: newCard.lastFourDigits,
          credit_limit: newCard.creditLimit,
          current_balance: newCard.currentBalance,
          statement_day: newCard.statementDay,
          due_day: newCard.dueDay,
          card_color: newCard.cardColor,
          is_paid_this_month: newCard.isPaidThisMonth || false,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to insert credit card in Supabase:", error);
        });
    }
  };

  const payCreditCard = (cardId: string, fromAccountId: string, amount: number) => {
    const card = creditCards.find((c) => c.id === cardId);
    if (!card) return;

    // Update credit card balance
    let updatedCardBal = 0;
    setCreditCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          updatedCardBal = Math.max(0, Number(c.currentBalance) - Number(amount));
          return {
            ...c,
            currentBalance: updatedCardBal,
            isPaidThisMonth: true,
          };
        }
        return c;
      })
    );

    // Create payment transaction record (addTransaction handles account deduction & DB sync)
    addTransaction({
      type: "expense",
      amount,
      accountId: fromAccountId,
      categoryId: "cat-7",
      categoryName: `ชำระบิลบัตรเครดิต (${card.name})`,
      categoryIcon: "CreditCard",
      date: new Date().toISOString().split("T")[0],
      note: `ชำระยอดบัตร ${card.bank} ${card.name} (••${card.lastFourDigits})`,
    });

    if (user && supabase && isValidUUID(cardId)) {
      syncCreditCardToDb(cardId, updatedCardBal, true);
    }
  };

  const deleteCreditCard = (id: string) => {
    setCreditCards((prev) => prev.filter((c) => c.id !== id));

    if (user && supabase && isValidUUID(id)) {
      supabase.from("credit_cards").delete().eq("id", id).eq("user_id", user.id).then(({ error }) => {
        if (error) console.error("Failed to delete credit card from Supabase:", error);
      });
    }
  };

  const addSubscription = (subData: Omit<Subscription, "id">) => {
    const newId = generateUUID();
    const newSub: Subscription = {
      ...subData,
      id: newId,
    };
    setSubscriptions((prev) => [...prev, newSub]);

    if (user && supabase) {
      supabase
        .from("subscriptions")
        .insert({
          id: newId,
          user_id: user.id,
          name: newSub.name,
          amount: newSub.amount,
          currency: newSub.currency,
          billing_cycle: newSub.billingCycle,
          category: newSub.category,
          next_billing_date: newSub.nextBillingDate,
          icon: newSub.icon,
          color: newSub.color,
          is_active: newSub.isActive,
          linked_account_id: newSub.linkedAccountId && isValidUUID(newSub.linkedAccountId) ? newSub.linkedAccountId : null,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to insert subscription in Supabase:", error);
        });
    }
  };

  const toggleSubscription = (id: string) => {
    let nextState = false;
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          nextState = !s.isActive;
          return { ...s, isActive: nextState };
        }
        return s;
      })
    );

    if (user && supabase && isValidUUID(id)) {
      supabase
        .from("subscriptions")
        .update({ is_active: nextState })
        .eq("id", id)
        .eq("user_id", user.id)
        .then(({ error }) => {
          if (error) console.error("Failed to toggle subscription in Supabase:", error);
        });
    }
  };

  const updateSubscription = (id: string, partial: Partial<Subscription>) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...partial } : s))
    );

    if (user && supabase && isValidUUID(id)) {
      const payload: any = {};
      if (partial.name !== undefined) payload.name = partial.name;
      if (partial.amount !== undefined) payload.amount = partial.amount;
      if (partial.currency !== undefined) payload.currency = partial.currency;
      if (partial.billingCycle !== undefined) payload.billing_cycle = partial.billingCycle;
      if (partial.category !== undefined) payload.category = partial.category;
      if (partial.nextBillingDate !== undefined) payload.next_billing_date = partial.nextBillingDate;
      if (partial.icon !== undefined) payload.icon = partial.icon;
      if (partial.color !== undefined) payload.color = partial.color;
      if (partial.isActive !== undefined) payload.is_active = partial.isActive;
      if (partial.linkedAccountId !== undefined) {
        payload.linked_account_id = partial.linkedAccountId && isValidUUID(partial.linkedAccountId) ? partial.linkedAccountId : null;
      }

      supabase
        .from("subscriptions")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id)
        .then(({ error }) => {
          if (error) console.error("Failed to update subscription in Supabase:", error);
        });
    }
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));

    if (user && supabase && isValidUUID(id)) {
      supabase.from("subscriptions").delete().eq("id", id).eq("user_id", user.id).then(({ error }) => {
        if (error) console.error("Failed to delete subscription from Supabase:", error);
      });
    }
  };

  const addLoan = (
    loanData: Omit<Loan, "id" | "totalPaid" | "status" | "repayments" | "createdAt">,
    deductFromAccount = true
  ) => {
    const newId = generateUUID();
    const newLoan: Loan = {
      ...loanData,
      id: newId,
      totalPaid: 0,
      status: "pending",
      repayments: [],
      createdAt: new Date().toISOString(),
    };

    setLoans((prev) => [newLoan, ...prev]);

    if (user && supabase) {
      supabase
        .from("loans")
        .insert({
          id: newId,
          user_id: user.id,
          borrower_name: newLoan.borrowerName,
          borrower_contact: newLoan.borrowerContact || null,
          original_amount: newLoan.originalAmount,
          total_paid: 0,
          lent_date: newLoan.lentDate,
          due_date: newLoan.dueDate || null,
          from_account_id: newLoan.fromAccountId && isValidUUID(newLoan.fromAccountId) ? newLoan.fromAccountId : null,
          note: newLoan.note || null,
          status: "pending",
        })
        .then(({ error }) => {
          if (error) console.error("Failed to insert loan in Supabase:", error);
        });
    }

    if (deductFromAccount && newLoan.fromAccountId) {
      addTransaction({
        type: "expense",
        amount: newLoan.originalAmount,
        accountId: newLoan.fromAccountId,
        categoryId: "cat-12",
        categoryName: `เงินให้ยืม (${newLoan.borrowerName})`,
        categoryIcon: "HandCoins",
        date: newLoan.lentDate,
        note: newLoan.note ? `ให้ยืม: ${newLoan.note}` : `ให้ ${newLoan.borrowerName} ยืมเงิน`,
      });
    }
  };

  const recordRepayment = (
    loanId: string,
    repaymentData: { amount: number; date: string; toAccountId?: string; note?: string },
    depositToAccount = true
  ) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    const repaymentAmount = Number(repaymentData.amount);
    const newRepId = generateUUID();
    const newRepayment: LoanRepayment = {
      id: newRepId,
      amount: repaymentAmount,
      date: repaymentData.date,
      toAccountId: repaymentData.toAccountId,
      note: repaymentData.note,
      createdAt: new Date().toISOString(),
    };

    const updatedRepayments = [newRepayment, ...targetLoan.repayments];
    const newTotalPaid = updatedRepayments.reduce((sum, r) => sum + Number(r.amount), 0);
    const newStatus: LoanStatus = newTotalPaid >= targetLoan.originalAmount ? "paid" : "partial";

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              totalPaid: newTotalPaid,
              status: newStatus,
              repayments: updatedRepayments,
            }
          : l
      )
    );

    if (user && supabase && isValidUUID(loanId)) {
      supabase
        .from("loan_repayments")
        .insert({
          id: newRepId,
          loan_id: loanId,
          user_id: user.id,
          amount: repaymentAmount,
          date: repaymentData.date,
          to_account_id: repaymentData.toAccountId && isValidUUID(repaymentData.toAccountId) ? repaymentData.toAccountId : null,
          note: repaymentData.note || null,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to insert loan repayment in Supabase:", error);
        });

      supabase
        .from("loans")
        .update({ total_paid: newTotalPaid, status: newStatus })
        .eq("id", loanId)
        .eq("user_id", user.id)
        .then(({ error }) => {
          if (error) console.error("Failed to update loan status in Supabase:", error);
        });
    }

    if (depositToAccount && repaymentData.toAccountId) {
      addTransaction({
        type: "income",
        amount: repaymentAmount,
        accountId: repaymentData.toAccountId,
        categoryId: "cat-13",
        categoryName: `รับคืนเงินยืม (${targetLoan.borrowerName})`,
        categoryIcon: "HandCoins",
        date: repaymentData.date,
        note: repaymentData.note ? `คืนเงิน: ${repaymentData.note}` : `${targetLoan.borrowerName} คืนเงิน`,
      });
    }
  };

  const deleteRepayment = (loanId: string, repaymentId: string) => {
    let newTotalPaid = 0;
    let newStatus: LoanStatus = "pending";

    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId) return l;
        const updatedRepayments = l.repayments.filter((r) => r.id !== repaymentId);
        newTotalPaid = updatedRepayments.reduce((sum, r) => sum + Number(r.amount), 0);
        newStatus =
          newTotalPaid >= l.originalAmount
            ? "paid"
            : newTotalPaid > 0
            ? "partial"
            : "pending";
        return {
          ...l,
          totalPaid: newTotalPaid,
          status: newStatus,
          repayments: updatedRepayments,
        };
      })
    );

    if (user && supabase && isValidUUID(repaymentId)) {
      supabase.from("loan_repayments").delete().eq("id", repaymentId).eq("user_id", user.id).then(({ error }) => {
        if (error) console.error("Failed to delete loan repayment from Supabase:", error);
      });

      if (isValidUUID(loanId)) {
        supabase
          .from("loans")
          .update({ total_paid: newTotalPaid, status: newStatus })
          .eq("id", loanId)
          .eq("user_id", user.id)
          .then(({ error }) => {
            if (error) console.error("Failed to update loan after repayment deletion in Supabase:", error);
          });
      }
    }
  };

  const updateLoan = (id: string, partial: Partial<Loan>) => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const updated = { ...l, ...partial };
        if (partial.originalAmount !== undefined) {
          const totalPaid = updated.totalPaid || 0;
          updated.status = totalPaid >= updated.originalAmount ? "paid" : totalPaid > 0 ? "partial" : "pending";
        }
        return updated;
      })
    );

    if (user && supabase && isValidUUID(id)) {
      const payload: any = {};
      if (partial.borrowerName !== undefined) payload.borrower_name = partial.borrowerName;
      if (partial.borrowerContact !== undefined) payload.borrower_contact = partial.borrowerContact;
      if (partial.originalAmount !== undefined) payload.original_amount = partial.originalAmount;
      if (partial.lentDate !== undefined) payload.lent_date = partial.lentDate;
      if (partial.dueDate !== undefined) payload.due_date = partial.dueDate;
      if (partial.note !== undefined) payload.note = partial.note;

      supabase.from("loans").update(payload).eq("id", id).eq("user_id", user.id).then(({ error }) => {
        if (error) console.error("Failed to update loan in Supabase:", error);
      });
    }
  };

  const deleteLoan = (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));

    if (user && supabase && isValidUUID(id)) {
      supabase.from("loans").delete().eq("id", id).eq("user_id", user.id).then(({ error }) => {
        if (error) console.error("Failed to delete loan from Supabase:", error);
      });
    }
  };

  const addInvestmentHolding = (
    holdingData: Omit<InvestmentHolding, "id" | "updatedAt">,
    deductFromAccount = false,
    accountId?: string
  ) => {
    const newId = generateUUID();
    const newHolding: InvestmentHolding = {
      ...holdingData,
      id: newId,
      updatedAt: new Date().toISOString(),
    };

    setInvestments((prev) => [newHolding, ...prev]);

    if (user && supabase) {
      supabase
        .from("investments")
        .insert({
          id: newId,
          user_id: user.id,
          symbol: newHolding.symbol,
          name: newHolding.name,
          platform: newHolding.platform,
          platform_name: newHolding.platformName || null,
          asset_type: newHolding.assetType,
          units: newHolding.units,
          avg_buy_price: newHolding.avgBuyPrice,
          current_price: newHolding.currentPrice,
          currency: newHolding.currency,
          exchange_rate: newHolding.exchangeRate,
          note: newHolding.note || null,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to insert investment in Supabase:", error);
        });
    }

    const initialTradeAmount = Number(holdingData.units) * Number(holdingData.avgBuyPrice);
    if (initialTradeAmount > 0) {
      const itxId = generateUUID();
      const initialTx: InvestmentTransaction = {
        id: itxId,
        holdingId: newId,
        symbol: holdingData.symbol,
        type: "buy",
        units: Number(holdingData.units),
        pricePerUnit: Number(holdingData.avgBuyPrice),
        totalAmount: initialTradeAmount,
        exchangeRate: holdingData.exchangeRate || 35.5,
        date: new Date().toISOString().split("T")[0],
        fromAccountId: accountId,
        note: `เปิดสถานะ ${holdingData.symbol} บน ${holdingData.platformName || holdingData.platform}`,
        createdAt: new Date().toISOString(),
      };
      setInvestmentTransactions((prev) => [initialTx, ...prev]);

      if (user && supabase) {
        supabase
          .from("investment_transactions")
          .insert({
            id: itxId,
            holding_id: newId,
            user_id: user.id,
            symbol: holdingData.symbol,
            type: "buy",
            units: Number(holdingData.units),
            price_per_unit: Number(holdingData.avgBuyPrice),
            total_amount: initialTradeAmount,
            exchange_rate: holdingData.exchangeRate || 35.5,
            date: new Date().toISOString().split("T")[0],
            from_account_id: accountId && isValidUUID(accountId) ? accountId : null,
            note: initialTx.note || null,
          })
          .then(({ error }) => {
            if (error) console.error("Failed to insert initial investment trade in Supabase:", error);
          });
      }
    }

    if (deductFromAccount && accountId && initialTradeAmount > 0) {
      const rate = holdingData.currency === "USD" ? Number(holdingData.exchangeRate) || 35.5 : 1;
      const thbAmount = initialTradeAmount * rate;

      addTransaction({
        type: "expense",
        amount: thbAmount,
        accountId: accountId,
        categoryId: "cat-10",
        categoryName: "ปันผล / การลงทุน",
        categoryIcon: "TrendingUp",
        date: new Date().toISOString().split("T")[0],
        note: `ลงทุนใน ${holdingData.symbol} (${holdingData.platformName || holdingData.platform})`,
      });
    }
  };

  const updateInvestmentHolding = (id: string, partial: Partial<InvestmentHolding>) => {
    setInvestments((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, ...partial, updatedAt: new Date().toISOString() } : h
      )
    );

    if (user && supabase && isValidUUID(id)) {
      const payload: any = {};
      if (partial.symbol !== undefined) payload.symbol = partial.symbol;
      if (partial.name !== undefined) payload.name = partial.name;
      if (partial.platform !== undefined) payload.platform = partial.platform;
      if (partial.platformName !== undefined) payload.platform_name = partial.platformName;
      if (partial.assetType !== undefined) payload.asset_type = partial.assetType;
      if (partial.units !== undefined) payload.units = partial.units;
      if (partial.avgBuyPrice !== undefined) payload.avg_buy_price = partial.avgBuyPrice;
      if (partial.currentPrice !== undefined) payload.current_price = partial.currentPrice;
      if (partial.currency !== undefined) payload.currency = partial.currency;
      if (partial.exchangeRate !== undefined) payload.exchange_rate = partial.exchangeRate;
      if (partial.note !== undefined) payload.note = partial.note;

      supabase.from("investments").update(payload).eq("id", id).eq("user_id", user.id).then(({ error }) => {
        if (error) console.error("Failed to update investment in Supabase:", error);
      });
    }
  };

  const updateHoldingPrice = (id: string, newPrice: number) => {
    setInvestments((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, currentPrice: Number(newPrice), updatedAt: new Date().toISOString() }
          : h
      )
    );

    if (user && supabase && isValidUUID(id)) {
      supabase
        .from("investments")
        .update({ current_price: Number(newPrice) })
        .eq("id", id)
        .eq("user_id", user.id)
        .then(({ error }) => {
          if (error) console.error("Failed to update holding price in Supabase:", error);
        });
    }
  };

  const recordInvestmentTrade = (
    holdingId: string,
    trade: {
      type: InvestmentTradeType;
      units: number;
      pricePerUnit: number;
      date: string;
      fromAccountId?: string;
      note?: string;
    },
    syncAccount = false
  ) => {
    const holding = investments.find((h) => h.id === holdingId);
    if (!holding) return;

    const totalAmount = Number(trade.units) * Number(trade.pricePerUnit);
    const rate = holding.currency === "USD" ? Number(holding.exchangeRate) || 35.5 : 1;
    const itxId = generateUUID();

    const newTx: InvestmentTransaction = {
      id: itxId,
      holdingId,
      symbol: holding.symbol,
      type: trade.type,
      units: Number(trade.units),
      pricePerUnit: Number(trade.pricePerUnit),
      totalAmount,
      exchangeRate: rate,
      date: trade.date,
      fromAccountId: trade.fromAccountId,
      note: trade.note,
      createdAt: new Date().toISOString(),
    };

    setInvestmentTransactions((prev) => [newTx, ...prev]);

    let updatedUnits = holding.units;
    let updatedAvg = holding.avgBuyPrice;

    setInvestments((prev) =>
      prev.map((h) => {
        if (h.id !== holdingId) return h;

        if (trade.type === "buy") {
          const prevTotalCost = Number(h.units) * Number(h.avgBuyPrice);
          const newTradeCost = Number(trade.units) * Number(trade.pricePerUnit);
          updatedUnits = Number(h.units) + Number(trade.units);
          updatedAvg = updatedUnits > 0 ? (prevTotalCost + newTradeCost) / updatedUnits : Number(trade.pricePerUnit);

          return {
            ...h,
            units: updatedUnits,
            avgBuyPrice: Math.round(updatedAvg * 10000) / 10000,
            currentPrice: Number(trade.pricePerUnit),
            updatedAt: new Date().toISOString(),
          };
        } else if (trade.type === "sell") {
          updatedUnits = Math.max(0, Number(h.units) - Number(trade.units));
          return {
            ...h,
            units: updatedUnits,
            currentPrice: Number(trade.pricePerUnit),
            updatedAt: new Date().toISOString(),
          };
        }
        return h;
      })
    );

    if (user && supabase && isValidUUID(holdingId)) {
      supabase
        .from("investment_transactions")
        .insert({
          id: itxId,
          holding_id: holdingId,
          user_id: user.id,
          symbol: holding.symbol,
          type: trade.type,
          units: Number(trade.units),
          price_per_unit: Number(trade.pricePerUnit),
          total_amount: totalAmount,
          exchange_rate: rate,
          date: trade.date,
          from_account_id: trade.fromAccountId && isValidUUID(trade.fromAccountId) ? trade.fromAccountId : null,
          note: trade.note || null,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to insert investment trade in Supabase:", error);
        });

      supabase
        .from("investments")
        .update({
          units: updatedUnits,
          avg_buy_price: Math.round(updatedAvg * 10000) / 10000,
          current_price: Number(trade.pricePerUnit),
        })
        .eq("id", holdingId)
        .eq("user_id", user.id)
        .then(({ error }) => {
          if (error) console.error("Failed to update investment holding in Supabase:", error);
        });
    }

    if (syncAccount && trade.fromAccountId) {
      const thbAmount = totalAmount * rate;
      if (trade.type === "buy") {
        addTransaction({
          type: "expense",
          amount: thbAmount,
          accountId: trade.fromAccountId,
          categoryId: "cat-10",
          categoryName: "ปันผล / การลงทุน",
          categoryIcon: "TrendingUp",
          date: trade.date,
          note: `ซื้อเพิ่ม ${holding.symbol} ${trade.units} หน่วย`,
        });
      } else if (trade.type === "sell") {
        addTransaction({
          type: "income",
          amount: thbAmount,
          accountId: trade.fromAccountId,
          categoryId: "cat-10",
          categoryName: "ปันผล / การลงทุน",
          categoryIcon: "TrendingUp",
          date: trade.date,
          note: `ขายสินทรัพย์ ${holding.symbol} ${trade.units} หน่วย`,
        });
      } else if (trade.type === "dividend") {
        addTransaction({
          type: "income",
          amount: thbAmount,
          accountId: trade.fromAccountId,
          categoryId: "cat-10",
          categoryName: "ปันผล / การลงทุน",
          categoryIcon: "TrendingUp",
          date: trade.date,
          note: `เงินปันผล/ผลตอบแทนจาก ${holding.symbol}`,
        });
      }
    }
  };

  const deleteInvestmentHolding = (id: string) => {
    setInvestments((prev) => prev.filter((h) => h.id !== id));
    setInvestmentTransactions((prev) => prev.filter((t) => t.holdingId !== id));

    if (user && supabase && isValidUUID(id)) {
      supabase.from("investments").delete().eq("id", id).eq("user_id", user.id).then(({ error }) => {
        if (error) console.error("Failed to delete investment from Supabase:", error);
      });
    }
  };

  const resetToDefaultData = () => {
    setAccounts([]);
    setTransactions([]);
    setCreditCards([]);
    setSubscriptions([]);
    setLoans([]);
    setInvestments([]);
    setInvestmentTransactions([]);
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        creditCards,
        subscriptions,
        loans,
        investments,
        investmentTransactions,
        categories,
        summary,
        isHydrated,
        addTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCreditCard,
        payCreditCard,
        deleteCreditCard,
        addSubscription,
        updateSubscription,
        toggleSubscription,
        deleteSubscription,
        addLoan,
        recordRepayment,
        deleteRepayment,
        updateLoan,
        deleteLoan,
        addInvestmentHolding,
        updateInvestmentHolding,
        updateHoldingPrice,
        recordInvestmentTrade,
        deleteInvestmentHolding,
        resetToDefaultData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
