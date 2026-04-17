// API Client for Backend MongoDB
const API_BASE = '';

// Auth API
export const auth = {
  currentUser: null as { uid: string; email: string; displayName?: string } | null,

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const text = await res.text();
      let errMsg = 'Login failed';
      try {
        const err = JSON.parse(text);
        errMsg = err.error || err.message || 'Login failed';
      } catch {
        errMsg = text || `Server error: ${res.status}`;
      }
      throw new Error(errMsg);
    }
    const user = await res.json();
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async signUp(email: string, password: string, displayName?: string) {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName })
    });
    if (!res.ok) {
      const text = await res.text();
      let errMsg = 'Signup failed';
      try {
        const err = JSON.parse(text);
        errMsg = err.error || err.message || 'Signup failed';
      } catch {
        errMsg = text || `Server error: ${res.status}`;
      }
      throw new Error(errMsg);
    }
    const user = await res.json();
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('user');
  },

  checkAuth() {
    const saved = localStorage.getItem('user');
    if (saved) {
      this.currentUser = JSON.parse(saved);
    }
    return this.currentUser;
  }
};

// Transactions API
export const transactions = {
  async list(orgId: string) {
    const res = await fetch(`${API_BASE}/api/transactions/${orgId}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async create(data: any) {
    const res = await fetch(`${API_BASE}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  }
};

// Nexus API
export const nexus = {
  async list(orgId: string) {
    const res = await fetch(`${API_BASE}/api/nexus/${orgId}`);
    if (!res.ok) throw new Error('Failed to fetch nexus');
    return res.json();
  }
};

// Connections API
export const connections = {
  async list(orgId: string) {
    const res = await fetch(`${API_BASE}/api/connections/${orgId}`);
    if (!res.ok) throw new Error('Failed to fetch connections');
    return res.json();
  },

  async update(data: any) {
    const res = await fetch(`${API_BASE}/api/connections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update connection');
    return res.json();
  }
};

// Health check
export async function checkHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}
