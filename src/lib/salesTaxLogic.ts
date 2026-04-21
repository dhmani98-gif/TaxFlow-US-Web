// Sales Tax Logic - Aggregates sales by province and determines Nexus status
// Enhanced with Tax Rate API Integration (TaxJar/Avalara compatible)

export interface ProvinceSalesData {
  provinceCode: string;
  provinceName: string;
  totalSales: number;
  taxCollected: number;
  nexusThreshold: number;
  nexusReached: boolean;
  percentage: number;
  // Enhanced fields for API integration
  taxRateSource?: 'static' | 'api' | 'manual';
  lastUpdated?: string;
  countyRates?: CountyRate[];
  combinedRate?: number;  // State + County + City
  city?: string;
  county?: string;
}

export interface CountyRate {
  countyName: string;
  countyRate: number;
  cityRates?: CityRate[];
}

export interface CityRate {
  cityName: string;
  cityRate: number;
}

// Tax Rate API Configuration
export interface TaxRateAPIConfig {
  provider: 'taxjar' | 'avalara' | 'manual';
  apiKey?: string;
  sandbox?: boolean;
  cacheDuration?: number;  // minutes
}

// API Response interfaces
export interface TaxJarRateResponse {
  rate: {
    zip: string;
    country: string;
    country_rate: string;
    state: string;
    state_rate: string;
    county: string;
    county_rate: string;
    city: string;
    city_rate: string;
    combined_rate: string;
  };
}

export interface AvalaraRateResponse {
  totalRate: number;
  rates: Array<{
    rate: number;
    name: string;
    type: string;
  }>;
}

// Nexus thresholds by province (in USD) - US states
export const nexusThresholds: Record<string, number> = {
  'AL': 250000,
  'AK': 100000,
  'AZ': 200000,
  'AR': 100000,
  'CA': 500000,
  'CO': 100000,
  'CT': 200000,
  'DE': 100000,
  'FL': 100000,
  'GA': 100000,
  'HI': 100000,
  'ID': 100000,
  'IL': 100000,
  'IN': 100000,
  'IA': 100000,
  'KS': 100000,
  'KY': 100000,
  'LA': 100000,
  'ME': 100000,
  'MD': 100000,
  'MA': 500000,
  'MI': 100000,
  'MN': 100000,
  'MS': 100000,
  'MO': 100000,
  'MT': 100000,
  'NE': 100000,
  'NV': 100000,
  'NH': 100000,
  'NJ': 100000,
  'NM': 100000,
  'NY': 500000,
  'NC': 100000,
  'ND': 100000,
  'OH': 100000,
  'OK': 100000,
  'OR': 100000,
  'PA': 100000,
  'RI': 100000,
  'SC': 100000,
  'SD': 100000,
  'TN': 100000,
  'TX': 500000,
  'UT': 100000,
  'VT': 100000,
  'VA': 100000,
  'WA': 100000,
  'WV': 100000,
  'WI': 100000,
  'WY': 100000,
  // Canadian provinces
  'AB': 30000,  // Alberta
  'BC': 30000,  // British Columbia
  'MB': 30000,  // Manitoba
  'NB': 30000,  // New Brunswick
  'NL': 30000,  // Newfoundland and Labrador
  'NS': 30000,  // Nova Scotia
  'NT': 30000,  // Northwest Territories
  'NU': 30000,  // Nunavut
  'ON': 30000,  // Ontario
  'PE': 30000,  // Prince Edward Island
  'QC': 30000,  // Quebec
  'SK': 30000,  // Saskatchewan
  'YT': 30000,  // Yukon
};

// Province/State names mapping
export const provinceNames: Record<string, string> = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
  // Canadian provinces
  'AB': 'Alberta',
  'BC': 'British Columbia',
  'MB': 'Manitoba',
  'NB': 'New Brunswick',
  'NL': 'Newfoundland and Labrador',
  'NS': 'Nova Scotia',
  'NT': 'Northwest Territories',
  'NU': 'Nunavut',
  'ON': 'Ontario',
  'PE': 'Prince Edward Island',
  'QC': 'Quebec',
  'SK': 'Saskatchewan',
  'YT': 'Yukon',
};

