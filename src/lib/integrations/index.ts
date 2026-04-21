// TaxFlow Integrations Hub
// Centralizes all platform integrations

export interface PlatformIntegration {
  id: string;
  name: string;
  category: 'ecommerce' | 'payment' | 'accounting' | 'marketplace';
  icon: string;
  color: string;
  bgColor: string;
  authType: 'oauth' | 'api_key' | 'webhook' | 'credentials';
  capabilities: string[];
  description: string;
  documentationUrl?: string;
  rateLimit?: number;
  supportedCountries: string[];
  setupDifficulty: 'easy' | 'medium' | 'hard';
}

// Export individual integrations
export * from './woocommerce';
export * from './paypal';

// Available integrations registry
export const availableIntegrations: PlatformIntegration[] = [
  // Existing integrations
  {
    id: 'Shopify',
    name: 'Shopify',
    category: 'ecommerce',
    icon: 'ShoppingBag',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    authType: 'api_key',
    capabilities: ['orders', 'products', 'customers', 'inventory'],
    description: 'Sync your Shopify store data including orders, products, and customers.',
    documentationUrl: 'https://help.shopify.com/en/manual/apps/private-apps',
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'all'],
    setupDifficulty: 'medium'
  },
  {
    id: 'Amazon',
    name: 'Amazon Seller',
    category: 'marketplace',
    icon: 'Store',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    authType: 'api_key',
    capabilities: ['orders', 'inventory', 'reports'],
    description: 'Connect your Amazon Seller Central account to import sales and fees.',
    documentationUrl: 'https://developer-docs.amazon.com/sp-api/',
    supportedCountries: ['US', 'CA', 'MX', 'GB', 'DE', 'FR', 'IT', 'ES', 'JP', 'AU'],
    setupDifficulty: 'hard'
  },
  {
    id: 'Stripe',
    name: 'Stripe',
    category: 'payment',
    icon: 'CreditCard',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    authType: 'api_key',
    capabilities: ['transactions', 'charges', 'refunds', 'transfers'],
    description: 'Import Stripe payments, fees, and transfers for accurate reconciliation.',
    documentationUrl: 'https://stripe.com/docs/api',
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'all'],
    setupDifficulty: 'easy'
  },
  {
    id: 'Bank',
    name: 'Business Bank',
    category: 'accounting',
    icon: 'Building2',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    authType: 'credentials',
    capabilities: ['transactions', 'balances'],
    description: 'Connect your business bank account via Plaid or manual import.',
    supportedCountries: ['US', 'CA'],
    setupDifficulty: 'medium'
  },
  
  // NEW: E-commerce Integrations
  {
    id: 'WooCommerce',
    name: 'WooCommerce',
    category: 'ecommerce',
    icon: 'Globe',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    authType: 'api_key',
    capabilities: ['orders', 'products', 'customers', 'refunds', 'coupons'],
    description: 'Sync your WordPress WooCommerce store including orders, products, and customer data.',
    documentationUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs/',
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'all'],
    setupDifficulty: 'medium'
  },
  {
    id: 'eBay',
    name: 'eBay',
    category: 'marketplace',
    icon: 'Tag',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    authType: 'oauth',
    capabilities: ['orders', 'inventory', 'listings', 'fees'],
    description: 'Import eBay sales, fees, and inventory data from your eBay seller account.',
    documentationUrl: 'https://developer.ebay.com/',
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'all'],
    setupDifficulty: 'medium'
  },
  {
    id: 'Etsy',
    name: 'Etsy',
    category: 'marketplace',
    icon: 'Heart',
    color: 'text-orange-600',
    bgColor: 'bg-orange-600/10',
    authType: 'oauth',
    capabilities: ['receipts', 'listings', 'transactions', 'fees'],
    description: 'Connect your Etsy shop to sync sales, listing fees, and transaction data.',
    documentationUrl: 'https://www.etsy.com/developers/documentation/',
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'all'],
    setupDifficulty: 'easy'
  },
  {
    id: 'BigCommerce',
    name: 'BigCommerce',
    category: 'ecommerce',
    icon: 'ShoppingCart',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    authType: 'api_key',
    capabilities: ['orders', 'products', 'customers', 'coupons'],
    description: 'Sync your BigCommerce store data including orders, products, and customer information.',
    documentationUrl: 'https://developer.bigcommerce.com/',
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'all'],
    setupDifficulty: 'medium'
  },
  
  // NEW: Payment Processors
  {
    id: 'PayPal',
    name: 'PayPal',
    category: 'payment',
    icon: 'CreditCard',
    color: 'text-blue-700',
    bgColor: 'bg-blue-700/10',
    authType: 'credentials',
    capabilities: ['transactions', 'refunds', 'disputes', 'balance'],
    description: 'Import PayPal transactions, fees, and refunds for complete payment reconciliation.',
    documentationUrl: 'https://developer.paypal.com/',
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'all'],
    setupDifficulty: 'easy'
  },
  {
    id: 'Square',
    name: 'Square',
    category: 'payment',
    icon: 'Square',
    color: 'text-gray-900',
    bgColor: 'bg-gray-900/10',
    authType: 'oauth',
    capabilities: ['payments', 'refunds', 'disputes', 'invoices'],
    description: 'Connect Square to import in-person payments, online sales, and processing fees.',
    documentationUrl: 'https://developer.squareup.com/',
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'JP'],
    setupDifficulty: 'easy'
  },
  
  // NEW: Accounting Software
  {
    id: 'QuickBooks',
    name: 'QuickBooks Online',
    category: 'accounting',
    icon: 'Calculator',
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    authType: 'oauth',
    capabilities: ['sync_both_ways', 'invoices', 'expenses', 'reports'],
    description: 'Two-way sync with QuickBooks Online for seamless accounting integration.',
    documentationUrl: 'https://developer.intuit.com/',
    supportedCountries: ['US', 'CA', 'GB', 'AU'],
    setupDifficulty: 'medium'
  },
  {
    id: 'Xero',
    name: 'Xero',
    category: 'accounting',
    icon: 'FileText',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    authType: 'oauth',
    capabilities: ['sync_both_ways', 'invoices', 'bills', 'bank_feeds'],
    description: 'Bi-directional sync with Xero accounting software.',
    documentationUrl: 'https://developer.xero.com/',
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'NZ'],
    setupDifficulty: 'medium'
  }
];

