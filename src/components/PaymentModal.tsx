import React, { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  description: string;
}

export function PaymentModal({ isOpen, onClose, onSuccess, amount, description }: PaymentModalProps) {
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPaymentId(null);
      setCheckoutUrl(null);
      setError(null);
      setIsLoading(false);
      setIsChecking(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleCreatePayment = async () => {
    // Open een leeg tabblad direct bij de klik om popup-blockers te vermijden
    // Let op: we gebruiken hier express GEEN noopener/noreferrer, anders kunnen we het document niet aanpassen.
    const newTab = window.open('', '_blank');

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mollie/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          description
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setPaymentId(data.paymentId);
      setCheckoutUrl(data.checkoutUrl);
      
      // Navigeer het geopende tabblad via een beveiligde meta refresh pagina. 
      // Dit verwijdert de 'Referer' header, waardoor Mollie de "Untrusted request source" fout niet meer geeft.
      if (newTab) {
        newTab.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="referrer" content="no-referrer">
              <meta http-equiv="refresh" content="0; url=${data.checkoutUrl}">
            </head>
            <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f8fafc; color: #64748b;">
              Doorsturen naar Mollie...
            </body>
          </html>
        `);
        newTab.document.close();
      }
    } catch (err: any) {
      if (newTab) newTab.close();
      setError(err.message || 'Kan geen verbinding maken met Mollie.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!paymentId) return;
    setIsChecking(true);
    setError(null);
    try {
      const response = await fetch(`/api/mollie/payment-status/${paymentId}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      if (data.status === 'paid') {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else if (data.status === 'canceled' || data.status === 'failed' || data.status === 'expired') {
        setError(`Betaling is ${data.status === 'canceled' ? 'geannuleerd' : data.status}. Probeer het opnieuw.`);
        setPaymentId(null);
        setCheckoutUrl(null);
      } else {
        setError('Betaling is nog niet afgerond. Controleer nogmaals nadat je betaald hebt.');
      }
    } catch (err: any) {
      setError(err.message || 'Kan betalingsstatus niet ophalen.');
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CreditCard size={20} />
            <h2 className="font-semibold text-slate-900 dark:text-white">Afrekenen (Mollie)</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSuccess}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Betaling geslaagd!</h3>
              <p className="text-slate-500 dark:text-slate-400">De actie wordt nu uitgevoerd...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Omschrijving</span>
                  <span className="text-slate-900 dark:text-white font-medium text-right break-words max-w-[60%]">{description}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700/50 mt-3">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-bold">Totaalbedrag</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xl">€{(amount / 100).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-sm flex gap-2 items-start">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {!checkoutUrl ? (
                <div className="pt-2">
                  <button
                    onClick={handleCreatePayment}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[#00558F] hover:bg-[#004473] text-white rounded-xl transition-colors font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Betalen met Mollie'}
                  </button>
                  <p className="text-xs text-center text-slate-500 mt-3">
                    Je wordt doorgestuurd naar de beveiligde betaalomgeving van Mollie.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center space-y-3">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      We hebben de betaalpagina geopend. Als je deze niet ziet, klik dan op de knop hieronder.
                    </p>
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-medium rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-sm"
                    >
                      Open Betaalpagina <ExternalLink size={16} />
                    </a>
                  </div>
                  
                  <button
                    onClick={handleCheckStatus}
                    disabled={isChecking}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {isChecking ? <Loader2 size={20} className="animate-spin" /> : 'Ik heb betaald (Controleer)'}
                  </button>
                  <button
                    onClick={() => {
                      setCheckoutUrl(null);
                      setPaymentId(null);
                      setError(null);
                    }}
                    className="w-full py-3 px-4 bg-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                  >
                    Betaling annuleren
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