// Tax rates by province/state (approximate)
export const taxRates: Record<string, number> = {
  'AL': 0.04,
  'AK': 0.00,
  'AZ': 0.056,
  'AR': 0.065,
  'CA': 0.0725,
  'CO': 0.029,
  'CT': 0.0635,
  'DE': 0.00,
  'FL': 0.06,
  'GA': 0.04,
  'HI': 0.0471,
  'ID': 0.06,
  'IL': 0.0625,
  'IN': 0.07,
  'IA': 0.06,
  'KS': 0.065,
  'KY': 0.06,
  'LA': 0.0445,
  'ME': 0.055,
  'MD': 0.06,
  'MA': 0.0625,
  'MI': 0.06,
  'MN': 0.06875,
  'MS': 0.07,
  'MO': 0.0423,
  'MT': 0.00,
  'NE': 0.055,
  'NV': 0.0685,
  'NH': 0.00,
  'NJ': 0.0663,
  'NM': 0.0513,
  'NY': 0.08,
  'NC': 0.0475,
  'ND': 0.05,
  'OH': 0.0575,
  'OK': 0.045,
  'OR': 0.00,
  'PA': 0.06,
  'RI': 0.07,
  'SC': 0.06,
  'SD': 0.045,
  'TN': 0.07,
  'TX': 0.0625,
  'UT': 0.0595,
  'VT': 0.06,
  'VA': 0.053,
  'WA': 0.065,
  'WV': 0.06,
  'WI': 0.05,
  'WY': 0.04,
  // Canadian provinces (GST/HST)
  'AB': 0.05,
  'BC': 0.05,
  'MB': 0.05,
  'NB': 0.15,
  'NL': 0.15,
  'NS': 0.15,
  'NT': 0.05,
  'NU': 0.05,
  'ON': 0.13,
  'PE': 0.15,
  'QC': 0.14975,
  'SK': 0.06,
  'YT': 0.05,
};

// Nexus threshold variable (can be configured)
export const nexusThreshold = 100000; // Default threshold in USD

// Economic Nexus Rules by State
export interface EconomicNexusRule {
  stateCode: string;
  thresholdAmount: number;
  thresholdTransactions: number;
  effectiveDate: string;
  marketplaceFacilitator: boolean;
  notes?: string;
}

