// PayPal Integration for TaxFlow US
// Provides API client for PayPal REST API v2

export interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'live';
}

export interface PayPalTransaction {
  id: string;
  status: string;
  amount: {
    total: string;
    currency: string;
    breakdown?: {
      item_total?: { currency_code: string; value: string };
      shipping?: { currency_code: string; value: string };
      handling?: { currency_code: string; value: string };
      tax_total?: { currency_code: string; value: string };
      shipping_discount?: { currency_code: string; value: string };
      discount?: { currency_code: string; value: string };
    };
  };
  final_capture_amount?: {
    currency_code: string;
    value: string;
  };
  seller_receivable_breakdown?: {
    gross_amount: { currency_code: string; value: string };
    paypal_fee: { currency_code: string; value: string };
    net_amount: { currency_code: string; value: string };
    receivable_amount?: { currency_code: string; value: string };
    platform_fees?: Array<{
      amount: { currency_code: string; value: string };
    }>;
  };
  invoice_id?: string;
  custom_id?: string;
  payer: {
    email_address: string;
    payer_id?: string;
    name?: { given_name: string; surname: string };
    address?: {
      country_code: string;
    };
  };
  create_time: string;
  update_time: string;
}

export interface PayPalBalanceTransaction {
  transaction_id: string;
  transaction_event_code: string;
  transaction_initiation_date: string;
  transaction_updated_date: string;
  transaction_amount: {
    currency_code: string;
    value: string;
  };
  fee_amount?: {
    currency_code: string;
    value: string;
  };
  insurance_amount?: {
    currency_code: string;
    value: string;
  };
  shipping_amount?: {
    currency_code: string;
    value: string;
  };
  sales_tax_amount?: {
    currency_code: string;
    value: string;
  };
  shipping_discount_amount?: {
    currency_code: string;
    value: string;
  };
  transaction_status: string;
  transaction_subject?: string;
  transaction_note?: string;
  payer_email?: string;
  payer_name?: { given_name: string; surname: string };
  custom_field?: string;
}

export class PayPalClient {
  private credentials: PayPalCredentials;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(credentials: PayPalCredentials) {
    this.credentials = credentials;
  }

  private getBaseUrl(): string {
    return this.credentials.environment === 'live'
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const url = `${this.getBaseUrl()}/v1/oauth2/token`;
    const auth = btoa(`${this.credentials.clientId}:${this.credentials.clientSecret}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`PayPal Auth Error: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    // Set expiry slightly before actual expiry
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);
    
    return this.accessToken;
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const token = await this.getAccessToken();
    const url = new URL(`${this.getBaseUrl()}${endpoint}`);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayPal API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.getAccessToken();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }

  // Get transactions (v2 Reporting API)
  async getTransactions(
    startDate: string,
    endDate: string,
    transactionType?: string,
    balanceAffectingRecordsOnly?: boolean
  ): Promise<{ transactions: PayPalBalanceTransaction[]; total_items: number; total_pages: number }> {
    const params: Record<string, string> = {
      start_date: startDate,
      end_date: endDate,
      page_size: '500',
      page: '1',
    };

    if (transactionType) params.transaction_type = transactionType;
    if (balanceAffectingRecordsOnly !== undefined) {
      params.balance_affecting_records_only = balanceAffectingRecordsOnly ? 'Y' : 'N';
    }

    return this.request('/v1/reporting/transactions', params);
  }

