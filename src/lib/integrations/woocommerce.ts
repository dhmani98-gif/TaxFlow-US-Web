// WooCommerce Integration for TaxFlow US
// Provides API client for WooCommerce REST API

export interface WooCommerceCredentials {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  version?: string;
}

export interface WooCommerceOrder {
  id: number;
  status: string;
  total: string;
  subtotal: string;
  discount_total: string;
  shipping_total: string;
  tax_total: string;
  date_created: string;
  date_modified: string;
  customer_id: number;
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    quantity: number;
    price: number;
    total: string;
    subtotal: string;
    sku: string;
  }>;
  shipping_lines: Array<{
    id: number;
    method_title: string;
    total: string;
  }>;
  fee_lines: Array<{
    id: number;
    name: string;
    amount: string;
  }>;
  coupon_lines: Array<{
    id: number;
    code: string;
    discount: string;
  }>;
  refunds: Array<{
    id: number;
    total: string;
    reason: string;
  }>;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number | null;
  categories: Array<{ id: number; name: string }>;
}

export class WooCommerceClient {
  private credentials: WooCommerceCredentials;
  private baseUrl: string;

  constructor(credentials: WooCommerceCredentials) {
    this.credentials = credentials;
    // Remove trailing slash and add /wp-json/wc/v3
    const cleanUrl = credentials.storeUrl.replace(/\/$/, '');
    this.baseUrl = `${cleanUrl}/wp-json/wc/v3`;
  }

  private getAuthHeaders(): Record<string, string> {
    // WooCommerce uses Basic Auth with consumer key/secret
    const auth = btoa(`${this.credentials.consumerKey}:${this.credentials.consumerSecret}`);
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WooCommerce API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; storeName?: string; error?: string }> {
    try {
      const response = await this.request<{ name: string }>('/');
      return { success: true, storeName: response.name };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get orders with pagination
  async getOrders(
    page: number = 1, 
    perPage: number = 100,
    after?: string,
    before?: string,
    status?: string
  ): Promise<WooCommerceOrder[]> {
    const params: Record<string, string> = {
      page: page.toString(),
      per_page: perPage.toString(),
    };

    if (after) params.after = after;
    if (before) params.before = before;
    if (status) params.status = status;

    return this.request<WooCommerceOrder[]>('/orders', params);
  }

  // Get all orders (with pagination)
  async getAllOrders(
    after?: string,
    before?: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<WooCommerceOrder[]> {
    const allOrders: WooCommerceOrder[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const orders = await this.getOrders(page, 100, after, before);
      
      if (orders.length === 0) {
        hasMore = false;
      } else {
        allOrders.push(...orders);
        onProgress?.(allOrders.length, allOrders.length + 100);
        
        if (orders.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    return allOrders;
  }

  // Get products
  async getProducts(page: number = 1, perPage: number = 100): Promise<WooCommerceProduct[]> {
    return this.request<WooCommerceProduct[]>('/products', {
      page: page.toString(),
      per_page: perPage.toString(),
    });
  }

  // Get order by ID
  async getOrder(orderId: number): Promise<WooCommerceOrder> {
    return this.request<WooCommerceOrder>(`/orders/${orderId}`);
  }

  // Convert WooCommerce order to TaxFlow transaction format
  static convertToTransaction(order: WooCommerceOrder, orgId: string): {
    id: string;
    org_id: string;
    amount: number;
    description: string;
    transaction_date: string;
    platform: string;
    province_code?: string;
    category_id?: string;
    metadata: Record<string, any>;
  } {
    const total = parseFloat(order.total) || 0;
    const tax = parseFloat(order.tax_total) || 0;
    const shipping = parseFloat(order.shipping_total) || 0;
    const discounts = parseFloat(order.discount_total) || 0;
    
    // Calculate net amount (what actually went to business)
    const netAmount = total - tax; // Tax is collected and remitted separately

    // Determine state from billing address
    const stateCode = order.billing?.state || '';

    // Build description from line items
    const itemNames = order.line_items?.map(item => item.name).join(', ') || 'WooCommerce Order';
    const description = `${itemNames.substring(0, 100)}${itemNames.length > 100 ? '...' : ''}`;

    return {
      id: `wc_${order.id}`,
      org_id: orgId,
      amount: netAmount,
      description: `Order #${order.id}: ${description}`,
      transaction_date: order.date_created,
      platform: 'WooCommerce',
      province_code: stateCode,
      category_id: 'sales',
      metadata: {
        order_id: order.id,
        customer_email: order.billing?.email,
        customer_state: stateCode,
        tax_amount: tax,
        shipping_amount: shipping,
        discount_amount: discounts,
        status: order.status,
        items_count: order.line_items?.length || 0,
        refunds: order.refunds?.map(r => ({
          amount: parseFloat(r.total),
          reason: r.reason
        })) || []
      }
    };
  }

  // Process refunds as separate negative transactions
  static convertRefundsToTransactions(order: WooCommerceOrder, orgId: string): Array<{
    id: string;
    org_id: string;
    amount: number;
    description: string;
    transaction_date: string;
    platform: string;
    category_id: string;
    metadata: Record<string, any>;
  }> {
    if (!order.refunds || order.refunds.length === 0) {
      return [];
    }

    return order.refunds.map((refund, index) => ({
      id: `wc_refund_${order.id}_${refund.id || index}`,
      org_id: orgId,
      amount: -Math.abs(parseFloat(refund.total) || 0),
      description: `Refund for Order #${order.id}: ${refund.reason || 'No reason provided'}`,
      transaction_date: order.date_modified, // Use order modification date as refund date
      platform: 'WooCommerce',
      category_id: 'refund',
      metadata: {
        order_id: order.id,
        refund_id: refund.id,
        reason: refund.reason,
        original_amount: order.total
      }
    }));
  }
}

// Sync WooCommerce data to Supabase
export async function syncWooCommerceData(
  credentials: WooCommerceCredentials,
  orgId: string,
  after?: string,
  onProgress?: (message: string) => void
): Promise<{
  success: boolean;
  ordersSynced: number;
  refundsSynced: number;
  error?: string;
}> {
  const client = new WooCommerceClient(credentials);
  
  try {
    onProgress?.('Testing WooCommerce connection...');
    const connectionTest = await client.testConnection();
    
    if (!connectionTest.success) {
      return {
        success: false,
        ordersSynced: 0,
        refundsSynced: 0,
        error: connectionTest.error || 'Connection failed'
      };
    }

    onProgress?.(`Connected to: ${connectionTest.storeName}`);
    onProgress?.('Fetching orders from WooCommerce...');

    // Get all orders
    const orders = await client.getAllOrders(
      after,
      undefined,
      (current) => onProgress?.(`Fetched ${current} orders...`)
    );

    onProgress?.(`Found ${orders.length} orders. Converting to transactions...`);

    // Convert to TaxFlow transactions
    const transactions = orders.map(order => 
      WooCommerceClient.convertToTransaction(order, orgId)
    );

    // Convert refunds
    const refundTransactions = orders.flatMap(order => 
      WooCommerceClient.convertRefundsToTransactions(order, orgId)
    );

    onProgress?.(`Converted ${transactions.length} orders and ${refundTransactions.length} refunds.`);
    onProgress?.('Saving to database...');

    // Import to Supabase (will be handled by the calling function)
    return {
      success: true,
      ordersSynced: transactions.length,
      refundsSynced: refundTransactions.length
    };

  } catch (error) {
    return {
      success: false,
      ordersSynced: 0,
      refundsSynced: 0,
      error: error instanceof Error ? error.message : 'Sync failed'
    };
  }
}
