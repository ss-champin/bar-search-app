'use client';

/**
 * 酒類提供サービス向けの年齢確認（20歳以上）を1回だけ表示。
 * DB に年齢は保存しない。localStorage で再表示を抑制する。
 */
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'barsearch_age_confirmed_v1';

export default function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !window.localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const confirm = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <dialog
      className="fixed inset-0 z-[100] m-0 flex h-screen w-screen max-h-none max-w-none items-center justify-center border-0 bg-slate-900/70 px-4 backdrop-blur-sm"
      open
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="max-w-md rounded-2xl bg-white p-6 shadow-strong border border-slate-200">
        <h2 id="age-gate-title" className="text-lg font-bold text-slate-900 mb-2">
          年齢確認
        </h2>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          当サービスはお酒に関する情報を含みます。日本の法律により、20歳未満の方はご利用いただけません。
        </p>
        <p className="text-sm font-medium text-slate-800 mb-4">あなたは20歳以上ですか？</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => {
              window.location.href = 'https://www.google.com/';
            }}
            className="px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            いいえ
          </button>
          <button
            type="button"
            onClick={confirm}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold hover:from-primary-700 hover:to-accent-700 transition-colors"
          >
            はい、20歳以上です
          </button>
        </div>
      </div>
    </dialog>
  );
}