export const economicNexusRules: EconomicNexusRule[] = [
  { stateCode: 'AL', thresholdAmount: 250000, thresholdTransactions: 0, effectiveDate: '2019-10-01', marketplaceFacilitator: true },
  { stateCode: 'AK', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2020-01-01', marketplaceFacilitator: true },
  { stateCode: 'AZ', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-10-01', marketplaceFacilitator: true },
  { stateCode: 'AR', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2019-07-01', marketplaceFacilitator: true },
  { stateCode: 'CA', thresholdAmount: 500000, thresholdTransactions: 0, effectiveDate: '2019-04-01', marketplaceFacilitator: true, notes: '$500K AND 100K transactions' },
  { stateCode: 'CO', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-12-01', marketplaceFacilitator: true },
  { stateCode: 'CT', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2019-12-01', marketplaceFacilitator: true, notes: '$100K AND 200 transactions' },
  { stateCode: 'FL', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2021-07-01', marketplaceFacilitator: true },
  { stateCode: 'GA', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-01-01', marketplaceFacilitator: true },
  { stateCode: 'HI', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2020-07-01', marketplaceFacilitator: true },
  { stateCode: 'ID', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-06-01', marketplaceFacilitator: true },
  { stateCode: 'IL', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2020-01-01', marketplaceFacilitator: true },
  { stateCode: 'IN', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2019-10-01', marketplaceFacilitator: true },
  { stateCode: 'IA', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-01-01', marketplaceFacilitator: true },
  { stateCode: 'KS', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2021-07-01', marketplaceFacilitator: true },
  { stateCode: 'KY', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2018-10-01', marketplaceFacilitator: true },
  { stateCode: 'LA', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2018-07-01', marketplaceFacilitator: true },
  { stateCode: 'ME', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2019-07-01', marketplaceFacilitator: true },
  { stateCode: 'MD', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-10-01', marketplaceFacilitator: true },
  { stateCode: 'MA', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-10-01', marketplaceFacilitator: true },
  { stateCode: 'MI', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2018-10-01', marketplaceFacilitator: true },
  { stateCode: 'MN', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2019-10-01', marketplaceFacilitator: true },
  { stateCode: 'MS', thresholdAmount: 250000, thresholdTransactions: 0, effectiveDate: '2020-09-01', marketplaceFacilitator: true },
  { stateCode: 'MO', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2023-01-01', marketplaceFacilitator: true },
  { stateCode: 'NE', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2019-05-01', marketplaceFacilitator: true },
  { stateCode: 'NV', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2018-11-01', marketplaceFacilitator: true },
  { stateCode: 'NJ', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2018-11-01', marketplaceFacilitator: true, notes: '$100K OR 200 transactions' },
  { stateCode: 'NM', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-07-01', marketplaceFacilitator: true },
  { stateCode: 'NY', thresholdAmount: 500000, thresholdTransactions: 100, effectiveDate: '2019-06-01', marketplaceFacilitator: true, notes: '$500K AND 100 transactions' },
  { stateCode: 'NC', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2019-11-01', marketplaceFacilitator: true },
  { stateCode: 'ND', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-10-01', marketplaceFacilitator: true },
  { stateCode: 'OH', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-08-01', marketplaceFacilitator: true },
  { stateCode: 'OK', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2018-11-01', marketplaceFacilitator: true },
  { stateCode: 'PA', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2021-07-01', marketplaceFacilitator: true },
  { stateCode: 'RI', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2019-07-01', marketplaceFacilitator: true },
  { stateCode: 'SC', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-11-01', marketplaceFacilitator: true },
  { stateCode: 'SD', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-11-01', marketplaceFacilitator: true },
  { stateCode: 'TN', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2020-10-01', marketplaceFacilitator: true },
  { stateCode: 'TX', thresholdAmount: 500000, thresholdTransactions: 0, effectiveDate: '2019-10-01', marketplaceFacilitator: true },
  { stateCode: 'UT', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2019-01-01', marketplaceFacilitator: true },
  { stateCode: 'VT', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2017-07-01', marketplaceFacilitator: true },
  { stateCode: 'VA', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2019-09-01', marketplaceFacilitator: true },
  { stateCode: 'WA', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2018-10-01', marketplaceFacilitator: true },
  { stateCode: 'WV', thresholdAmount: 100000, thresholdTransactions: 200, effectiveDate: '2019-07-01', marketplaceFacilitator: true },
  { stateCode: 'WI', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-10-01', marketplaceFacilitator: true },
  { stateCode: 'WY', thresholdAmount: 100000, thresholdTransactions: 0, effectiveDate: '2019-02-01', marketplaceFacilitator: true }
];

// Filing Calendar - Due dates for sales tax returns
export interface FilingDeadline {
  stateCode: string;
  frequency: 'monthly' | 'quarterly' | 'annual';
  dueDay: number;
  nextDueDate: string;
  gracePeriodDays: number;
}

export function generateFilingCalendar(salesData: ProvinceSalesData[]): FilingDeadline[] {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  return salesData.map(state => {
    const rule = economicNexusRules.find(r => r.stateCode === state.provinceCode);
    
    // Determine filing frequency based on sales volume
    let frequency: 'monthly' | 'quarterly' | 'annual' = 'annual';
    if (state.totalSales > 50000) frequency = 'monthly';
    else if (state.totalSales > 10000) frequency = 'quarterly';
    
    // Calculate next due date
    let nextDueDate: Date;
    let dueDay = 20;  // Most states: 20th of the month
    
    if (frequency === 'monthly') {
      nextDueDate = new Date(currentYear, currentMonth + 1, dueDay);
    } else if (frequency === 'quarterly') {
      const quarter = Math.floor(currentMonth / 3);
      nextDueDate = new Date(currentYear, (quarter + 1) * 3, dueDay);
    } else {
      nextDueDate = new Date(currentYear + 1, 0, dueDay);
    }
    
    return {
      stateCode: state.provinceCode,
      frequency,
      dueDay,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      gracePeriodDays: rule?.marketplaceFacilitator ? 0 : 5
    };
  });
}

// Tax Rate API Integration Functions
export async function fetchTaxRateFromAPI(
  zipCode: string,
  city: string,
  state: string,
  config: TaxRateAPIConfig
): Promise<{ rate: number; source: string } | null> {
  // This is a placeholder for actual API integration
  // In production, this would call TaxJar, Avalara, or other provider
  
  if (!config.apiKey) {
    console.warn('Tax Rate API: No API key provided');
    return null;
  }
  
  try {
    if (config.provider === 'taxjar') {
      // TaxJar API endpoint
      const response = await fetch(
        `https://api.taxjar.com/v2/rates/${zipCode}?city=${encodeURIComponent(city)}&country=US`,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data: TaxJarRateResponse = await response.json();
        return {
          rate: parseFloat(data.rate.combined_rate),
          source: 'taxjar'
        };
      }
    } else if (config.provider === 'avalara') {
      // Avalara API endpoint (simplified)
      // Note: Actual Avalara integration requires their SDK
      console.log('Avalara API integration requires AvaTax SDK');
      return null;
    }
  } catch (error) {
    console.error('Tax Rate API Error:', error);
  }
  
  return null;
}

// Enhanced Sales Tax Calculation with API fallback
export async function calculateSalesTaxWithAPI(
  transactions: any[],
  apiConfig?: TaxRateAPIConfig
): Promise<ProvinceSalesData[]> {
  // First calculate with static rates
  const salesData = calculateSalesTaxSummary(transactions);
  
  // If API config provided, enhance with live rates for complex states
  if (apiConfig?.apiKey) {
    for (const state of salesData) {
      // Only fetch API rates for complex states with local variations
      const complexStates = ['CA', 'NY', 'TX', 'CO', 'AZ', 'AL', 'IL'];
      
      if (complexStates.includes(state.provinceCode)) {
        try {
          // In a real implementation, you'd have ZIP code data per transaction
          // This is a simplified example
          const apiRate = await fetchTaxRateFromAPI(
            '90210',  // Example ZIP
            'Beverly Hills',
            state.provinceCode,
            apiConfig
          );
          
          if (apiRate) {
            state.taxRateSource = 'api';
            state.combinedRate = apiRate.rate;
            state.taxCollected = state.totalSales * apiRate.rate;
            state.lastUpdated = new Date().toISOString();
          }
        } catch (error) {
          console.warn(`Failed to fetch API rate for ${state.provinceCode}:`, error);
          state.taxRateSource = 'static';
        }
      } else {
        state.taxRateSource = 'static';
      }
    }
  } else {
    // Mark all as static if no API configured
    salesData.forEach(s => s.taxRateSource = 'static');
  }
  
  return salesData;
}

// Marketplace Facilitator Detection
export function isMarketplaceFacilitator(platform: string): boolean {
  const facilitators = [
    'Amazon', 'eBay', 'Etsy', 'Walmart', 'Shopify', 'Facebook', 'Google'
  ];
  return facilitators.some(f => 
    platform?.toLowerCase().includes(f.toLowerCase())
  );
}

// Check if seller needs to collect tax in state (considering marketplace facilitator laws)
export function shouldCollectTax(
  stateCode: string,
  totalSales: number,
  transactionCount: number,
  platforms: string[]
): {
  required: boolean;
  reason: string;
  marketplaceOnly: boolean;
} {
  const rule = economicNexusRules.find(r => r.stateCode === stateCode);
  const hasFacilitator = platforms.some(p => isMarketplaceFacilitator(p));
  
  if (!rule) {
    return { required: false, reason: 'No economic nexus rule found', marketplaceOnly: false };
  }
  
  const thresholdMet = totalSales >= rule.thresholdAmount ||
    (rule.thresholdTransactions > 0 && transactionCount >= rule.thresholdTransactions);
  
  // Some states require AND, some require OR
  const isANDState = ['CA', 'CT', 'NY'].includes(stateCode);
  const nexusReached = isANDState
    ? (totalSales >= rule.thresholdAmount && transactionCount >= rule.thresholdTransactions)
    : (totalSales >= rule.thresholdAmount || (rule.thresholdTransactions > 0 && transactionCount >= rule.thresholdTransactions));
  
  if (!nexusReached) {
    return { required: false, reason: 'Below economic nexus threshold', marketplaceOnly: false };
  }
  
  // If marketplace facilitator state and only selling through facilitators
  if (rule.marketplaceFacilitator && hasFacilitator && platforms.every(p => isMarketplaceFacilitator(p))) {
    return { 
      required: false, 
      reason: 'Marketplace facilitator collects on your behalf',
      marketplaceOnly: true 
    };
  }
  
  return { 
    required: true, 
    reason: `Economic nexus threshold met: $${totalSales.toLocaleString()} sales`,
    marketplaceOnly: false 
  };
}

export function calculateSalesTaxSummary(transactions: any[]): ProvinceSalesData[] {
  const salesByProvince: Record<string, number> = {};

  // Aggregate sales by province (shipping_address.province)
  transactions.forEach(tx => {
    if (tx.amount > 0 && tx.province_code) {
      const provinceCode = tx.province_code.toUpperCase();
      salesByProvince[provinceCode] = (salesByProvince[provinceCode] || 0) + tx.amount;
    }
    // Fallback to state_code if province_code not available
    else if (tx.amount > 0 && tx.state_code) {
      const stateCode = tx.state_code.toUpperCase();
      salesByProvince[stateCode] = (salesByProvince[stateCode] || 0) + tx.amount;
    }
  });

  // Build province sales data with nexus status
  const provinceSalesData: ProvinceSalesData[] = Object.entries(salesByProvince).map(([provinceCode, totalSales]) => {
    const customThreshold = nexusThresholds[provinceCode] || nexusThreshold;
    const taxRate = taxRates[provinceCode] || 0.06;
    const taxCollected = totalSales * taxRate;
    const nexusReached = totalSales >= customThreshold;
    const percentage = (totalSales / customThreshold) * 100;

    return {
      provinceCode,
      provinceName: provinceNames[provinceCode] || provinceCode,
      totalSales,
      taxCollected,
      nexusThreshold: customThreshold,
      nexusReached,
      percentage
    };
  });

  // Sort by total sales descending
  return provinceSalesData.sort((a, b) => b.totalSales - a.totalSales);
}

export function getNexusStatus(salesData: ProvinceSalesData[]): {
  totalProvinces: number;
  nexusReachedProvinces: number;
  atRiskProvinces: ProvinceSalesData[];
  filingDeadlines: FilingDeadline[];
  facilitatorStates: string[];
  requiresDirectFiling: ProvinceSalesData[];
} {
  const nexusReachedProvinces = salesData.filter(s => s.nexusReached);
  const atRiskProvinces = salesData.filter(s => !s.nexusReached && s.percentage >= 80);
  
  // Generate filing calendar for states with nexus
  const filingDeadlines = generateFilingCalendar(nexusReachedProvinces);
  
  // Identify marketplace facilitator states
  const facilitatorStates = economicNexusRules
    .filter(r => r.marketplaceFacilitator)
    .map(r => r.stateCode);
  
  // States requiring direct filing (not covered by facilitators)
  const requiresDirectFiling = nexusReachedProvinces.filter(s => {
    const rule = economicNexusRules.find(r => r.stateCode === s.provinceCode);
    return !rule?.marketplaceFacilitator;
  });

  return {
    totalProvinces: salesData.length,
    nexusReachedProvinces: nexusReachedProvinces.length,
    atRiskProvinces,
    filingDeadlines,
    facilitatorStates,
    requiresDirectFiling
  };
}
