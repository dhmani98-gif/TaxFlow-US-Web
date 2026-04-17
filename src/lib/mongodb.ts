import { MongoClient, Db, Collection, ServerApiVersion } from 'mongodb';

// Support for MongoDB Atlas or local MongoDB
// For Atlas: mongodb+srv://username:password@cluster.xxxxx.mongodb.net/taxflow?retryWrites=true&w=majority
// For Local: mongodb://localhost:27017/taxflow
const MONGODB_URI = typeof process !== 'undefined' && process.env?.MONGODB_URI 
  ? process.env.MONGODB_URI 
  : 'mongodb://localhost:27017/taxflow';
const DB_NAME = 'taxflow';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db;
}

export function getCollection(name: string): Collection {
  return getDatabase().collection(name);
}

// Collections
export const collections = {
  users: () => getCollection('users'),
  organizations: () => getCollection('organizations'),
  transactions: () => getCollection('transactions'),
  connections: () => getCollection('connections'),
  nexus: () => getCollection('nexus'),
  subscriptions: () => getCollection('subscriptions'),
};

// Auth simulation (since we're removing Firebase Auth)
export const auth = {
  currentUser: null as { uid: string; email: string; displayName?: string; photoURL?: string } | null,
  
  async login(email: string, password: string) {
    const users = collections.users();
    const user = await users.findOne({ email, password });
    if (!user) throw new Error('Invalid credentials');
    this.currentUser = { 
      uid: user._id.toString(), 
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
    return this.currentUser;
  },
  
  async signUp(email: string, password: string, displayName?: string) {
    const users = collections.users();
    const existing = await users.findOne({ email });
    if (existing) throw new Error('User already exists');
    
    const result = await users.insertOne({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date(),
    });
    this.currentUser = { 
      uid: result.insertedId.toString(), 
      email,
      displayName: displayName || email.split('@')[0],
    };
    return this.currentUser;
  },
  
  logout() {
    this.currentUser = null;
  },
};
