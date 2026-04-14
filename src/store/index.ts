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
  organization: null,
  connections: [],
  transactions: [],
  nexusStatus: [],
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
