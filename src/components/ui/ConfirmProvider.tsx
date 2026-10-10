import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

type ConfirmFn = (message: string, options?: ConfirmOptions) => Promise<boolean>;
type AlertFn = (message: string, options?: { title?: string }) => void;

const ConfirmContext = createContext<ConfirmFn | null>(null);
const AlertContext = createContext<AlertFn | null>(null);

// Replaces window.confirm / window.alert, which are blocked in sandboxed preview iframes
export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{
    message: string;
    options: ConfirmOptions;
  } | null>(null);
  const [alertState, setAlertState] = useState<{ message: string; title?: string } | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((message, options = {}) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({ message, options });
    });
  }, []);

  const alert = useCallback<AlertFn>((message, options) => {
    setAlertState({ message, title: options?.title });
  }, []);

  const close = (result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState(null);
  };

  return (
    <AlertContext.Provider value={alert}>
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[60] bg-stone-900/40 flex items-center justify-center p-4"
          onClick={() => close(false)}
        >
          <div
            className="w-full max-w-xs bg-[#fcfaf7] rounded-2xl border border-[#e5decb] shadow-xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  state.options.danger === false ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1 min-w-0">
                {state.options.title && <h3 className="text-xs font-bold text-stone-800">{state.options.title}</h3>}
                <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">{state.message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => close(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                {state.options.cancelText || '取消'}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={`px-3.5 py-1.5 text-white rounded-xl text-xs font-semibold transition-colors active:scale-95 ${
                  state.options.danger === false
                    ? 'bg-stone-900 hover:bg-black'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {state.options.confirmText || '確定'}
              </button>
            </div>
          </div>
        </div>
      )}
      {alertState && (
        <div className="fixed inset-0 z-[60] bg-stone-900/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#fcfaf7] rounded-2xl border border-[#e5decb] shadow-xl p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1 min-w-0">
                {alertState.title && <h3 className="text-xs font-bold text-stone-800">{alertState.title}</h3>}
                <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">{alertState.message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAlertState(null)}
                className="px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition-colors active:scale-95"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
    </AlertContext.Provider>
  );
};

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm 必須在 <ConfirmProvider> 內使用');
  return ctx;
}

export function useAlert(): AlertFn {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert 必須在 <ConfirmProvider> 內使用');
  return ctx;
}
