import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { usePos } from '../../context/PosContext';
import { Banknote, CreditCard, QrCode, CheckCircle2, Delete, ArrowRight } from 'lucide-react';
import { Order, PaymentMethod } from '../../types/pos';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onPaymentSuccess: (order: Order) => void;
  pendingOrder?: Order | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onPaymentSuccess,
  pendingOrder = null,
}) => {
  const { createOrder, completePendingPayment, addNotification } = usePos();
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [tenderAmount, setTenderAmount] = useState<string>(Math.ceil(totalAmount).toString());
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex'>('visa');
  const [cardRef, setCardRef] = useState<string>('AUTH-' + Math.floor(100000 + Math.random() * 900000));
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMethod('cash');
      setTenderAmount(Math.ceil(totalAmount).toString());
      setIsProcessing(false);
    }
  }, [isOpen, totalAmount]);

  const numericTender = parseFloat(tenderAmount) || 0;
  const changeDue = Math.max(0, numericTender - totalAmount);

  // Quick denomination buttons for Sri Lankan Rupees
  const denominations = [500, 1000, 2000, 5000];

  const handleNumpad = (val: string) => {
    if (val === 'C') {
      setTenderAmount('');
    } else if (val === 'backspace') {
      setTenderAmount((prev) => prev.slice(0, -1));
    } else {
      setTenderAmount((prev) => prev + val);
    }
  };

  const handleExactCash = () => {
    setTenderAmount(Math.ceil(totalAmount).toString());
  };

  const handleQuickAdd = (amount: number) => {
    setTenderAmount((prev) => {
      const current = parseFloat(prev) || 0;
      return (current + amount).toString();
    });
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    if (method === 'cash') {
      addNotification({
        title: 'Cash drawer simulated',
        message: 'A frontend cash-drawer pulse was simulated for this payment.',
        type: 'info',
      });
    }

    setTimeout(() => {
      const newOrder = pendingOrder
        ? completePendingPayment(method, numericTender)
        : createOrder(method, numericTender, true);
      setIsProcessing(false);
      if (newOrder) onPaymentSuccess(newOrder);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Process Settlement & Payment"
      subtitle="Select payment method and enter tendered amount"
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Method Selector & Amount Due */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Total Amount Payable
            </span>
            <div className="text-3xl font-black text-blue-900 mt-1">
              Rs. {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Payment Method Pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Payment Method
            </label>
            <button
              type="button"
              onClick={() => {
                setMethod('cash');
                setTenderAmount(Math.ceil(totalAmount).toString());
              }}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                method === 'cash'
                  ? 'border-blue-600 bg-blue-50/60 font-bold text-blue-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span className="text-sm">Cash Settlement</span>
              </div>
              {method === 'cash' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod('card');
                setTenderAmount(totalAmount.toString());
              }}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                method === 'card'
                  ? 'border-blue-600 bg-blue-50/60 font-bold text-blue-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Credit / Debit Card</span>
              </div>
              {method === 'card' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod('qr');
                setTenderAmount(totalAmount.toString());
              }}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                method === 'qr'
                  ? 'border-blue-600 bg-blue-50/60 font-bold text-blue-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <QrCode className="w-5 h-5 text-purple-600" />
                <span className="text-sm">LankaQR / Digital</span>
              </div>
              {method === 'qr' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </button>
          </div>
        </div>

        {/* Right Column: Interaction Details (Cash Numpad or Card Details or QR) */}
        <div className="md:col-span-7 flex flex-col justify-between">
          {method === 'cash' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Cash Tendered (Rs.)</label>
                  <button
                    type="button"
                    onClick={handleExactCash}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Exact Amount (Rs. {Math.ceil(totalAmount)})
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={tenderAmount ? `Rs. ${parseFloat(tenderAmount).toLocaleString()}` : 'Rs. 0'}
                    className="w-full text-right text-2xl font-black px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              {/* Quick LKR Denomination Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {denominations.map((denom) => (
                  <button
                    key={denom}
                    type="button"
                    onClick={() => handleQuickAdd(denom)}
                    className="py-2 px-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 active:scale-95 transition-transform"
                  >
                    +{denom}
                  </button>
                ))}
              </div>

              {/* Touch Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'backspace'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNumpad(key)}
                    className="h-11 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 shadow-xs flex items-center justify-center transition-colors"
                  >
                    {key === 'backspace' ? <Delete className="w-4 h-4 text-slate-600" /> : key}
                  </button>
                ))}
              </div>

              {/* Change Due Box */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase text-emerald-800">
                    Change Due
                  </span>
                  <div className="text-xl font-black text-emerald-700">
                    Rs. {changeDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                {numericTender < totalAmount && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                    Short by Rs. {(totalAmount - numericTender).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {method === 'card' && (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Card Brand</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'visa', label: 'Visa' },
                    { id: 'mastercard', label: 'Mastercard' },
                    { id: 'amex', label: 'AMEX' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCardType(c.id as any)}
                      className={`py-3 rounded-xl border-2 text-xs font-bold text-center transition-all ${
                        cardType === c.id
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  POS EDC Terminal Approval Ref #
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="e.g. AUTH-489210"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Frontend simulation only. A real card terminal can be integrated later.
                </p>
              </div>
            </div>
          )}

          {method === 'qr' && (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-36 h-36 bg-white p-2 border-2 border-slate-800 rounded-xl flex items-center justify-center shadow-md">
                <QrCode className="w-32 h-32 text-slate-900" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Scan LankaQR / PromptPay</p>
                <p className="text-[11px] text-slate-500">
                  Amount: Rs. {totalAmount.toLocaleString()} • Merchant: Shalom Food Colombo
                </p>
              </div>
            </div>
          )}

          {/* Confirm Payment Button */}
          <div className="pt-4 mt-auto">
            <button
              type="button"
              disabled={isProcessing || (method === 'cash' && numericTender < totalAmount)}
              onClick={handleComplete}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {isProcessing ? (
                <span>Authorizing & Recording...</span>
              ) : (
                <>
                  <span>Confirm Payment & Preview Receipt</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

