import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

const stripePublicKey = (import.meta as any).env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

function CheckoutForm({ amount, onSuccess, onCancel, description }: { amount: number, onSuccess: () => void, onCancel: () => void, description: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'An error occurred.');
      setIsProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed.');
      setIsProcessing(false);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Betaling geslaagd!</h3>
        <p className="text-slate-500 dark:text-slate-400">De actie wordt nu uitgevoerd...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-500 dark:text-slate-400 text-sm">{description}</span>
          <span className="font-bold text-slate-900 dark:text-white text-lg">€{(amount / 100).toFixed(2).replace('.', ',')}</span>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
        <PaymentElement />
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? 'Bezig met verwerken...' : 'Betalen'}
        </button>
      </div>
    </form>
  );
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  description: string;
}

export function PaymentModal({ isOpen, onClose, onSuccess, amount, description }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && amount > 0) {
      setIsLoading(true);
      setError(null);
      
      if (!stripePromise) {
        setError('Stripe is niet geconfigureerd. Voeg VITE_STRIPE_PUBLIC_KEY en STRIPE_SECRET_KEY toe aan je environment variables.');
        setIsLoading(false);
        return;
      }

      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, description }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setClientSecret(data.clientSecret);
          }
        })
        .catch((err) => {
          setError('Kan geen verbinding maken met de betaalserver.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setClientSecret(null);
    }
  }, [isOpen, amount, description]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-950 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <CreditCard size={20} />
            <h2 className="font-semibold text-slate-900 dark:text-white">Afrekenen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400">Betaling voorbereiden...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4 flex justify-center">
                <X size={48} />
              </div>
              <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Sluiten
              </button>
            </div>
          ) : clientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <CheckoutForm 
                amount={amount} 
                onSuccess={() => {
                  setClientSecret(null);
                  onSuccess();
                }} 
                onCancel={onClose} 
                description={description}
              />
            </Elements>
          ) : null}
        </div>
      </div>
    </div>
  );
}
