// TaxFlow Database Types
// TypeScript interfaces for new database tables

import type { Database } from './supabase';

// ============================================
// Accountant Portal Types
// ============================================

export interface AccountantClient {
  id: string;
  accountant_id: string;
  client_id: string;
  status: 'pending' | 'active' | 'inactive';
  invitation_email?: string;
  invitation_sent_at?: string;
  invitation_accepted_at?: string;
  invitation_token?: string;
  notes?: string;
  custom_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  
  // Joined data
  client?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  client_org?: {
    id: string;
    legal_name: string;
    tax_id_ein?: string;
    entity_type?: string;
  };
}

export interface AccountantClientWithStats extends AccountantClient {
  revenue_ytd?: number;
  estimated_tax?: number;
  nexus_count?: number;
  transactions_count?: number;
  reports_ready?: boolean;
  next_deadline?: string;
}

// ============================================
// AI Categorization Types
// ============================================

export interface AICategorization {
  id: string;
  transaction_id: string;
  suggested_category_id?: string;
  confidence_score?: number;
  ai_model?: string;
  ai_version?: string;
  explanation?: string;
  raw_prompt?: string;
  raw_response?: string;
  user_accepted?: boolean;
  user_override_category_id?: string;
  processing_time_ms?: number;
  created_at: string;
  updated_at: string;
  
  // Joined data
  suggested_category?: {
    id: string;
    name: string;
    schedule_c_line: string;
  };
  user_override_category?: {
    id: string;
    name: string;
    schedule_c_line: string;
  };
}

export interface AICategorizationStats {
  total_processed: number;
  high_confidence: number;
  medium_confidence: number;
  low_confidence: number;
  user_accepted: number;
  user_rejected: number;
  average_processing_time_ms: number;
}

// ============================================
// Integration Sync Log Types
// ============================================

export interface IntegrationSyncLog {
  id: string;
  connection_id: string;
  sync_type: 'full' | 'incremental' | 'manual' | 'scheduled';
  status: 'success' | 'partial' | 'failed' | 'in_progress';
  records_processed: number;
  records_failed: number;
  records_created: number;
  records_updated: number;
  error_message?: string;
  error_details: Record<string, any>;
  sync_config: Record<string, any>;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  triggered_by: 'user' | 'scheduled' | 'webhook';
}

// ============================================
// Filing Deadline Types
// ============================================

export interface FilingDeadline {
  id: string;
  org_id: string;
  form_type: string;
  form_name?: string;
  jurisdiction?: string;
  tax_year: number;
  due_date: string;
  extension_due_date?: string;
  status: 'upcoming' | 'filed' | 'overdue' | 'extension_requested' | 'extension_granted';
  reminder_sent: boolean;
  reminder_sent_at?: string;
  filed_at?: string;
  filed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FilingDeadlineWithDaysLeft extends FilingDeadline {
  days_left: number;
  is_urgent: boolean;
}

// ============================================
// Enhanced Profile Types
// ============================================

export type UserType = 'business_owner' | 'accountant' | 'admin' | 'bookkeeper';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  user_type: UserType;
  phone?: string;
  timezone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  
  // Accountant-specific fields
  accountant_clients_count?: number;
  is_accountant?: boolean;
}

// ============================================
// Enhanced Transaction Types
// ============================================

export type CategorizationSource = 'manual' | 'ai' | 'rule' | 'imported' | 'api';

export interface Transaction {
  id: string;
  org_id: string;
  amount: number;
  description: string;
  transaction_date: string;
  platform: string;
  category_id?: string;
  ai_confidence?: number;
  categorization_source?: CategorizationSource;
  platform_transaction_id?: string;
  state_code?: string;
  province_name?: string;
  country_code: string;
  tax_amount?: number;
  shipping_cost?: number;
  fee_amount?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  
  // Joined data
  ai_categorization?: AICategorization;
}

// ============================================
// Enhanced Tax Category Types
// ============================================

export interface TaxCategory {
  id: string;
  name: string;
  schedule_c_line: string;
  keywords: string[];
  ai_keywords: string[];
  typical_amount_range?: {
    min?: number;
    max?: number;
  };
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Enhanced Connection Types
// ============================================

export interface Connection {
  id: string;
  org_id: string;
  platform: string;
  sync_status: 'active' | 'revoked' | 'syncing' | 'error';
  last_successful_sync?: string;
  settings: Record<string, any>;
  last_sync_records: number;
  consecutive_errors: number;
  sync_schedule: string;
  webhook_url?: string;
  webhook_secret?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  recent_sync_logs?: IntegrationSyncLog[];
  sync_health?: 'healthy' | 'warning' | 'error';
}

// ============================================
// Database Helper Types
// ============================================

// Type for inserting new records
export type TablesInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

// Type for updating records
export type TablesUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

// Type for selecting records
export type TablesRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ============================================
// Real-time Subscription Types
// ============================================

export interface RealtimeChanges<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
}

// ============================================
// Filter and Query Types
// ============================================

export interface DateRange {
  from: string;
  to: string;
}

export interface QueryFilters {
  dateRange?: DateRange;
  platforms?: string[];
  categories?: string[];
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  searchQuery?: string;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

// ============================================
// Export Types
// ============================================

export interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv';
  dateRange: DateRange;
  includeDetails: boolean;
  includePartV: boolean;
  selectedCategories?: string[];
}

// Type guards
export function isAccountant(profile: Profile): boolean {
  return profile.user_type === 'accountant' || profile.user_type === 'admin';
}

export function hasHighConfidence(categorization?: AICategorization): boolean {
  return (categorization?.confidence_score ?? 0) >= 0.8;
}

export function isUpcomingDeadline(deadline: FilingDeadline): boolean {
  return deadline.status === 'upcoming' && new Date(deadline.due_date) > new Date();
}
