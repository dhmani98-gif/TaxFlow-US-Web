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

// Export all reports to a single Excel file with 3 sheets
export function exportAllReportsToExcel(scheduleCResult: any, salesData: any[], reconciliationReport: any) {
  try {
    // Create a workbook
    const workbook = XLSX.utils.book_new();

    // Schedule C Sheet - Main Lines
    const scheduleCData = [
      {
        'Line': '1',
        'Description': 'Gross receipts or sales',
        'Amount': scheduleCResult.line1_grossReceipts
      },
      {
        'Line': '2',
        'Description': 'Returns and allowances',
        'Amount': scheduleCResult.line2_returns
      },
      {
        'Line': '3',
        'Description': 'Net receipts (Line 1 - Line 2)',
        'Amount': scheduleCResult.line3_netReceipts
      },
      {
        'Line': '4',
        'Description': 'Cost of goods sold',
        'Amount': scheduleCResult.line4_costOfGoodsSold
      },
      {
        'Line': '7',
        'Description': 'Gross profit (Line 3 - Line 4)',
        'Amount': scheduleCResult.line7_grossProfit
      },
      {
        'Line': '9',
        'Description': 'Commissions and fees (Shopify, Amazon, Stripe/PayPal)',
        'Amount': scheduleCResult.line9_commissionsFees || 0,
        'Category': 'Platform Fees'
      },
      {
        'Line': '28',
        'Description': 'Total expenses',
        'Amount': scheduleCResult.line28_totalExpenses
      },
      {
        'Line': '29',
        'Description': 'Net profit (or loss) (Line 7 - Line 28)',
        'Amount': scheduleCResult.line29_netProfit
      }
    ];
    
    // Part V: Other Expenses (Detailed)
    const partVData = [
      {},  // Empty row for separation
      {
        'Line': 'PART V',
        'Description': 'Other Expenses (IRS Schedule C, Page 2)',
        'Amount': null,
        'Category': 'DETAILED BREAKDOWN'
      },
      ...(scheduleCResult.partVExpenses?.map((expense: any) => ({
        'Line': '',
        'Description': expense.description,
        'Amount': expense.amount,
        'Category': expense.category
      })) || []),
      {},  // Empty row
      {
        'Line': '',
        'Description': 'Total Part V Other Expenses',
        'Amount': scheduleCResult.partVExpenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0,
        'Category': 'TOTAL'
      }
    ];
    
    // Detailed Line Items
    const lineItemsData = [
      {},  // Empty row for separation
      {
        'Line': 'DETAIL',
        'Description': 'Expense Breakdown by Schedule C Line',
        'Amount': null,
        'Category': 'SUMMARY'
      },
      ...scheduleCResult.lineItems.map((item: any) => ({
        'Line': item.line,
        'Description': item.description,
        'Amount': item.amount,
        'Category': 'Line Item'
      }))
    ];
    
    // Combine all Schedule C data
    const fullScheduleCData = [...scheduleCData, ...partVData, ...lineItemsData];
    
    const scheduleCWorksheet = XLSX.utils.json_to_sheet(fullScheduleCData);
    XLSX.utils.book_append_sheet(workbook, scheduleCWorksheet, 'Schedule C');
    
    // Part V Sheet (Separate detailed sheet)
    if (scheduleCResult.partVExpenses && scheduleCResult.partVExpenses.length > 0) {
      const partVWorksheetData = [
        {
          'Description': 'PART V: Other Expenses',
          'Amount': null,
          'Category': null,
          'IRS Reference': 'Schedule C, Page 2'
        },
        {},
        ...scheduleCResult.partVExpenses.map((expense: any, index: number) => ({
          'Description': expense.description,
          'Amount': expense.amount,
          'Category': expense.category,
          'IRS Reference': `Line 28b - Item ${index + 1}`
        }))
      ];
      const partVWorksheet = XLSX.utils.json_to_sheet(partVWorksheetData);
      XLSX.utils.book_append_sheet(workbook, partVWorksheet, 'Part V - Other Expenses');
    }

    // Sales Tax Sheet
    const salesTaxData = salesData.map((state: any) => ({
      'Province Code': state.provinceCode,
      'Province Name': state.provinceName,
      'Total Sales': state.totalSales,
      'Tax Collected': state.taxCollected,
      'Nexus Threshold': state.nexusThreshold,
      'Nexus Reached': state.nexusReached ? 'Yes' : 'No',
      'Percentage': `${state.percentage.toFixed(1)}%`
    }));
    const salesTaxWorksheet = XLSX.utils.json_to_sheet(salesTaxData);
    XLSX.utils.book_append_sheet(workbook, salesTaxWorksheet, 'Sales Tax');

    // Reconciliation Sheet
    const reconciliationData = [
      {
        'Metric': 'Total Items',
        'Value': reconciliationReport.totalItems
      },
      {
        'Metric': 'Reconciled',
        'Value': reconciliationReport.reconciledCount
      },
      {
        'Metric': 'Discrepancy',
        'Value': reconciliationReport.discrepancyCount
      },
      {
        'Metric': 'Pending',
        'Value': reconciliationReport.pendingCount
      },
      {
        'Metric': 'Total Gross Amount',
        'Value': reconciliationReport.totalGrossAmount
      },
      {
        'Metric': 'Total Fees',
        'Value': reconciliationReport.totalFees
      },
      {
        'Metric': 'Total Net Payout',
        'Value': reconciliationReport.totalNetPayout
      },
      {
        'Metric': 'Total Bank Deposit',
        'Value': reconciliationReport.totalActualBankDeposit
      },
      {
        'Metric': 'Total Variance',
        'Value': reconciliationReport.totalVariance
      },
      {},
      ...reconciliationReport.items.map((item: any) => ({
        'Date': item.date,
        'Platform': item.platform,
        'Gross Amount': item.grossAmount,
        'Fees': item.fees,
        'Net Payout': item.netPayout,
        'Bank Deposit': item.actualBankDeposit || 'N/A',
        'Variance': item.variance,
        'Status': item.status,
        'Discrepancy Reason': item.discrepancyReason || '',
        'Reference ID': item.referenceId || 'N/A'
      }))
    ];
    const reconciliationWorksheet = XLSX.utils.json_to_sheet(reconciliationData);
    XLSX.utils.book_append_sheet(workbook, reconciliationWorksheet, 'Reconciliation');

    // Generate Excel file
    XLSX.writeFile(workbook, `TaxFlow_Reports_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting all reports to Excel:', error);
    throw error;
  }
}

// Export Schedule C to Excel (individual)
export function exportScheduleCToExcel(scheduleCResult: any) {
  const data = [
    {
      'Line': '1',
      'Description': 'Gross receipts or sales',
      'Amount': scheduleCResult.line1_grossReceipts
    },
    {
      'Line': '2',
      'Description': 'Returns and allowances',
      'Amount': scheduleCResult.line2_returns
    },
    {
      'Line': '3',
      'Description': 'Net receipts',
      'Amount': scheduleCResult.line3_netReceipts
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

// Export Sales Tax Summary to Excel (individual)
export function exportSalesTaxToExcel(salesData: any[]) {
  const data = salesData.map((state: any) => ({
    'Province Code': state.provinceCode,
    'Province Name': state.provinceName,
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

// Export Reconciliation Report to Excel (individual)
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
      'Metric': 'Discrepancy',
      'Value': report.discrepancyCount
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
      'Discrepancy Reason': item.discrepancyReason || '',
      'Reference ID': item.referenceId || 'N/A'
    }))
  ];

  exportToExcel({
    filename: `Reconciliation_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Reconciliation',
    data
  });
}