// Get integration by ID
export function getIntegration(id: string): PlatformIntegration | undefined {
  return availableIntegrations.find(int => int.id === id);
}

// Get integrations by category
export function getIntegrationsByCategory(category: PlatformIntegration['category']): PlatformIntegration[] {
  return availableIntegrations.filter(int => int.category === category);
}

// Get connected integrations count
export function getConnectedCount(connectedIds: string[]): number {
  return connectedIds.length;
}

// Get integration categories with counts
export function getCategoriesWithCounts(connectedIds: string[]): Array<{
  category: PlatformIntegration['category'];
  total: number;
  connected: number;
}> {
  const categories: PlatformIntegration['category'][] = ['ecommerce', 'payment', 'accounting', 'marketplace'];
  
  return categories.map(category => {
    const integrationsInCategory = availableIntegrations.filter(int => int.category === category);
    const connectedInCategory = integrationsInCategory.filter(int => connectedIds.includes(int.id)).length;
    
    return {
      category,
      total: integrationsInCategory.length,
      connected: connectedInCategory
    };
  });
}

// Integration setup instructions
export interface SetupInstructions {
  steps: Array<{
    title: string;
    description: string;
    code?: string;
    screenshot?: string;
  }>;
  requirements: string[];
  estimatedTime: string;
}

