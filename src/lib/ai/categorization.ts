// AI Auto-Categorization using Google GenAI
// Automatically categorizes transactions for IRS Schedule C

import { GoogleGenAI } from '@google/genai';

// Initialize Google GenAI client
// Note: In production, this should be an environment variable
const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY || '' });

export interface TransactionForCategorization {
  id: string;
  description: string;
  amount: number;
  platform: string;
  date: string;
  metadata?: Record<string, any>;
}

export interface CategorizationResult {
  categoryId: string;
  scheduleCLine: string;
  confidence: number;
  explanation: string;
  suggestedTags: string[];
}

export interface BatchCategorizationResult {
  results: Record<string, CategorizationResult>;
  processed: number;
  failed: number;
  highConfidence: number;
  needsReview: number;
}

// IRS Schedule C Categories mapping
const scheduleCCategories: Record<string, { line: string; name: string; examples: string[] }> = {
  'sales': {
    line: '1',
    name: 'Gross receipts or sales',
    examples: ['Product sales', 'Service revenue', 'Subscription income']
  },
  'refund': {
    line: '2',
    name: 'Returns and allowances',
    examples: ['Customer refunds', 'Chargebacks', 'Returns']
  },
  'cogs': {
    line: '4',
    name: 'Cost of goods sold',
    examples: ['Inventory purchases', 'Raw materials', 'Manufacturing costs']
  },
  'advertising': {
    line: '8',
    name: 'Advertising',
    examples: ['Facebook ads', 'Google ads', 'Marketing campaigns', 'Promotional materials']
  },
  'commissions_fees': {
    line: '9',
    name: 'Commissions and fees',
    examples: ['Platform fees', 'Payment processing', 'Affiliate commissions', 'Shopify fees', 'Amazon fees']
  },
  'vehicle_rental': {
    line: '20a',
    name: 'Rent or lease of vehicles',
    examples: ['Car rental', 'Truck lease', 'Vehicle rental for business']
  },
  'rent': {
    line: '20b',
    name: 'Rent or lease of other business property',
    examples: ['Office rent', 'Warehouse lease', 'Storage space']
  },
  'repairs': {
    line: '21',
    name: 'Repairs and maintenance',
    examples: ['Equipment repair', 'Office maintenance', 'Fixes']
  },
  'supplies': {
    line: '22',
    name: 'Supplies',
    examples: ['Office supplies', 'Packaging materials', 'Stationery']
  },
  'travel': {
    line: '23',
    name: 'Travel and meals',
    examples: ['Business travel', 'Hotels', 'Meals with clients', 'Transportation']
  },
  'contract_labor': {
    line: '24a',
    name: 'Contract labor',
    examples: ['Freelancer payments', 'Contractor fees', 'Consultant fees']
  },
  'employee_benefits': {
    line: '24b',
    name: 'Employee benefits',
    examples: ['Health insurance', 'Retirement plans', 'Employee perks']
  },
  'pension': {
    line: '25',
    name: 'Pension and profit-sharing',
    examples: ['401k contributions', 'Retirement plan', 'Pension plan']
  },
  'benefit_programs': {
    line: '26',
    name: 'Employee benefit programs',
    examples: ['Welfare benefits', 'Insurance programs']
  },
  'insurance': {
    line: '27',
    name: 'Insurance',
    examples: ['Business insurance', 'Liability insurance', 'Property insurance']
  },
  'legal': {
    line: '28a',
    name: 'Legal and professional services',
    examples: ['Attorney fees', 'Accounting fees', 'Consulting fees']
  },
  'software': {
    line: '28b',
    name: 'Other expenses - Software',
    examples: ['SaaS subscriptions', 'Software licenses', 'Tools']
  },
  'utilities': {
    line: '28b',
    name: 'Other expenses - Utilities',
    examples: ['Electricity', 'Internet', 'Phone', 'Water']
  },
  'shipping': {
    line: '28b',
    name: 'Other expenses - Shipping',
    examples: ['Postage', 'Delivery fees', 'Freight', 'UPS', 'FedEx']
  },
  'bank_fees': {
    line: '28b',
    name: 'Other expenses - Bank fees',
    examples: ['Monthly fees', 'Transaction fees', 'Credit card fees']
  },
  'other': {
    line: '28b',
    name: 'Other expenses',
    examples: ['Miscellaneous business expenses']
  }
};

