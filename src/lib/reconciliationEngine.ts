// Reconciliation Engine - Compares Stripe Payouts with Bank Deposits

export interface ReconciliationItem {
  id: string;
  date: string;
  platform: 'Stripe' | 'Bank';
  grossAmount: number;
  fees: number;
  netPayout: number;
  actualBankDeposit?: number;
  variance: number;
  status: 'reconciled' | 'unreconciled' | 'pending';
  referenceId?: string;
}

export interface ReconciliationReport {
  totalItems: number;
  reconciledCount: number;
  unreconciledCount: number;
  pendingCount: number;
  totalGrossAmount: number;
  totalFees: number;
  totalNetPayout: number;
  totalActualBankDeposit: number;
  totalVariance: number;
  items: ReconciliationItem[];
}

export function calculateReconciliation(
  stripeTransactions: any[],
  bankTransactions: any[]
): ReconciliationReport {
  const items: ReconciliationItem[] = [];

  // Process Stripe transactions
  stripeTransactions.forEach(stripeTx => {
    const grossAmount = stripeTx.amount || 0;
    const fees = stripeTx.feeAmount || 0;
    const netPayout = grossAmount - fees;

    // Try to find matching bank transaction
    const matchingBankTx = bankTransactions.find(bankTx =>
      Math.abs(bankTx.amount - netPayout) < 0.01 &&
      Math.abs(new Date(bankTx.transactionDate).getTime() - new Date(stripeTx.transactionDate).getTime()) < 86400000 // Within 1 day
    );

    const actualBankDeposit = matchingBankTx?.amount;
    const variance = actualBankDeposit ? Math.abs(netPayout - actualBankDeposit) : netPayout;
    const status = matchingBankTx ? (variance < 0.01 ? 'reconciled' : 'unreconciled') : 'pending';

    items.push({
      id: stripeTx.id,
      date: stripeTx.transactionDate,
      platform: 'Stripe',
      grossAmount,
      fees,
      netPayout,
      actualBankDeposit,
      variance,
      status,
      referenceId: stripeTx.sourceId
    });
  });

  // Process bank transactions without matching Stripe transactions
  bankTransactions.forEach(bankTx => {
    const alreadyMatched = items.some(item =>
      item.actualBankDeposit === bankTx.amount &&
      Math.abs(new Date(item.date).getTime() - new Date(bankTx.transactionDate).getTime()) < 86400000
    );

    if (!alreadyMatched && bankTx.amount > 0) {
      items.push({
        id: bankTx.id,
        date: bankTx.transactionDate,
        platform: 'Bank',
        grossAmount: bankTx.amount,
        fees: 0,
        netPayout: bankTx.amount,
        actualBankDeposit: bankTx.amount,
        variance: 0,
        status: 'pending',
        referenceId: bankTx.sourceId
      });
    }
  });

  // Calculate totals
  const reconciledCount = items.filter(i => i.status === 'reconciled').length;
  const unreconciledCount = items.filter(i => i.status === 'unreconciled').length;
  const pendingCount = items.filter(i => i.status === 'pending').length;
  const totalGrossAmount = items.reduce((sum, i) => sum + i.grossAmount, 0);
  const totalFees = items.reduce((sum, i) => sum + i.fees, 0);
  const totalNetPayout = items.reduce((sum, i) => sum + i.netPayout, 0);
  const totalActualBankDeposit = items.reduce((sum, i) => sum + (i.actualBankDeposit || 0), 0);
  const totalVariance = items.reduce((sum, i) => sum + i.variance, 0);

  // Sort by date descending
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    totalItems: items.length,
    reconciledCount,
    unreconciledCount,
    pendingCount,
    totalGrossAmount,
    totalFees,
    totalNetPayout,
    totalActualBankDeposit,
    totalVariance,
    items
  };
}

export function getUnreconciledItems(report: ReconciliationReport): ReconciliationItem[] {
  return report.items.filter(item => item.status === 'unreconciled');
}

export function getPendingItems(report: ReconciliationReport): ReconciliationItem[] {
  return report.items.filter(item => item.status === 'pending');
}
