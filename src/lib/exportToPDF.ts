// PDF Export Functionality using jspdf

import jsPDF from 'jspdf';

export function exportScheduleCToPDF(scheduleCResult: any) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text('IRS Schedule C (Form 1040)', 20, 20);
  doc.setFontSize(12);
  doc.text('Profit or Loss from Business', 20, 30);

  // Line items
  let y = 50;
  const lineItems = [
    { line: '1', description: 'Gross receipts or sales', amount: scheduleCResult.line1_grossReceipts },
    { line: '4', description: 'Cost of goods sold', amount: scheduleCResult.line4_costOfGoodsSold },
    { line: '7', description: 'Gross profit', amount: scheduleCResult.line7_grossProfit },
    { line: '28', description: 'Total expenses', amount: scheduleCResult.line28_totalExpenses },
    { line: '29', description: 'Net profit (or loss)', amount: scheduleCResult.line29_netProfit },
  ];

  lineItems.forEach(item => {
    doc.setFontSize(10);
    doc.text(`Line ${item.line}:`, 20, y);
    doc.text(item.description, 50, y);
    doc.text(`$${item.amount.toFixed(2)}`, 180, y, { align: 'right' });
    y += 10;
  });

  // Detailed expenses
  y += 10;
  doc.setFontSize(12);
  doc.text('Expense Breakdown:', 20, y);
  y += 10;

  scheduleCResult.lineItems.forEach((item: any) => {
    doc.setFontSize(9);
    doc.text(`Line ${item.line}: ${item.description}`, 20, y);
    doc.text(`$${item.amount.toFixed(2)}`, 180, y, { align: 'right' });
    y += 8;
  });

  // Footer
  doc.setFontSize(8);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 280);

  doc.save(`ScheduleC_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportSalesTaxToPDF(salesData: any[]) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text('Sales Tax Summary', 20, 20);
  doc.setFontSize(12);
  doc.text('Breakdown by State', 20, 30);

  // Table header
  let y = 50;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('State', 20, y);
  doc.text('Total Sales', 80, y);
  doc.text('Tax Collected', 130, y);
  doc.text('Nexus Status', 170, y);
  y += 10;
  doc.setFont(undefined, 'normal');

  // State data
  salesData.forEach(state => {
    doc.text(state.stateCode, 20, y);
    doc.text(`$${state.totalSales.toFixed(2)}`, 80, y);
    doc.text(`$${state.taxCollected.toFixed(2)}`, 130, y);
    doc.text(state.nexusReached ? 'Reached' : 'Below Limit', 170, y);
    y += 8;
  });

  // Footer
  doc.setFontSize(8);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 280);

  doc.save(`SalesTaxSummary_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportReconciliationToPDF(report: any) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text('1099-NEC Reconciliation Report', 20, 20);
  doc.setFontSize(12);
  doc.text('Stripe Payouts vs Bank Deposits', 20, 30);

  // Summary
  let y = 50;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Summary:', 20, y);
  y += 10;
  doc.setFont(undefined, 'normal');
  doc.text(`Total Items: ${report.totalItems}`, 20, y);
  y += 8;
  doc.text(`Reconciled: ${report.reconciledCount}`, 20, y);
  y += 8;
  doc.text(`Unreconciled: ${report.unreconciledCount}`, 20, y);
  y += 8;
  doc.text(`Pending: ${report.pendingCount}`, 20, y);
  y += 8;
  doc.text(`Total Variance: $${report.totalVariance.toFixed(2)}`, 20, y);

  // Table header
  y += 15;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Date', 20, y);
  doc.text('Platform', 60, y);
  doc.text('Gross', 100, y);
  doc.text('Net', 130, y);
  doc.text('Bank', 160, y);
  doc.text('Variance', 190, y);
  y += 10;
  doc.setFont(undefined, 'normal');

  // Items
  report.items.forEach((item: any) => {
    doc.text(new Date(item.date).toLocaleDateString(), 20, y);
    doc.text(item.platform, 60, y);
    doc.text(`$${item.grossAmount.toFixed(2)}`, 100, y);
    doc.text(`$${item.netPayout.toFixed(2)}`, 130, y);
    doc.text(item.actualBankDeposit ? `$${item.actualBankDeposit.toFixed(2)}` : 'N/A', 160, y);
    doc.text(`$${item.variance.toFixed(2)}`, 190, y);
    y += 8;
  });

  // Footer
  doc.setFontSize(8);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 280);

  doc.save(`Reconciliation_${new Date().toISOString().split('T')[0]}.pdf`);
}
