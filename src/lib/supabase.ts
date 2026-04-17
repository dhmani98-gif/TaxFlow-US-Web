import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const auth = {
  async signUp(email: string, password: string, displayName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
        emailRedirectTo: undefined, // Disable email confirmation
      },
    });

    if (error) throw error;

    // Create profile record
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        display_name: displayName || email.split('@')[0],
      });
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  onAuthStateChange(callback: (event: any, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database helpers
export const db = {
  // Transactions
  async getTransactions(orgId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        tax_categories (
          id,
          name,
          display_name,
          schedule_c_line
        )
      `)
      .eq('org_id', orgId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTransaction(transaction: any) {
    // Auto-map tax category if not provided
    let categoryId = transaction.tax_category_id;
    if (!categoryId) {
      const { data } = await supabase.rpc('auto_map_transaction', {
        p_description: transaction.description,
        p_platform: transaction.platform,
      });
      categoryId = data;
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        tax_category_id: categoryId,
        auto_mapped: !transaction.tax_category_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Organizations
  async getOrganizations(profileId: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('profile_id', profileId);

    if (error) throw error;
    return data || [];
  },

  async createOrganization(org: any) {
    const { data, error } = await supabase
      .from('organizations')
      .insert(org)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Connections
  async getConnections(orgId: string) {
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('org_id', orgId);

    if (error) throw error;
    return data || [];
  },

  async updateConnection(orgId: string, platform: string, updates: any) {
    const { data, error } = await supabase
      .from('connections')
      .upsert({
        org_id: orgId,
        platform,
        ...updates,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Nexus Status
  async getNexusStatus(orgId: string) {
    const { data, error } = await supabase
      .from('nexus_status')
      .select('*')
      .eq('org_id', orgId);

    if (error) throw error;
    return data || [];
  },

  // Tax Categories
  async getTaxCategories() {
    const { data, error } = await supabase
      .from('tax_categories')
      .select('*')
      .order('schedule_c_line');

    if (error) throw error;
    return data || [];
  },

  // Profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Subscriptions
  async getSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('profile_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No active subscription found
        return null;
      }
      throw error;
    }
    return data;
  },

  // Permission checks based on subscription plan
  async checkPermission(userId: string, permission: string): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    if (!subscription || !subscription.subscription_plans) {
      return false;
    }

    const plan = subscription.subscription_plans;
    
    switch (permission) {
      case 'unlimited_transactions':
        return plan.max_transactions === null;
      case 'advanced_nexus':
        return plan.nexus_monitoring_level === 'advanced';
      case 'irs_schedule_c':
        return plan.features && plan.features.includes('IRS-ready Schedule C');
      case 'multiple_connections':
        return (plan.max_connections || 0) > 1;
      default:
        return false;
    }
  },
};
