// Schedule C Line Mappings for IRS Form 1040
// Maps transaction categories to official IRS Schedule C lines

export const scheduleCLineMappings: Record<string, {
  line: string;
  description: string;
  category: string;
}> = {
  // Line 1 - Gross Receipts
  'sales': {
    line: '1',
    description: 'Gross receipts or sales',
    category: 'Income'
  },
  'shopify_sales': {
    line: '1',
    description: 'Gross receipts or sales',
    category: 'Income'
  },
  'stripe_sales': {
    line: '1',
    description: 'Gross receipts or sales',
    category: 'Income'
  },
  'amazon_sales': {
    line: '1',
    description: 'Gross receipts or sales',
    category: 'Income'
  },

  // Line 4 - Cost of Goods Sold
  'cogs': {
    line: '4',
    description: 'Cost of goods sold',
    category: 'COGS'
  },
  'inventory': {
    line: '4',
    description: 'Cost of goods sold',
    category: 'COGS'
  },
  'product_cost': {
    line: '4',
    description: 'Cost of goods sold',
    category: 'COGS'
  },

  // Line 8 - Advertising
  'advertising': {
    line: '8',
    description: 'Advertising',
    category: 'Expenses'
  },
  'marketing': {
    line: '8',
    description: 'Advertising',
    category: 'Expenses'
  },
  'ads': {
    line: '8',
    description: 'Advertising',
    category: 'Expenses'
  },
  'facebook_ads': {
    line: '8',
    description: 'Advertising',
    category: 'Expenses'
  },
  'google_ads': {
    line: '8',
    description: 'Advertising',
    category: 'Expenses'
  },

  // Line 20a - Rent or lease of vehicles
  'vehicle_rental': {
    line: '20a',
    description: 'Rent or lease of vehicles',
    category: 'Expenses'
  },
  'car_rental': {
    line: '20a',
    description: 'Rent or lease of vehicles',
    category: 'Expenses'
  },

  // Line 20b - Rent or lease of other business property
  'rent': {
    line: '20b',
    description: 'Rent or lease of other business property',
    category: 'Expenses'
  },
  'office_rent': {
    line: '20b',
    description: 'Rent or lease of other business property',
    category: 'Expenses'
  },
  'warehouse_rent': {
    line: '20b',
    description: 'Rent or lease of other business property',
    category: 'Expenses'
  },

  // Line 21 - Repairs and maintenance
  'repairs': {
    line: '21',
    description: 'Repairs and maintenance',
    category: 'Expenses'
  },
  'maintenance': {
    line: '21',
    description: 'Repairs and maintenance',
    category: 'Expenses'
  },
  'equipment_repair': {
    line: '21',
    description: 'Repairs and maintenance',
    category: 'Expenses'
  },

  // Line 22 - Supplies
  'supplies': {
    line: '22',
    description: 'Supplies (not included in COGS)',
    category: 'Expenses'
  },
  'office_supplies': {
    line: '22',
    description: 'Supplies (not included in COGS)',
    category: 'Expenses'
  },
  'packaging': {
    line: '22',
    description: 'Supplies (not included in COGS)',
    category: 'Expenses'
  },

  // Line 23 - Travel, meals, and entertainment
  'travel': {
    line: '23',
    description: 'Travel, meals, and entertainment',
    category: 'Expenses'
  },
  'meals': {
    line: '23',
    description: 'Travel, meals, and entertainment',
    category: 'Expenses'
  },
  'entertainment': {
    line: '23',
    description: 'Travel, meals, and entertainment',
    category: 'Expenses'
  },

  // Line 24a - Contract labor
  'contract_labor': {
    line: '24a',
    description: 'Contract labor',
    category: 'Expenses'
  },
  'freelancers': {
    line: '24a',
    description: 'Contract labor',
    category: 'Expenses'
  },
  'contractors': {
    line: '24a',
    description: 'Contract labor',
    category: 'Expenses'
  },

  // Line 24b - Other employee benefits
  'employee_benefits': {
    line: '24b',
    description: 'Other employee benefits',
    category: 'Expenses'
  },
  'benefits': {
    line: '24b',
    description: 'Other employee benefits',
    category: 'Expenses'
  },

  // Line 25 - Pension and profit-sharing plans
  'pension': {
    line: '25',
    description: 'Pension and profit-sharing plans',
    category: 'Expenses'
  },
  '401k': {
    line: '25',
    description: 'Pension and profit-sharing plans',
    category: 'Expenses'
  },

  // Line 26 - Employee benefit programs
  'benefit_programs': {
    line: '26',
    description: 'Employee benefit programs',
    category: 'Expenses'
  },

  // Line 27 - Insurance
  'insurance': {
    line: '27',
    description: 'Insurance',
    category: 'Expenses'
  },
  'business_insurance': {
    line: '27',
    description: 'Insurance',
    category: 'Expenses'
  },
  'liability_insurance': {
    line: '27',
    description: 'Insurance',
    category: 'Expenses'
  },

  // Line 28a - Legal and professional services
  'legal': {
    line: '28a',
    description: 'Legal and professional services',
    category: 'Expenses'
  },
  'attorney': {
    line: '28a',
    description: 'Legal and professional services',
    category: 'Expenses'
  },
  'accounting': {
    line: '28a',
    description: 'Legal and professional services',
    category: 'Expenses'
  },
  'professional_services': {
    line: '28a',
    description: 'Legal and professional services',
    category: 'Expenses'
  },

  // Line 28b - Other expenses
  'software': {
    line: '28b',
    description: 'Other expenses',
    category: 'Expenses'
  },
  'tools': {
    line: '28b',
    description: 'Other expenses',
    category: 'Expenses'
  },
  'subscriptions': {
    line: '28b',
    description: 'Other expenses',
    category: 'Expenses'
  },
  'utilities': {
    line: '28b',
    description: 'Other expenses',
    category: 'Expenses'
  },
  'internet': {
    line: '28b',
    description: 'Other expenses',
    category: 'Expenses'
  },
  'phone': {
    line: '28b',
    description: 'Other expenses',
    category: 'Expenses'
  },
  'bank_fees': {
    line: '28b',
    description: 'Other expenses',
    category: 'Expenses'
  },
  'shipping': {
    line: '28b',
    description: 'Other expenses',
    category: 'Expenses'
  },
  'other': {
    line: '28b',
    description: 'Other expenses',
    category: 'Expenses'
  }
};

