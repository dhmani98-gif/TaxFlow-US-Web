// Sales Tax Logic - Aggregates sales by state and determines Nexus status

export interface StateSalesData {
  stateCode: string;
  stateName: string;
  totalSales: number;
  taxCollected: number;
  nexusThreshold: number;
  nexusReached: boolean;
  percentage: number;
}

// Nexus thresholds by state (in USD)
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
};

// State names mapping
export const stateNames: Record<string, string> = {
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
};

// Tax rates by state (approximate)
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
};

export function calculateSalesTaxSummary(transactions: any[]): StateSalesData[] {
  const salesByState: Record<string, number> = {};

  // Aggregate sales by state
  transactions.forEach(tx => {
    if (tx.amount > 0 && tx.state_code) {
      const stateCode = tx.state_code.toUpperCase();
      salesByState[stateCode] = (salesByState[stateCode] || 0) + tx.amount;
    }
  });

  // Build state sales data with nexus status
  const stateSalesData: StateSalesData[] = Object.entries(salesByState).map(([stateCode, totalSales]) => {
    const nexusThreshold = nexusThresholds[stateCode] || 100000;
    const taxRate = taxRates[stateCode] || 0.06;
    const taxCollected = totalSales * taxRate;
    const nexusReached = totalSales >= nexusThreshold;
    const percentage = (totalSales / nexusThreshold) * 100;

    return {
      stateCode,
      stateName: stateNames[stateCode] || stateCode,
      totalSales,
      taxCollected,
      nexusThreshold,
      nexusReached,
      percentage
    };
  });

  // Sort by total sales descending
  return stateSalesData.sort((a, b) => b.totalSales - a.totalSales);
}

export function getNexusStatus(salesData: StateSalesData[]): {
  totalStates: number;
  nexusReachedStates: number;
  atRiskStates: StateSalesData[];
} {
  const nexusReachedStates = salesData.filter(s => s.nexusReached);
  const atRiskStates = salesData.filter(s => !s.nexusReached && s.percentage >= 80);

  return {
    totalStates: salesData.length,
    nexusReachedStates: nexusReachedStates.length,
    atRiskStates
  };
}
