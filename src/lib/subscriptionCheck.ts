import { supabase } from './supabase';

export interface SubscriptionStatus {
  canAccess: boolean;
  status: 'trialing' | 'active' | 'expired';
  daysRemaining?: number;
  trialEndsAt?: Date;
}

/**
 * Check if user's trial is active or expired
 */
export async function checkSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { canAccess: false, status: 'expired' };
    }

    // Get user profile with trial info
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('trial_starts_at, subscription_status')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      console.error('Error fetching profile:', error);
      // Default to trialing if profile fetch fails (allow access)
      return { canAccess: true, status: 'trialing' };
    }

    // If subscription is active, allow access
    if (profile.subscription_status === 'active') {
      return { canAccess: true, status: 'active' };
    }

    // If trial_starts_at is null, set it to now (for existing users)
    if (!profile.trial_starts_at) {
      console.log('trial_starts_at is null, defaulting to now');
      return { canAccess: true, status: 'trialing' };
    }

    // Check if trial period has expired
    const trialStart = new Date(profile.trial_starts_at);
    const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    const now = new Date();

    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    if (daysRemaining <= 0) {
      // Trial expired
      return {
        canAccess: false,
        status: 'expired',
        daysRemaining: 0,
        trialEndsAt: trialEnd
      };
    }

    // Trial still active
    return {
      canAccess: true,
      status: 'trialing',
      daysRemaining,
      trialEndsAt: trialEnd
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    // Default to trialing on any error (allow access)
    return { canAccess: true, status: 'trialing' };
  }
}

/**
 * Update user's subscription status
 */
export async function updateSubscriptionStatus(status: 'trialing' | 'active' | 'expired') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ subscription_status: status })
      .eq('id', user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return { success: false, error };
  }
}