  // Get all transactions with pagination
  async getAllTransactions(
    startDate: string,
    endDate: string,
    onProgress?: (current: number) => void
  ): Promise<PayPalBalanceTransaction[]> {
    const allTransactions: PayPalBalanceTransaction[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const params: Record<string, string> = {
        start_date: startDate,
        end_date: endDate,
        page_size: '500',
        page: page.toString(),
        balance_affecting_records_only: 'Y',
      };

      const token = await this.getAccessToken();
      const url = new URL(`${this.getBaseUrl()}/v1/reporting/transactions`);
      Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`PayPal API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.transaction_details && data.transaction_details.length > 0) {
        allTransactions.push(...data.transaction_details);
        onProgress?.(allTransactions.length);

        // Check if there are more pages
        if (data.total_pages && page >= data.total_pages) {
          hasMore = false;
        } else if (data.transaction_details.length < 500) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }

    return allTransactions;
  }

  // Convert PayPal transaction to TaxFlow format
  static convertToTransaction(
    paypalTx: PayPalBalanceTransaction,
    orgId: string
  ): {
    id: string;
    org_id: string;
    amount: number;
    description: string;
    transaction_date: string;
    platform: string;
    category_id?: string;
    metadata: Record<string, any>;
  } {
    const amount = parseFloat(paypalTx.transaction_amount.value) || 0;
    const fee = parseFloat(paypalTx.fee_amount?.value || '0');
    const netAmount = amount - fee;

    // Determine category based on transaction type
    let categoryId = 'other';
    const eventCode = paypalTx.transaction_event_code;
    
    if (eventCode?.startsWith('T000')) {
      // Payment received
      categoryId = 'sales';
    } else if (eventCode?.startsWith('T020') || eventCode?.startsWith('T030')) {
      // Refund
      categoryId = 'refund';
    } else if (eventCode?.includes('FEE')) {
      // Fee
      categoryId = 'paypal_fees';
    }

    return {
      id: `pp_${paypalTx.transaction_id}`,
      org_id: orgId,
      amount: netAmount,
      description: paypalTx.transaction_subject || 
                   paypalTx.transaction_note || 
                   `PayPal Transaction ${paypalTx.transaction_id}`,
      transaction_date: paypalTx.transaction_initiation_date,
      platform: 'PayPal',
      category_id: categoryId,
      metadata: {
        paypal_transaction_id: paypalTx.transaction_id,
        event_code: eventCode,
        status: paypalTx.transaction_status,
        gross_amount: amount,
        fee_amount: fee,
        net_amount: netAmount,
        payer_email: paypalTx.payer_email,
        payer_name: paypalTx.payer_name,
        custom_field: paypalTx.custom_field,
        currency: paypalTx.transaction_amount.currency_code,
      }
    };
  }

  // Get transaction details
  async getTransactionDetails(transactionId: string): Promise<PayPalTransaction> {
    return this.request<PayPalTransaction>(`/v2/payments/captures/${transactionId}`);
  }
}

// Sync PayPal data to Supabase
export async function syncPayPalData(
  credentials: PayPalCredentials,
  orgId: string,
  startDate?: string,
  endDate?: string,
  onProgress?: (message: string) => void
): Promise<{
  success: boolean;
  transactionsSynced: number;
  error?: string;
}> {
  const client = new PayPalClient(credentials);
  
  try {
    onProgress?.('Testing PayPal connection...');
    const connectionTest = await client.testConnection();
    
    if (!connectionTest.success) {
      return {
        success: false,
        transactionsSynced: 0,
        error: connectionTest.error || 'Connection failed'
      };
    }

    onProgress?.('Connected to PayPal API');
    
    // Default to last 90 days if no dates specified
    const end = endDate || new Date().toISOString();
    const start = startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    
    onProgress?.(`Fetching transactions from ${start.split('T')[0]} to ${end.split('T')[0]}...`);

    const transactions = await client.getAllTransactions(start, end, (count) => {
      onProgress?.(`Fetched ${count} transactions...`);
    });

    onProgress?.(`Found ${transactions.length} transactions. Processing...`);

    // Convert to TaxFlow format
    const convertedTransactions = transactions.map(tx => 
      PayPalClient.convertToTransaction(tx, orgId)
    );

    onProgress?.(`Converted ${convertedTransactions.length} transactions.`);

    return {
      success: true,
      transactionsSynced: convertedTransactions.length
    };

  } catch (error) {
    return {
      success: false,
      transactionsSynced: 0,
      error: error instanceof Error ? error.message : 'Sync failed'
    };
  }
}
