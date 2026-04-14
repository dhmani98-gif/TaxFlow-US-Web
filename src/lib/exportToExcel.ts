// Excel Export Functionality using sheetjs

import * as XLSX from 'xlsx';

export interface ExcelExportData {
  filename: string;
  sheetName: string;
  data: any[];
}

export function exportToExcel(data: ExcelExportData) {
  try {
    // Create a workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data.data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, data.sheetName);

    // Generate Excel file
    XLSX.writeFile(workbook, `${data.filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

// Export Schedule C to Excel
export function exportScheduleCToExcel(scheduleCResult: any) {
  const data = [
    {
      'Line': '1',
      'Description': 'Gross receipts or sales',
      'Amount': scheduleCResult.line1_grossReceipts
    },
    {
      'Line': '4',
      'Description': 'Cost of goods sold',
      'Amount': scheduleCResult.line4_costOfGoodsSold
    },
    {
      'Line': '7',
      'Description': 'Gross profit',
      'Amount': scheduleCResult.line7_grossProfit
    },
    {
      'Line': '28',
      'Description': 'Total expenses',
      'Amount': scheduleCResult.line28_totalExpenses
    },
    {
      'Line': '29',
      'Description': 'Net profit (or loss)',
      'Amount': scheduleCResult.line29_netProfit
    },
    ...scheduleCResult.lineItems.map((item: any) => ({
      'Line': item.line,
      'Description': item.description,
      'Amount': item.amount
    }))
  ];

  exportToExcel({
    filename: `ScheduleC_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Schedule C',
    data
  });
}

// Export Sales Tax Summary to Excel
export function exportSalesTaxToExcel(salesData: any[]) {
  const data = salesData.map(state => ({
    'State Code': state.stateCode,
    'State Name': state.stateName,
    'Total Sales': state.totalSales,
    'Tax Collected': state.taxCollected,
    'Nexus Threshold': state.nexusThreshold,
    'Nexus Reached': state.nexusReached ? 'Yes' : 'No',
    'Percentage': `${state.percentage.toFixed(1)}%`
  }));

  exportToExcel({
    filename: `SalesTaxSummary_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Sales Tax',
    data
  });
}

// Export Reconciliation Report to Excel
export function exportReconciliationToExcel(report: any) {
  const data = [
    {
      'Metric': 'Total Items',
      'Value': report.totalItems
    },
    {
      'Metric': 'Reconciled',
      'Value': report.reconciledCount
    },
    {
      'Metric': 'Unreconciled',
      'Value': report.unreconciledCount
    },
    {
      'Metric': 'Pending',
      'Value': report.pendingCount
    },
    {
      'Metric': 'Total Gross Amount',
      'Value': report.totalGrossAmount
    },
    {
      'Metric': 'Total Fees',
      'Value': report.totalFees
    },
    {
      'Metric': 'Total Net Payout',
      'Value': report.totalNetPayout
    },
    {
      'Metric': 'Total Bank Deposit',
      'Value': report.totalActualBankDeposit
    },
    {
      'Metric': 'Total Variance',
      'Value': report.totalVariance
    },
    {},
    ...report.items.map((item: any) => ({
      'Date': item.date,
      'Platform': item.platform,
      'Gross Amount': item.grossAmount,
      'Fees': item.fees,
      'Net Payout': item.netPayout,
      'Bank Deposit': item.actualBankDeposit || 'N/A',
      'Variance': item.variance,
      'Status': item.status,
      'Reference ID': item.referenceId || 'N/A'
    }))
  ];

  exportToExcel({
    filename: `Reconciliation_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Reconciliation',
    data
  });
}
