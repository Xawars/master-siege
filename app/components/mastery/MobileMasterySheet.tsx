'use client';

import { useEffect, useId, useState } from 'react';
import { ChevronUp, X } from 'lucide-react';
import { MasteryHeader } from './MasteryHeader';
import type { HistoryItem } from '../HistoryList';

interface MobileMasterySheetProps {
  history: HistoryItem[];
  operatorKills: Record<string, number>;
  operatorDeaths: Record<string, number>;
}

export function MobileMasterySheet({
  history,
  operatorKills,
  operatorDeaths,
}: MobileMasterySheetProps) {
  const [open, setOpen] = useState(false);
  const dialogId = useId();
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (document.querySelector('[data-mastery-nested-modal]')) return;
      setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden shrink-0 mb-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 py-2 text-[11px] font-bold uppercase tracking-wider text-brand-500 transition-colors hover:bg-brand-500/15 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
      >
        <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
        Browse Mastery
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close mastery"
            onClick={() => setOpen(false)}
          />
          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex h-[min(75dvh,640px)] w-full flex-col rounded-t-2xl border border-b-0 border-zinc-700/80 bg-zinc-950 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl"
          >
            <div className="relative flex h-8 shrink-0 items-center justify-center">
              <span className="h-1 w-10 rounded-full bg-zinc-700" aria-hidden="true" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Close mastery"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <h2 id={titleId} className="sr-only">
              Operator Mastery
            </h2>
            <div className="min-h-0 flex-1 px-3">
              <MasteryHeader
                history={history}
                operatorKills={operatorKills}
                operatorDeaths={operatorDeaths}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
