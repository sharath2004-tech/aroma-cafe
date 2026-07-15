'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ConfirmationResult } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { sendPhoneOtp, confirmPhoneOtp, resetRecaptcha } from '@/lib/firebase/auth';
import { useAuthStore } from '@/lib/store';

const RECAPTCHA_CONTAINER_ID = 'recaptcha-container';

interface PhoneAuthFormProps {
  // Extra fields sent to /auth/sync on first sign-in (register flow).
  syncPayload?: { name?: string; role?: string };
  // Called before sending the OTP; return an error message to abort (e.g. missing name).
  validateBeforeSend?: () => string | null;
}

// Converts an Indian mobile number to E.164; numbers typed with a leading + pass through.
const toE164 = (raw: string): string | null => {
  const cleaned = raw.replace(/[\s()-]/g, '');
  if (cleaned.startsWith('+')) {
    return /^\+\d{10,15}$/.test(cleaned) ? cleaned : null;
  }
  return /^[6-9]\d{9}$/.test(cleaned) ? `+91${cleaned}` : null;
};

export function PhoneAuthForm({ syncPayload, validateBeforeSend }: PhoneAuthFormProps) {
  const router = useRouter();
  const { syncProfile } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setError('');

    const validationError = validateBeforeSend?.();
    if (validationError) {
      setError(validationError);
      return;
    }

    const e164 = toE164(phone);
    if (!e164) {
      setError('Enter a valid 10-digit Indian mobile number (or full number with country code)');
      return;
    }

    setIsSending(true);
    try {
      const result = await sendPhoneOtp(e164, RECAPTCHA_CONTAINER_ID);
      setConfirmation(result);
      setStep('otp');
    } catch (err: any) {
      setError(
        err?.code === 'auth/too-many-requests'
          ? 'Too many attempts. Please try again later.'
          : 'Failed to send OTP. Please check the number and try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!confirmation) return;
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code sent to your phone');
      return;
    }

    setIsVerifying(true);
    try {
      await confirmPhoneOtp(confirmation, otp);
      const user = await syncProfile(syncPayload);
      router.push(`/dashboard/${user.role}`);
    } catch (err: any) {
      setError(
        err?.code === 'auth/invalid-verification-code'
          ? 'Incorrect OTP. Please try again.'
          : 'Verification failed. Please try again.'
      );
      setIsVerifying(false);
    }
  };

  const handleChangeNumber = () => {
    resetRecaptcha();
    setConfirmation(null);
    setOtp('');
    setError('');
    setStep('phone');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {step === 'phone' ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone Number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className="w-full px-4 py-2 rounded-r-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSendOtp}
            disabled={isSending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2"
          >
            {isSending ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Enter OTP</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit code"
              className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary tracking-widest text-center"
            />
            <p className="text-xs text-muted-foreground">
              OTP sent to {toE164(phone)}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2"
          >
            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
          </Button>

          <button
            type="button"
            onClick={handleChangeNumber}
            className="w-full text-sm text-muted-foreground hover:text-primary transition"
          >
            ← Change phone number
          </button>
        </form>
      )}

      {/* Invisible reCAPTCHA mounts here */}
      <div id={RECAPTCHA_CONTAINER_ID} />
    </div>
  );
}
