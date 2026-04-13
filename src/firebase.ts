import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.error("Firebase configuration is missing or invalid. Please check firebase-applet-config.json");
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connected successfully");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const resetPassword = (email: string) => {
  console.log("Attempting to send password reset email to:", email);
  return sendPasswordResetEmail(auth, email);
};

export const signUp = (email: string, pass: string) => {
  console.log("Attempting to sign up user:", email);
  return createUserWithEmailAndPassword(auth, email, pass).then(async (userCredential) => {
    console.log("User created, sending verification email...");
    await sendEmailVerification(userCredential.user);
    return userCredential;
  });
};

export const login = (email: string, pass: string) => {
  console.log("Attempting to login user:", email);
  return signInWithEmailAndPassword(auth, email, pass);
};
