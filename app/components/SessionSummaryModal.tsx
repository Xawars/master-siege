'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/Button';
import type { SessionDeltaData, SessionOperatorDelta } from '../types/database';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: SessionDeltaData;
  streakCount?: number;
  isHotStreak?: boolean;
}

function performerScore(operator: SessionOperatorDelta): number {
  if (operator.deaths > 0) return operator.kills / operator.deaths;
  if (operator.kills > 0) return Number.POSITIVE_INFINITY;
  return 0;
}

function formatPerformerKd(operator: SessionOperatorDelta): string {
  if (operator.deaths === 0 && operator.kills > 0) return operator.kills.toFixed(2);
  if (operator.deaths === 0) return '—';
  return (operator.kills / operator.deaths).toFixed(2);
}

function rankPerformers(operators: SessionOperatorDelta[]) {
  const ranked = [...operators].sort((a, b) => {
    const score = performerScore(b) - performerScore(a);
    if (score !== 0) return score;
    if (a.kills !== b.kills) return b.kills - a.kills;
    return a.operatorName.localeCompare(b.operatorName);
  });
  const best = ranked[0] ?? null;
  const worst = ranked.length > 1 ? ranked[ranked.length - 1] : null;
  return { best, worst };
}

/**
 * Shareable end-of-session card. Shows the session K/D, operators played,
 * best and worst performers, and the kill streak. The card itself is the
 * export surface; dismiss controls sit outside it.
 */
export function SessionSummaryModal({
  isOpen,
  onClose,
  sessionData,
  streakCount = 0,
  isHotStreak = false,
}: SessionSummaryModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { kills, deaths, kdRatio, isPerfect, isEmpty, operators, bestMap, mapWinLossSummary } = sessionData;
  const { best, worst } = rankPerformers(operators);

  const handleSave = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#09090b',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = 'master-siege-session.png';
      link.href = dataUrl;
      link.click();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-label="Session summary"
    >
      <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
          aria-label="Close session summary"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          ref={cardRef}
          className="overflow-hidden rounded-xl border border-brand-500/30 bg-[#09090b] shadow-2xl"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-brand-500/15 to-transparent px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-500">Master Siege</p>
            <h2 className="mt-1 text-lg font-black uppercase tracking-tight text-white">Session Summary</h2>
          </div>

          <div className="px-5 py-4">
            {isEmpty ? (
              <p className="py-6 text-center text-sm text-zinc-400">
                No matches recorded this session
              </p>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <StatBlock label="Kills" value={String(kills)} />
                  <StatBlock label="Deaths" value={String(deaths)} />
                  <StatBlock
                    label="K/D"
                    value={isPerfect ? `${kills} Perfect` : kdRatio !== null ? kdRatio.toFixed(2) : '—'}
                    highlight={isPerfect}
                  />
                </div>

                <div className="mb-4 grid grid-cols-2 gap-2">
                  <PerformerBlock label="Best" operator={best} tone="best" />
                  <PerformerBlock label="Worst" operator={worst} tone="worst" />
                </div>

                <div className={`mb-4 flex items-center justify-between rounded-lg border px-3 py-2 ${
                  isHotStreak ? 'border-brand-500/40 bg-brand-500/10' : 'border-zinc-800 bg-zinc-900'
                }`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Streak</p>
                  <p className={`text-sm font-black tabular-nums ${isHotStreak ? 'text-brand-400' : 'text-white'}`}>
                    {streakCount}
                    {isHotStreak ? ' Hot' : ''}
                  </p>
                </div>

                {bestMap && (
                  <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Best Map</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{bestMap.mapName}</span>
                      <span className="text-sm font-bold text-brand-400">{bestMap.kd.toFixed(2)} K/D</span>
                    </div>
                  </div>
                )}

                {mapWinLossSummary && (
                  <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Map Results</p>
                    <div className="flex items-center gap-3 text-sm tabular-nums">
                      <span className="font-medium text-green-400">{mapWinLossSummary.wins}W</span>
                      <span className="font-medium text-red-400">{mapWinLossSummary.losses}L</span>
                    </div>
                  </div>
                )}

                {operators.length > 0 && (
                  <div data-testid="session-operators">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Operators</p>
                    <div className="space-y-1.5">
                      {operators.map((op) => (
                        <div
                          key={op.operatorId}
                          className="flex items-center justify-between rounded-md bg-zinc-900 px-3 py-1.5"
                        >
                          <span className="truncate text-sm text-zinc-200">{op.operatorName}</span>
                          <div className="flex items-center gap-2 text-xs tabular-nums">
                            <span className="text-green-400">{op.kills}K</span>
                            <span className="text-red-400">{op.deaths}D</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button type="button" variant="outline" size="sm" className="flex-1" onClick={handleSave} disabled={saving} icon={Download}>
            {saving ? 'Saving' : 'Save image'}
          </Button>
          <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className="mb-0.5 text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${highlight ? 'text-brand-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

function PerformerBlock({
  label,
  operator,
  tone,
}: {
  label: string;
  operator: SessionOperatorDelta | null;
  tone: 'best' | 'worst';
}) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${
      tone === 'best' ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
    }`}>
      <p className={`text-[10px] font-bold uppercase tracking-wider ${tone === 'best' ? 'text-green-400' : 'text-red-400'}`}>
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-white">{operator ? operator.operatorName : '—'}</p>
      <p className="text-[11px] font-bold tabular-nums text-zinc-400">
        {operator ? `${formatPerformerKd(operator)} K/D` : '—'}
      </p>
    </div>
  );
}