export function getSetupInstructions(integrationId: string): SetupInstructions {
  const instructions: Record<string, SetupInstructions> = {
    WooCommerce: {
      steps: [
        {
          title: 'Install WooCommerce REST API',
          description: 'Ensure WooCommerce is installed and the REST API is enabled in your WordPress admin.'
        },
        {
          title: 'Generate API Keys',
          description: 'Go to WooCommerce > Settings > Advanced > REST API. Click "Add Key" and create a new key with Read permissions.'
        },
        {
          title: 'Enter Store Details',
          description: 'Enter your store URL (e.g., https://yourstore.com) and the Consumer Key and Consumer Secret from WooCommerce.'
        }
      ],
      requirements: ['WordPress 5.0+', 'WooCommerce 3.5+', 'HTTPS enabled'],
      estimatedTime: '5-10 minutes'
    },
    PayPal: {
      steps: [
        {
          title: 'Create PayPal App',
          description: 'Go to PayPal Developer Dashboard and create a new app to get your Client ID and Secret.'
        },
        {
          title: 'Enable Transaction Search',
          description: 'Ensure the Transaction Search API is enabled for your app.'
        },
        {
          title: 'Enter Credentials',
          description: 'Copy your Client ID and Secret. Choose Sandbox for testing or Live for production.'
        }
      ],
      requirements: ['PayPal Business Account', 'API Access enabled'],
      estimatedTime: '3-5 minutes'
    },
    Etsy: {
      steps: [
        {
          title: 'Register as Developer',
          description: 'Register as an Etsy developer at etsy.com/developers.'
        },
        {
          title: 'Create App',
          description: 'Create a new app in the Etsy Developer Portal.'
        },
        {
          title: 'Authorize TaxFlow',
          description: 'Authorize TaxFlow to access your Etsy shop data via OAuth.'
        }
      ],
      requirements: ['Etsy Seller Account', 'Active Shop'],
      estimatedTime: '5 minutes'
    },
    eBay: {
      steps: [
        {
          title: 'Join eBay Developers Program',
          description: 'Join the eBay Developers Program at developer.ebay.com.'
        },
        {
          title: 'Create Sandbox Keys',
          description: 'Create application keys in both Sandbox and Production environments.'
        },
        {
          title: 'User Token',
          description: 'Generate a User Token to authorize TaxFlow to access your eBay account.'
        }
      ],
      requirements: ['eBay Seller Account', 'Developers Program membership'],
      estimatedTime: '10-15 minutes'
    },
    Square: {
      steps: [
        {
          title: 'Square Developer Dashboard',
          description: 'Go to Square Developer Dashboard and create a new application.'
        },
        {
          title: 'OAuth Setup',
          description: 'Configure OAuth settings and get your Application ID and Secret.'
        },
        {
          title: 'Authorize',
          description: 'Connect TaxFlow using OAuth to access your Square transactions.'
        }
      ],
      requirements: ['Square Account', 'OAuth enabled'],
      estimatedTime: '5 minutes'
    },
    QuickBooks: {
      steps: [
        {
          title: 'Intuit Developer Account',
          description: 'Create an Intuit Developer account at developer.intuit.com.'
        },
        {
          title: 'Create App',
          description: 'Create a new app and get your Client ID and Client Secret.'
        },
        {
          title: 'OAuth Connect',
          description: 'Use OAuth to connect your QuickBooks Online company to TaxFlow.'
        }
      ],
      requirements: ['QuickBooks Online Subscription', 'Admin access'],
      estimatedTime: '10 minutes'
    }
  };

  return instructions[integrationId] || {
    steps: [{ title: 'Setup', description: 'Follow the on-screen instructions to connect this integration.' }],
    requirements: [],
    estimatedTime: '5-10 minutes'
  };
}

// Supported file formats for import
export const supportedImportFormats = [
  { format: 'CSV', extensions: ['.csv'], description: 'Comma-separated values' },
  { format: 'Excel', extensions: ['.xlsx', '.xls'], description: 'Microsoft Excel' },
  { format: 'JSON', extensions: ['.json'], description: 'JSON data format' },
  { format: 'QBO', extensions: ['.qbo'], description: 'QuickBooks Online format' },
  { format: 'OFX', extensions: ['.ofx'], description: 'Open Financial Exchange' }
];

// Integration health check
export interface IntegrationHealth {
  status: 'healthy' | 'warning' | 'error';
  lastSync: string | null;
  lastSyncStatus: 'success' | 'failed' | 'in_progress' | null;
  errorMessage?: string;
  syncCount: number;
  syncFrequency: string;
}

export function getDefaultHealth(): IntegrationHealth {
  return {
    status: 'healthy',
    lastSync: null,
    lastSyncStatus: null,
    syncCount: 0,
    syncFrequency: 'Manual'
  };
}
