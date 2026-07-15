import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  updateProfile,
  type ConfirmationResult,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from './client';

export const signUpWithEmail = async (name: string, email: string, password: string): Promise<FirebaseUser> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential.user;
};

export const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
};

// --- Phone (OTP) authentication ---

// One invisible reCAPTCHA verifier per page load, reused across resends.
let recaptchaVerifier: RecaptchaVerifier | null = null;

const getRecaptchaVerifier = (containerId: string): RecaptchaVerifier => {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  }
  return recaptchaVerifier;
};

export const resetRecaptcha = () => {
  recaptchaVerifier?.clear();
  recaptchaVerifier = null;
};

// Sends an OTP SMS. `phoneNumber` must be in E.164 format (e.g. +919876543210).
export const sendPhoneOtp = async (phoneNumber: string, recaptchaContainerId: string): Promise<ConfirmationResult> => {
  const verifier = getRecaptchaVerifier(recaptchaContainerId);
  try {
    return await signInWithPhoneNumber(auth, phoneNumber, verifier);
  } catch (error) {
    // A failed attempt leaves the widget in a bad state; reset so retries work.
    resetRecaptcha();
    throw error;
  }
};

export const confirmPhoneOtp = async (confirmation: ConfirmationResult, code: string): Promise<FirebaseUser> => {
  const credential = await confirmation.confirm(code);
  return credential.user;
};

export const signOutUser = (): Promise<void> => signOut(auth);

export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) =>
  onAuthStateChanged(auth, callback);

export type { FirebaseUser };
