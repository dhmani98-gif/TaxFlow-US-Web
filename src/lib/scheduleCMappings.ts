// Schedule C Line Mappings for IRS Form 1040
// Maps transaction categories to official IRS Schedule C lines

export interface ScheduleCLineMapping {
  line: string;
  description: string;
  category: string;
  partV?: boolean;
  specify?: string;
}

export const scheduleCLineMappings: Record<string, ScheduleCLineMapping> = {
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

  // Line 2 - Returns and allowances
  'refund': {
    line: '2',
    description: 'Returns and allowances',
    category: 'Returns'
  },
  'returns': {
    line: '2',
    description: 'Returns and allowances',
    category: 'Returns'
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

  // Line 9 - Commissions and Fees (CRITICAL - Platform fees)
  'commissions_fees': {
    line: '9',
    description: 'Commissions and fees',
    category: 'Expenses'
  },
  'shopify_fees': {
    line: '9',
    description: 'Commissions and fees - Shopify',
    category: 'Expenses'
  },
  'amazon_fees': {
    line: '9',
    description: 'Commissions and fees - Amazon',
    category: 'Expenses'
  },
  'amazon_referral': {
    line: '9',
    description: 'Commissions and fees - Amazon Referral',
    category: 'Expenses'
  },
  'amazon_fba': {
    line: '9',
    description: 'Commissions and fees - Amazon FBA',
    category: 'Expenses'
  },
  'stripe_fees': {
    line: '9',
    description: 'Commissions and fees - Stripe',
    category: 'Expenses'
  },
  'paypal_fees': {
    line: '9',
    description: 'Commissions and fees - PayPal',
    category: 'Expenses'
  },
  'square_fees': {
    line: '9',
    description: 'Commissions and fees - Square',
    category: 'Expenses'
  },
  'payment_processing': {
    line: '9',
    description: 'Commissions and fees - Payment Processing',
    category: 'Expenses'
  },
  'platform_fees': {
    line: '9',
    description: 'Commissions and fees - Platform Fees',
    category: 'Expenses'
  },
  'transaction_fees': {
    line: '9',
    description: 'Commissions and fees - Transaction Fees',
    category: 'Expenses'
  },
  'listing_fees': {
    line: '9',
    description: 'Commissions and fees - Listing Fees',
    category: 'Expenses'
  },
  'selling_fees': {
    line: '9',
    description: 'Commissions and fees - Selling Fees',
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

  // Line 28b - Other expenses (Part V Specification)
  // Part V: Other Expenses - List type and amount
  'software_saas': {
    line: '28b',
    description: 'Other expenses - Software & SaaS',
    category: 'Expenses',
    partV: true,
    specify: 'Software subscriptions (QuickBooks, Shopify, etc.)'
  },
  'software': {
    line: '28b',
    description: 'Other expenses - Software',
    category: 'Expenses',
    partV: true,
    specify: 'Business software licenses'
  },
  'tools': {
    line: '28b',
    description: 'Other expenses - Tools & Equipment',
    category: 'Expenses',
    partV: true,
    specify: 'Small tools and equipment under $2,500'
  },
  'subscriptions': {
    line: '28b',
    description: 'Other expenses - Subscriptions',
    category: 'Expenses',
    partV: true,
    specify: 'Business subscriptions and memberships'
  },
  'utilities': {
    line: '28b',
    description: 'Other expenses - Utilities',
    category: 'Expenses',
    partV: true,
    specify: 'Electricity, gas, water for business'
  },
  'internet': {
    line: '28b',
    description: 'Other expenses - Internet',
    category: 'Expenses',
    partV: true,
    specify: 'Internet service for business use'
  },
  'phone': {
    line: '28b',
    description: 'Other expenses - Phone',
    category: 'Expenses',
    partV: true,
    specify: 'Business phone and mobile service'
  },
  'bank_fees': {
    line: '28b',
    description: 'Other expenses - Bank & Credit Card Fees',
    category: 'Expenses',
    partV: true,
    specify: 'Monthly bank fees, credit card annual fees'
  },
  'shipping': {
    line: '28b',
    description: 'Other expenses - Shipping & Postage',
    category: 'Expenses',
    partV: true,
    specify: 'Shipping costs, postage, delivery fees'
  },
  'postage': {
    line: '28b',
    description: 'Other expenses - Postage',
    category: 'Expenses',
    partV: true,
    specify: 'Postage and mailing costs'
  },
  'packaging_materials': {
    line: '28b',
    description: 'Other expenses - Packaging Materials',
    category: 'Expenses',
    partV: true,
    specify: 'Boxes, bubble wrap, tape, labels'
  },
  'office_expenses': {
    line: '28b',
    description: 'Other expenses - Office Expenses',
    category: 'Expenses',
    partV: true,
    specify: 'Office-related expenses not in supplies'
  },
  'dues_memberships': {
    line: '28b',
    description: 'Other expenses - Dues & Memberships',
    category: 'Expenses',
    partV: true,
    specify: 'Professional association dues, chamber of commerce'
  },
  'education_training': {
    line: '28b',
    description: 'Other expenses - Education & Training',
    category: 'Expenses',
    partV: true,
    specify: 'Courses, books, training materials'
  },
  'licenses_permits': {
    line: '28b',
    description: 'Other expenses - Licenses & Permits',
    category: 'Expenses',
    partV: true,
    specify: 'Business licenses, permits, registrations'
  },
  'meals_entertainment': {
    line: '28b',
    description: 'Other expenses - Meals (50% deductible)',
    category: 'Expenses',
    partV: true,
    specify: 'Business meals (50% deductible only)'
  },
  'other': {
    line: '28b',
    description: 'Other expenses',
    category: 'Expenses',
    partV: true,
    specify: 'Specify type in description'
  }
};

// Part V: Other Expenses Specification interface
export interface PartVExpense {
  description: string;
  amount: number;
  category: string;
}

// Calculate Schedule C totals from transactions
export interface ScheduleCResult {
  line1_grossReceipts: number;
  line2_returns: number;
  line3_netReceipts: number;
  line4_costOfGoodsSold: number;
  line5_otherCosts: number;  // NEW: Other costs (part of COGS)
  line6_beginningInventory: number;  // NEW: Beginning inventory
  line7_grossProfit: number;
  line9_commissionsFees: number;  // NEW: Commissions and fees
  line28_totalExpenses: number;
  line29_netProfit: number;
  partVExpenses: PartVExpense[];  // NEW: Part V detailed breakdown
  lineItems: {
    line: string;
    description: string;
    amount: number;
  }[];
}

// Auto-detect platform fees from transaction descriptions
export function detectPlatformFees(transactions: any[]): { category: string; amount: number }[] {
  const platformFeePatterns = [
    { pattern: /shopify/i, category: 'shopify_fees' },
    { pattern: /amazon.*referral|amazon.*fee/i, category: 'amazon_referral' },
    { pattern: /amazon.*fba|fulfillment by amazon/i, category: 'amazon_fba' },
    { pattern: /amazon.*fee/i, category: 'amazon_fees' },
    { pattern: /stripe/i, category: 'stripe_fees' },
    { pattern: /paypal/i, category: 'paypal_fees' },
    { pattern: /square/i, category: 'square_fees' },
    { pattern: /processing.*fee|transaction.*fee/i, category: 'transaction_fees' },
    { pattern: /listing.*fee/i, category: 'listing_fees' },
    { pattern: /selling.*fee|seller.*fee/i, category: 'selling_fees' }
  ];

  const detectedFees: { category: string; amount: number }[] = [];

  transactions.forEach(tx => {
    if (tx.amount < 0) {
      const description = tx.description?.toLowerCase() || '';
      
      for (const { pattern, category } of platformFeePatterns) {
        if (pattern.test(description)) {
          detectedFees.push({ category, amount: Math.abs(tx.amount) });
          break;
        }
      }
    }
  });

  return detectedFees;
}

export function calculateScheduleC(transactions: any[]): ScheduleCResult {
  const lineItems: Record<string, number> = {};
  const partVDetails: PartVExpense[] = [];

  let grossSales = 0;
  let refunds = 0;

  // Auto-detect platform fees first
  const detectedFees = detectPlatformFees(transactions);
  
  // Add detected fees to line 9
  detectedFees.forEach(fee => {
    lineItems['9'] = (lineItems['9'] || 0) + fee.amount;
  });

  transactions.forEach(tx => {
    const category = tx.categoryId || 'other';
    const mapping = scheduleCLineMappings[category] || scheduleCLineMappings['other'];
    const line = mapping.line;

    if (tx.amount < 0) {
      // Expense
      const expenseAmount = Math.abs(tx.amount);

      // Check if this is a refund (negative income transaction)
      if (category === 'refund' || tx.description?.toLowerCase().includes('refund')) {
        refunds += expenseAmount;
      } else {
        // This is a regular expense - add to the mapped line
        lineItems[line] = (lineItems[line] || 0) + expenseAmount;
        
        // Track Part V expenses with specification
        if (mapping.partV && mapping.specify) {
          const existing = partVDetails.find(p => p.category === category);
          if (existing) {
            existing.amount += expenseAmount;
          } else {
            partVDetails.push({
              description: mapping.specify,
              amount: expenseAmount,
              category: category
            });
          }
        }
      }
    } else {
      // Income
      // Sum all positive transactions as Sales Income (Line 1)
      if (line === '1' || category.includes('sales') || category.includes('income') || category === 'shopify_sales' || category === 'stripe_sales' || category === 'amazon_sales') {
        grossSales += tx.amount;
        lineItems[line] = (lineItems[line] || 0) + tx.amount;
      }
    }
  });

  const line1_grossReceipts = grossSales;
  const line2_returns = refunds;
  const line3_netReceipts = line1_grossReceipts - line2_returns;
  const line4_costOfGoodsSold = lineItems['4'] || 0;
  const line5_otherCosts = lineItems['5'] || 0;  // NEW
  const line6_beginningInventory = lineItems['6'] || 0;  // NEW
  const line7_grossProfit = line3_netReceipts - line4_costOfGoodsSold;
  const line9_commissionsFees = lineItems['9'] || 0;  // NEW: Separate line for commissions

  // Sum all expense lines (8-28) - all expense categories
  const expenseLines = ['8', '9', '20a', '20b', '21', '22', '23', '24a', '24b', '25', '26', '27', '28a', '28b'];
  const line28_totalExpenses = expenseLines.reduce((sum, line) => sum + (lineItems[line] || 0), 0);

  // Auto-calculate Line 29 (Net Profit) = Line 7 (Gross Profit) - Line 28 (Total Expenses)
  const line29_netProfit = line7_grossProfit - line28_totalExpenses;

  // Build line items array
  const lineItemsArray = Object.entries(lineItems).map(([line, amount]) => ({
    line,
    description: Object.values(scheduleCLineMappings).find(m => m.line === line)?.description || 'Other',
    amount
  }));

  return {
    line1_grossReceipts,
    line2_returns,
    line3_netReceipts,
    line4_costOfGoodsSold,
    line5_otherCosts,
    line6_beginningInventory,
    line7_grossProfit,
    line9_commissionsFees,  // NEW
    line28_totalExpenses,
    line29_netProfit,
    partVExpenses: partVDetails,  // NEW
    lineItems: lineItemsArray
  };
}
