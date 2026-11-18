import { usePreferences } from '../utils/preferences';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePos } from '../context/PosContext';
import { sound } from '../utils/sound';
import {
  Wifi,
  MoreVertical,
  ArrowRight,
  XCircle,
  Delete,
  Check,
  AlertCircle,
  UtensilsCrossed,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const preferences = usePreferences();
  const navigate = useNavigate();
  const { login, settings, currentTime } = usePos();

  const [passcode, setPasscode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  // Live formatted time for status bar
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Handle digit input
  const handleDigit = useCallback(
    (digit: string) => {
      if (isSubmitting || loginSuccess) return;
      sound.playTap();
      setErrorMessage(null);

      setPasscode((prev) => {
        if (prev.length < 4) {
          return prev + digit;
        }
        return prev;
      });
    },
    [isSubmitting, loginSuccess]
  );

  // Handle Clear
  const handleClear = useCallback(() => {
    if (isSubmitting || loginSuccess) return;
    sound.playTap();
    setPasscode('');
    setErrorMessage(null);
  }, [isSubmitting, loginSuccess]);

  // Handle Backspace
  const handleBackspace = useCallback(() => {
    if (isSubmitting || loginSuccess) return;
    sound.playTap();
    setPasscode((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  }, [isSubmitting, loginSuccess]);

  // Handle Go / Passcode submission
  const handleGoSubmit = useCallback(
    (codeToVerify?: string) => {
      if (isSubmitting || loginSuccess) return;
      const code = codeToVerify !== undefined ? codeToVerify : passcode;

      if (!code || code.length < 4) {
        sound.playError();
        setErrorMessage('Please enter 4-digit passcode');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 450);
        return;
      }

      setIsSubmitting(true);
      const res = login(code);

      if (res.success) {
        setLoginSuccess(true);
        sound.playSuccess();
        setTimeout(() => {
          navigate(res.user?.role === 'cashier' && preferences.cashierHome === 'pos' ? '/pos' : '/', { replace: true });
        }, 300);
      } else {
        sound.playError();
        setIsSubmitting(false);
        setErrorMessage(res.message || 'Incorrect passcode.');
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
          setPasscode('');
        }, 500);
      }
    },
    [isSubmitting, loginSuccess, login, navigate, passcode, preferences.cashierHome]
  );

  // Auto-submit when 4th digit is entered
  useEffect(() => {
    if (passcode.length === 4) {
      const timer = setTimeout(() => {
        handleGoSubmit(passcode);
      }, 160);
      return () => clearTimeout(timer);
    }
  }, [passcode, handleGoSubmit]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting || loginSuccess) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '#') {
        e.preventDefault();
        sound.playTap();
        if (passcode.length === 4) {
          handleGoSubmit();
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleGoSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleBackspace, handleClear, handleGoSubmit, isSubmitting, loginSuccess]);

  return (
    <div className="h-screen w-screen overflow-hidden select-none bg-[#f1f3f7] text-slate-800 flex flex-col font-sans">
      {/* 1. TOP SYSTEM STATUS BAR */}
      <header className="h-8 bg-[#1e2229] text-slate-300 text-xs px-4 sm:px-6 flex items-center justify-between shrink-0 border-b border-slate-700/60 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-white font-mono font-semibold">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Terminal Lock</span>
          </div>
          <span className="text-slate-500">•</span>
          <span className="font-mono text-slate-400 text-[11px] hidden sm:inline">
            {formattedDate} {formattedTime}
          </span>
        </div>

        <div className="flex items-center space-x-4 text-slate-400 text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Register #01 / Local terminal</span>
          </div>
          <Wifi className="w-3.5 h-3.5 text-slate-300" />
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <MoreVertical className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer" />
        </div>
      </header>

      {/* 2. SUBTLE SYSTEM BANNER */}
      <div className="bg-slate-800 text-slate-200 text-xs py-1 px-4 sm:px-6 flex items-center justify-between shrink-0 border-b border-slate-700/40">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="font-semibold text-white">Shalom Food Enterprise Terminal</span>
          <span className="text-slate-400 hidden md:inline">— Secure Cashier Station</span>
        </div>

      </div>

      {/* 3. MAIN TERMINAL WORKSPACE */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 lg:gap-20 z-10">
          {/* ========================================================= */}
          {/* LEFT SIDE: RESTAURANT BRAND LOGO CARD & ENTERPRISE CARE   */}
          {/* ========================================================= */}
          <div className="flex flex-col items-center justify-center text-center">
            {/* Square Restaurant Logo Card matching Toast style */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-3xl bg-[#fec800] border-2 border-amber-300 shadow-[0_12px_28px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center p-4 sm:p-6 transition-all hover:shadow-[0_16px_32px_rgba(0,0,0,0.12)]">
              {/* Brand Cutlery Insignia */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#002b66]/10 flex items-center justify-center mb-1 text-[#002b66]">
                <UtensilsCrossed className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
              </div>

              {/* Exact Project Restaurant Name */}
              <h1 className="text-[#002b66] font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-none uppercase">
                Shalom
              </h1>
              <h2 className="text-[#002b66] font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-none uppercase -mt-0.5">
                Food
              </h2>

              {/* Subtitle / Department */}
              <div className="mt-3 pt-2 border-t border-[#002b66]/20 w-3/4 flex justify-center">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#002b66]/80 font-mono">
                  Restaurant & POS
                </span>
              </div>
            </div>

            {/* Enterprise Support Text */}
            <div className="mt-4 sm:mt-5 text-center">
              <p className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide">
                Enterprise Care {settings.general.phone || '+94 11 257 8899'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {settings.general.restaurantName} • Terminal #01
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: PASSCODE HEADER, DOTS & CLEAN 3-COL KEYPAD    */}
          {/* ========================================================= */}
          <div className="w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[450px] flex flex-col items-center">
            {/* Header Title */}
            <div className="w-full text-center pb-1">
              <h3 className="text-base sm:text-lg font-medium text-slate-600 tracking-normal">
                Swipe card or enter your passcode
              </h3>
              <div className="w-full h-px bg-slate-200 mt-2" />
            </div>

            {/* 4 Passcode Dots Indicator */}
            <div
              className={`flex items-center justify-center space-x-3.5 my-3 py-2 px-6 rounded-full transition-all duration-200 ${
                errorMessage
                  ? 'bg-rose-100 border border-rose-300'
                  : 'bg-transparent'
              } ${isShaking ? 'animate-shake' : ''}`}
            >
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = idx < passcode.length;
                return (
                  <div
                    key={idx}
                    className={`rounded-full transition-all duration-150 ${
                      isFilled
                        ? 'w-4 h-4 bg-slate-800 scale-125 shadow-xs'
                        : 'w-4 h-4 bg-slate-300/80 border border-slate-400/60'
                    }`}
                  />
                );
              })}
            </div>

            {/* Error or Success feedback message */}
            <div className="h-5 flex items-center justify-center text-xs font-semibold mb-2">
              {errorMessage ? (
                <span className="text-rose-600 flex items-center space-x-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </span>
              ) : loginSuccess ? (
                <span className="text-emerald-600 flex items-center space-x-1 animate-in fade-in duration-150">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Passcode accepted. Loading POS...</span>
                </span>
              ) : (
                <span className="text-slate-400 text-[11px] font-mono">
                  Enter your staff PIN
                </span>
              )}
            </div>

            {/* CLEAN SYMMETRICAL 3-COLUMN KEYPAD */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full">
              {/* Row 1 */}
              {['1', '2', '3'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigit(digit)}
                  disabled={isSubmitting || loginSuccess}
                  className="h-15 sm:h-17 lg:h-18 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:bg-slate-50 active:bg-slate-100 active:scale-[0.98] text-slate-800 text-2xl sm:text-3xl font-bold transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
                >
                  {digit}
                </button>
              ))}

              {/* Row 2 */}
              {['4', '5', '6'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigit(digit)}
                  disabled={isSubmitting || loginSuccess}
                  className="h-15 sm:h-17 lg:h-18 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:bg-slate-50 active:bg-slate-100 active:scale-[0.98] text-slate-800 text-2xl sm:text-3xl font-bold transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
                >
                  {digit}
                </button>
              ))}

              {/* Row 3 */}
              {['7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigit(digit)}
                  disabled={isSubmitting || loginSuccess}
                  className="h-15 sm:h-17 lg:h-18 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:bg-slate-50 active:bg-slate-100 active:scale-[0.98] text-slate-800 text-2xl sm:text-3xl font-bold transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
                >
                  {digit}
                </button>
              ))}

              {/* Row 4: Hash (#), 0, Backspace (⌫) */}
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  if (passcode.length === 4) {
                    handleGoSubmit();
                  }
                }}
                disabled={isSubmitting || loginSuccess}
                title="Hash / Enter (#)"
                className="h-15 sm:h-17 lg:h-18 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:bg-slate-50 active:bg-slate-100 active:scale-[0.98] text-slate-700 hover:text-slate-900 text-2xl sm:text-3xl font-bold font-mono transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
              >
                #
              </button>

              <button
                type="button"
                onClick={() => handleDigit('0')}
                disabled={isSubmitting || loginSuccess}
                className="h-15 sm:h-17 lg:h-18 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:bg-slate-50 active:bg-slate-100 active:scale-[0.98] text-slate-800 text-2xl sm:text-3xl font-bold transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                disabled={isSubmitting || loginSuccess}
                title="Backspace"
                className="h-15 sm:h-17 lg:h-18 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:bg-slate-50 active:bg-slate-100 active:scale-[0.98] text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
              >
                <Delete className="w-7 h-7 stroke-[2]" />
              </button>
            </div>

            {/* PROMINENT EXTRA-LARGE "GO" ACTION BUTTON */}
            <button
              type="button"
              onClick={() => handleGoSubmit()}
              disabled={isSubmitting || loginSuccess}
              className="w-full h-18 sm:h-20 lg:h-22 mt-4 sm:mt-5 rounded-2xl bg-gradient-to-r from-[#0057b8] to-[#0066dc] hover:from-[#00479e] hover:to-[#0057b8] active:from-[#003c85] active:to-[#00479e] shadow-[0_8px_24px_rgba(0,87,184,0.42),0_2px_6px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_rgba(0,87,184,0.5)] text-white flex items-center justify-center space-x-3.5 transition-all cursor-pointer active:scale-[0.99] group disabled:opacity-50"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[2.5px] border-white/95 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3.5]" />
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-widest uppercase drop-shadow-xs">
                {isSubmitting ? 'Verifying...' : 'GO'}
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* 4. FOOTER VERSION BAR */}
      <footer className="h-7 bg-[#1e2229] text-slate-400 text-[11px] px-4 sm:px-6 flex items-center justify-between shrink-0 border-t border-slate-800">
        <div className="flex items-center space-x-2">
          <span>Shalom Food POS 2.76</span>
          <span>•</span>
          <span>Commercial Terminal #01</span>
        </div>
        <div className="flex items-center space-x-3 font-mono text-[10px]">
          <span>App: SF-POS-2026</span>
          <span>•</span>
          <span>Security: Authorized Staff Only</span>
        </div>
      </footer>
    </div>
  );
};