// Create system prompt for categorization
function createCategorizationPrompt(): string {
  const categoriesList = Object.entries(scheduleCCategories)
    .map(([key, cat]) => `- ${key}: ${cat.name} (Schedule C Line ${cat.line}) - Examples: ${cat.examples.join(', ')}`)
    .join('\n');

  return `You are an expert tax accountant specializing in IRS Schedule C categorization for e-commerce businesses.

Your task is to categorize transactions into the appropriate IRS Schedule C expense categories.

Available categories:
${categoriesList}

Rules:
1. Sales/positive amounts should be categorized as 'sales' (Line 1)
2. Refunds/chargebacks should be categorized as 'refund' (Line 2)
3. Negative amounts that are not refunds should be categorized as expenses
4. Platform fees (Shopify, Amazon, Stripe, PayPal fees) go to 'commissions_fees' (Line 9)
5. Be precise and confident in your categorization
6. If uncertain, choose the closest match and note it

Response format:
{
  "categoryId": "category_key",
  "scheduleCLine": "line_number",
  "confidence": 0.95,
  "explanation": "Brief explanation of why this category was chosen",
  "suggestedTags": ["tag1", "tag2"]
}`;
}

// Categorize a single transaction
export async function categorizeTransaction(
  transaction: TransactionForCategorization
): Promise<CategorizationResult> {
  try {
    const prompt = createCategorizationPrompt();
    
    const content = `Please categorize this transaction:
Description: ${transaction.description}
Amount: ${transaction.amount}
Platform: ${transaction.platform}
Date: ${transaction.date}
Metadata: ${JSON.stringify(transaction.metadata || {})}

Provide the categorization in the specified JSON format.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt + '\n\n' + content }] }],
      config: {
        temperature: 0.1,
        maxOutputTokens: 500,
      }
    });

    const text = response.text;
    
    if (!text) {
      throw new Error('Empty response from AI');
    }

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const result = JSON.parse(jsonMatch[0]) as CategorizationResult;
    
    // Validate the result
    if (!result.categoryId || !scheduleCCategories[result.categoryId]) {
      throw new Error('Invalid category returned');
    }

    return result;

  } catch (error) {
    console.error('Categorization error:', error);
    
    // Fallback categorization based on heuristics
    return fallbackCategorization(transaction);
  }
}

// Batch categorize transactions
export async function categorizeBatch(
  transactions: TransactionForCategorization[],
  onProgress?: (processed: number, total: number) => void
): Promise<BatchCategorizationResult> {
  const results: Record<string, CategorizationResult> = {};
  let processed = 0;
  let failed = 0;
  let highConfidence = 0;
  let needsReview = 0;

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10;
  
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    
    // Process batch concurrently
    const batchPromises = batch.map(async (tx) => {
      try {
        const result = await categorizeTransaction(tx);
        results[tx.id] = result;
        
        if (result.confidence >= 0.8) {
          highConfidence++;
        } else {
          needsReview++;
        }
        
        processed++;
      } catch (error) {
        console.error(`Failed to categorize transaction ${tx.id}:`, error);
        results[tx.id] = fallbackCategorization(tx);
        failed++;
        processed++;
      }
    });

    await Promise.all(batchPromises);
    
    onProgress?.(processed, transactions.length);
    
    // Small delay between batches
    if (i + batchSize < transactions.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return {
    results,
    processed,
    failed,
    highConfidence,
    needsReview
  };
}

// Fallback categorization based on heuristics
function fallbackCategorization(
  transaction: TransactionForCategorization
): CategorizationResult {
  const { description, amount, platform } = transaction;
  const desc = description.toLowerCase();
  
  // Income detection
  if (amount > 0) {
    if (desc.includes('refund') || desc.includes('return') || desc.includes('chargeback')) {
      return {
        categoryId: 'refund',
        scheduleCLine: '2',
        confidence: 0.85,
        explanation: 'Detected as refund based on keywords',
        suggestedTags: ['refund', 'return']
      };
    }
    
    return {
      categoryId: 'sales',
      scheduleCLine: '1',
      confidence: 0.9,
      explanation: 'Positive amount categorized as sales income',
      suggestedTags: ['revenue', 'sales', platform.toLowerCase()]
    };
  }
  
  // Platform fees detection
  if (platform === 'Stripe' || platform === 'PayPal' || 
      desc.includes('stripe') || desc.includes('paypal') ||
      desc.includes('processing fee') || desc.includes('transaction fee')) {
    return {
      categoryId: 'commissions_fees',
      scheduleCLine: '9',
      confidence: 0.9,
      explanation: 'Payment processing or platform fee',
      suggestedTags: ['platform-fee', 'payment-processing', platform.toLowerCase()]
    };
  }
  
  // Shopify/Amazon fees
  if (desc.includes('shopify') || desc.includes('amazon') || 
      desc.includes('platform fee') || desc.includes('listing fee') ||
      desc.includes('referral fee') || desc.includes('fba fee')) {
    return {
      categoryId: 'commissions_fees',
      scheduleCLine: '9',
      confidence: 0.85,
      explanation: 'E-commerce platform fee detected',
      suggestedTags: ['platform-fee', 'marketplace-fee']
    };
  }
  
  // Shipping
  if (desc.includes('shipping') || desc.includes('postage') || 
      desc.includes('ups') || desc.includes('fedex') || desc.includes('usps')) {
    return {
      categoryId: 'shipping',
      scheduleCLine: '28b',
      confidence: 0.8,
      explanation: 'Shipping or postage expense',
      suggestedTags: ['shipping', 'postage', 'delivery']
    };
  }
  
  // Software/SaaS
  if (desc.includes('software') || desc.includes('subscription') || 
      desc.includes('saas') || desc.includes('license')) {
    return {
      categoryId: 'software',
      scheduleCLine: '28b',
      confidence: 0.75,
      explanation: 'Software or subscription service',
      suggestedTags: ['software', 'saas', 'tools']
    };
  }
  
  // Advertising
  if (desc.includes('ad') || desc.includes('marketing') || 
      desc.includes('facebook') || desc.includes('google') || 
      desc.includes('promotion')) {
    return {
      categoryId: 'advertising',
      scheduleCLine: '8',
      confidence: 0.75,
      explanation: 'Advertising or marketing expense',
      suggestedTags: ['advertising', 'marketing']
    };
  }
  
  // Supplies
  if (desc.includes('supply') || desc.includes('material') || 
      desc.includes('packaging') || desc.includes('tape') || 
      desc.includes('box')) {
    return {
      categoryId: 'supplies',
      scheduleCLine: '22',
      confidence: 0.7,
      explanation: 'Office or packaging supplies',
      suggestedTags: ['supplies', 'materials']
    };
  }
  
  // Legal/Professional
  if (desc.includes('legal') || desc.includes('attorney') || 
      desc.includes('accounting') || desc.includes('consultant')) {
    return {
      categoryId: 'legal',
      scheduleCLine: '28a',
      confidence: 0.75,
      explanation: 'Legal or professional service',
      suggestedTags: ['legal', 'professional', 'accounting']
    };
  }
  
  // Insurance
  if (desc.includes('insurance') || desc.includes('liability')) {
    return {
      categoryId: 'insurance',
      scheduleCLine: '27',
      confidence: 0.8,
      explanation: 'Business insurance',
      suggestedTags: ['insurance']
    };
  }
  
  // Utilities
  if (desc.includes('utility') || desc.includes('electric') || 
      desc.includes('internet') || desc.includes('phone')) {
    return {
      categoryId: 'utilities',
      scheduleCLine: '28b',
      confidence: 0.7,
      explanation: 'Utility expense',
      suggestedTags: ['utilities', 'bills']
    };
  }
  
  // Rent
  if (desc.includes('rent') || desc.includes('lease') || 
      desc.includes('office space')) {
    return {
      categoryId: 'rent',
      scheduleCLine: '20b',
      confidence: 0.8,
      explanation: 'Rent or lease payment',
      suggestedTags: ['rent', 'lease', 'office']
    };
  }
  
  // Default to other expenses
  return {
    categoryId: 'other',
    scheduleCLine: '28b',
    confidence: 0.5,
    explanation: 'Default categorization - may need review',
    suggestedTags: ['other', 'miscellaneous']
  };
}

// Get category suggestions for bulk operations
export function getCategorySuggestions(): Array<{
  id: string;
  name: string;
  line: string;
  commonKeywords: string[];
}> {
  return Object.entries(scheduleCCategories).map(([id, cat]) => ({
    id,
    name: cat.name,
    line: cat.line,
    commonKeywords: cat.examples
  }));
}

// Export categorization rules for documentation
export function getCategorizationRules(): string {
  return `
# AI Transaction Categorization Rules

## High Confidence Categories (Auto-approve)
- Sales/Revenue (positive amounts) → Line 1
- Refunds (negative + keyword) → Line 2  
- Platform fees (Shopify/Amazon/Stripe) → Line 9
- Shipping (UPS/FedEx/USPS keywords) → Line 28b

## Medium Confidence (Suggest for review)
- Advertising (Facebook/Google ads)
- Supplies (materials, packaging)
- Software (SaaS, subscriptions)

## Low Confidence (Always review)
- Other expenses (miscellaneous)
- Mixed descriptions
- Unusual amounts
`;
}
