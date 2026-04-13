import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, Connection, NexusState, Organization } from '../types';

interface AppState {
  organization: Organization | null;
  connections: Connection[];
  transactions: Transaction[];
  nexusStatus: NexusState[];
  isLoading: boolean;
}

const initialState: AppState = {
  organization: {
    id: 'org_1',
    ownerId: 'user_1',
    legalName: 'TaxFlow Solutions LLC',
    taxIdEin: 'XX-XXXX123',
    entityType: 'LLC',
    fiscalYearEnd: '12-31',
  },
  connections: [
    { id: 'conn_1', orgId: 'org_1', platform: 'Shopify', syncStatus: 'Active', lastSuccessfulSync: new Date().toISOString() },
    { id: 'conn_2', orgId: 'org_1', platform: 'Amazon', syncStatus: 'Active', lastSuccessfulSync: new Date().toISOString() },
    { id: 'conn_3', orgId: 'org_1', platform: 'Stripe', syncStatus: 'Active', lastSuccessfulSync: new Date().toISOString() },
  ],
  transactions: [
    { id: 'tx_1', orgId: 'org_1', sourceId: 'SH-1001', transactionDate: '2024-03-10', amount: 1250.00, taxAmount: 75.00, shippingCost: 12.00, feeAmount: 35.00, categoryId: 'cat_1', description: 'Shopify Order #1001', platform: 'Shopify', state: 'CA' },
    { id: 'tx_2', orgId: 'org_1', sourceId: 'AMZ-442', transactionDate: '2024-03-11', amount: 850.00, taxAmount: 0, shippingCost: 0, feeAmount: 127.50, categoryId: 'cat_1', description: 'Amazon Sale', platform: 'Amazon', state: 'TX' },
    { id: 'tx_3', orgId: 'org_1', sourceId: 'FB-ADS', transactionDate: '2024-03-12', amount: -500.00, taxAmount: 0, shippingCost: 0, feeAmount: 0, categoryId: 'cat_8', description: 'Facebook Ads - March', platform: 'Bank' },
  ],
  nexusStatus: [
    { code: 'CA', name: 'California', totalAmount: 82000, transactionCount: 450, threshold: 100000, percentage: 82, status: 'WARNING' },
    { code: 'TX', name: 'Texas', totalAmount: 120000, transactionCount: 620, threshold: 500000, percentage: 24, status: 'SAFE' },
    { code: 'NY', name: 'New York', totalAmount: 105000, transactionCount: 210, threshold: 100000, percentage: 105, status: 'EXCEEDED' },
    { code: 'FL', name: 'Florida', totalAmount: 45000, transactionCount: 180, threshold: 200000, percentage: 22.5, status: 'SAFE' },
  ],
  isLoading: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
  },
});

export const { setLoading, addTransaction } = appSlice.actions;

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
