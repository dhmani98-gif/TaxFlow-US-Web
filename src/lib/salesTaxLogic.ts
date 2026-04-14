// Sales Tax Logic - Aggregates sales by province and determines Nexus status

export interface ProvinceSalesData {
  provinceCode: string;
  provinceName: string;
  totalSales: number;
  taxCollected: number;
  nexusThreshold: number;
  nexusReached: boolean;
  percentage: number;
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
} {
  const nexusReachedProvinces = salesData.filter(s => s.nexusReached);
  const atRiskProvinces = salesData.filter(s => !s.nexusReached && s.percentage >= 80);

  return {
    totalProvinces: salesData.length,
    nexusReachedProvinces: nexusReachedProvinces.length,
    atRiskProvinces
  };
}