// Calculate Schedule C totals from transactions
export interface ScheduleCResult {
  line1_grossReceipts: number;
  line4_costOfGoodsSold: number;
  line7_grossProfit: number;
  line28_totalExpenses: number;
  line29_netProfit: number;
  lineItems: {
    line: string;
    description: string;
    amount: number;
  }[];
}

export function calculateScheduleC(transactions: any[]): ScheduleCResult {
  const lineItems: Record<string, number> = {};

  transactions.forEach(tx => {
    const category = tx.categoryId || 'other';
    const mapping = scheduleCLineMappings[category] || scheduleCLineMappings['other'];
    const line = mapping.line;

    if (tx.amount < 0) {
      // Expense
      const expenseAmount = Math.abs(tx.amount);
      lineItems[line] = (lineItems[line] || 0) + expenseAmount;
    } else {
      // Income
      if (line === '1') {
        lineItems[line] = (lineItems[line] || 0) + tx.amount;
      }
    }
  });

  const line1_grossReceipts = lineItems['1'] || 0;
  const line4_costOfGoodsSold = lineItems['4'] || 0;
  const line7_grossProfit = line1_grossReceipts - line4_costOfGoodsSold;

  // Sum all expense lines (8-28)
  const expenseLines = ['8', '20a', '20b', '21', '22', '23', '24a', '24b', '25', '26', '27', '28a', '28b'];
  const line28_totalExpenses = expenseLines.reduce((sum, line) => sum + (lineItems[line] || 0), 0);

  const line29_netProfit = line7_grossProfit - line28_totalExpenses;

  // Build line items array
  const lineItemsArray = Object.entries(lineItems).map(([line, amount]) => ({
    line,
    description: Object.values(scheduleCLineMappings).find(m => m.line === line)?.description || 'Other',
    amount
  }));

  return {
    line1_grossReceipts,
    line4_costOfGoodsSold,
    line7_grossProfit,
    line28_totalExpenses,
    line29_netProfit,
    lineItems: lineItemsArray
  };
}
