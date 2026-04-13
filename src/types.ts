export type EntityType = 'LLC' | 'S-Corp' | 'C-Corp' | 'Sole_Proprietorship';
export type Platform = 'Shopify' | 'Amazon' | 'Stripe' | 'Bank';
export type SyncStatus = 'Active' | 'Revoked' | 'Syncing';
export type NexusStatus = 'SAFE' | 'WARNING' | 'EXCEEDED';

export interface Organization {
  id: string;
  ownerId: string;
  legalName: string;
  taxIdEin: string; // Encrypted in real app
  entityType: EntityType;
  fiscalYearEnd: string;
}

export interface Connection {
  id: string;
  orgId: string;
  platform: Platform;
  syncStatus: SyncStatus;
  lastSuccessfulSync: string;
}

export interface Transaction {
  id: string;
  orgId: string;
  sourceId: string;
  transactionDate: string;
  amount: number;
  taxAmount: number;
  shippingCost: number;
  feeAmount: number;
  categoryId: string;
  description: string;
  platform: Platform;
  state?: string; // For Nexus tracking
}

export interface NexusState {
  code: string;
  name: string;
  totalAmount: number;
  transactionCount: number;
  threshold: number;
  percentage: number;
  status: NexusStatus;
}

export interface IRSCategory {
  id: string;
  name: string;
  scheduleCLine: string;
}
