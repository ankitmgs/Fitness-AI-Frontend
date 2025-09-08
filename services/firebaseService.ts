// FIX: Switched to the Firebase v9 compat library to address module resolution issues.
// This is a more stable way to initialize Firebase if the modular SDK is causing import errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { firebaseConfig } from '../firebaseConfig';
import { User as FirebaseUser } from 'firebase/auth';

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

export type User = FirebaseUser;

class FirebaseService {
  signInWithGoogle() {
    return auth.signInWithPopup(googleProvider);
  }

  createUserWithEmailAndPassword(email: string, pass: string) {
    return auth.createUserWithEmailAndPassword(email, pass);
  }

  signInWithEmailAndPassword(email: string, pass: string) {
    return auth.signInWithEmailAndPassword(email, pass);
  }

  signOut() {
    return auth.signOut();
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return auth.onAuthStateChanged(callback);
  }
}

export const firebaseService = new FirebaseService();
