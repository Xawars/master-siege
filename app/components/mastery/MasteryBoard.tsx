'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Search, Shield, Swords } from 'lucide-react';
import { operators } from '../../data/operators';
import { OperatorIcon } from '../OperatorIcon';
import { MasteryDetailModal, type MasteryOperatorData } from './MasteryDetailModal';
import type { MasteryTier } from './MasteryRow';
import type { Operator, Side } from '../../data/types';
import type { HistoryItem } from '../HistoryList';

interface MasteryBoardProps {
  history: HistoryItem[];
  operatorKills: Record<string, number>;
  operatorDeaths: Record<string, number>;
}

type SideFilter = 'all' | Side;
type SortKey = 'tier' | 'kd' | 'deployments';
type SortDirection = 'asc' | 'desc';

const TIER_RANK: Record<MasteryTier, number> = {
  unplayed: 0,
  recruit: 1,
  operative: 2,
  veteran: 3,
  elite: 4,
};

const TIER_LABEL: Record<MasteryTier, string> = {
  unplayed: 'New',
  recruit: 'Recruit',
  operative: 'Operative',
  veteran: 'Veteran',
  elite: 'Elite',
};

const TIER_BADGE: Record<MasteryTier, string> = {
  unplayed: 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50',
  recruit: 'bg-zinc-800 text-zinc-300 border-zinc-600/50',
  operative: 'bg-amber-950/50 text-amber-500 border-amber-700/50',
  veteran: 'bg-slate-900/50 text-slate-200 border-slate-400/50',
  elite: 'bg-brand-950/50 text-brand-500 border-brand-600/50',
};

function computeTier(deployments: number, kd: number | null): MasteryTier {
  if (deployments === 0) return 'unplayed';
  if (deployments >= 25 && kd !== null && kd >= 1) return 'elite';
  if (deployments >= 10) return 'veteran';
  if (deployments >= 3) return 'operative';
  return 'recruit';
}

interface BoardRow {
  operator: Operator;
  tier: MasteryTier;
  deployments: number;
  kills: number;
  deaths: number;
  kd: number | null;
  lastPlayed: string | null;
}

export function MasteryBoard({ history, operatorKills, operatorDeaths }: MasteryBoardProps) {
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState<SideFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('tier');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);

  const rows = useMemo(() => {
    const stats = new Map<string, { deployments: number; kills: number; deaths: number; lastPlayed: string | null }>();

    for (const item of history) {
      const id = item.operator.id;
      const entry = stats.get(id) ?? { deployments: 0, kills: 0, deaths: 0, lastPlayed: null };
      entry.deployments += 1;
      if (!entry.lastPlayed) entry.lastPlayed = new Date(item.id).toISOString();
      stats.set(id, entry);
    }
    for (const [id, kills] of Object.entries(operatorKills)) {
      const entry = stats.get(id) ?? { deployments: 0, kills: 0, deaths: 0, lastPlayed: null };
      entry.kills = kills;
      stats.set(id, entry);
    }
    for (const [id, deaths] of Object.entries(operatorDeaths)) {
      const entry = stats.get(id);
      if (entry) entry.deaths = deaths;
    }

    const query = search.trim().toLowerCase();
    const built: BoardRow[] = operators
      .filter((operator) => sideFilter === 'all' || operator.side === sideFilter)
      .filter((operator) => !query || operator.name.toLowerCase().includes(query))
      .map((operator) => {
        const entry = stats.get(operator.id);
        const deployments = entry?.deployments ?? 0;
        const kills = entry?.kills ?? 0;
        const deaths = entry?.deaths ?? 0;
        const kd = deaths > 0 ? Math.round((kills / deaths) * 100) / 100 : kills > 0 ? kills : null;
        return {
          operator,
          tier: computeTier(deployments, kd),
          deployments,
          kills,
          deaths,
          kd,
          lastPlayed: entry?.lastPlayed ?? null,
        };
      });

    const direction = sortDirection === 'desc' ? -1 : 1;
    built.sort((a, b) => {
      let diff = 0;
      if (sortKey === 'tier') diff = TIER_RANK[a.tier] - TIER_RANK[b.tier];
      else if (sortKey === 'deployments') diff = a.deployments - b.deployments;
      else diff = (a.kd ?? -1) - (b.kd ?? -1);
      if (diff !== 0) return diff * direction;
      return a.operator.name.localeCompare(b.operator.name);
    });
    return built;
  }, [history, operatorKills, operatorDeaths, search, sideFilter, sortKey, sortDirection]);

  const selectedData: MasteryOperatorData | null = useMemo(() => {
    if (!selectedOperator) return null;
    const row = rows.find((entry) => entry.operator.id === selectedOperator.id) ?? null;
    const deployments = row?.deployments ?? 0;
    const kills = row?.kills ?? 0;
    const deaths = row?.deaths ?? 0;
    const kd = row?.kd ?? null;
    const tier = row?.tier ?? 'unplayed';
    const totalDeployments = history.length;
    const totalXp = deployments * 50 + kills * 10;
    const tierThresholds: Record<MasteryTier, number> = {
      unplayed: 50,
      recruit: 300,
      operative: 800,
      veteran: 2000,
      elite: 2000,
    };
    const xpToNext = tierThresholds[tier];
    return {
      operator: selectedOperator,
      tier,
      kills,
      deaths,
      kd,
      deployments,
      avgKills: deployments > 0 ? Math.round((kills / deployments) * 10) / 10 : null,
      pickRate: totalDeployments > 0 ? (deployments / totalDeployments) * 100 : 0,
      lastPlayed: row?.lastPlayed ?? null,
      xp: tier === 'elite' ? totalXp : totalXp % xpToNext,
      xpToNextTier: xpToNext,
    };
  }, [selectedOperator, rows, history.length]);

  const chooseSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'));
      return;
    }
    setSortKey(key);
    setSortDirection('desc');
  };

  return (
    <>
      <div className="flex h-full min-h-0 w-full flex-col">
        <div className="mb-3 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-brand-500">Mastery</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {rows.length} operator{rows.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sort operators">
            <SortButton active={sortKey === 'tier'} direction={sortDirection} onClick={() => chooseSort('tier')}>
              Tier
            </SortButton>
            <SortButton active={sortKey === 'kd'} direction={sortDirection} onClick={() => chooseSort('kd')}>
              K/D
            </SortButton>
            <SortButton active={sortKey === 'deployments'} direction={sortDirection} onClick={() => chooseSort('deployments')}>
              Deployments
            </SortButton>
          </div>
        </div>

        <div className="mb-3 flex shrink-0 flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search operators..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/80 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5" role="group" aria-label="Filter by side">
            <FilterButton active={sideFilter === 'all'} onClick={() => setSideFilter('all')}>All</FilterButton>
            <FilterButton active={sideFilter === 'attacker'} onClick={() => setSideFilter('attacker')}>
              <Swords className="h-3.5 w-3.5" aria-hidden="true" /> ATK
            </FilterButton>
            <FilterButton active={sideFilter === 'defender'} onClick={() => setSideFilter('defender')}>
              <Shield className="h-3.5 w-3.5" aria-hidden="true" /> DEF
            </FilterButton>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-auto-hide pb-4">
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-500">No operators match that search.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:hidden">
                {rows.map((row) => (
                  <OperatorCard key={row.operator.id} row={row} onClick={setSelectedOperator} />
                ))}
              </div>
              <OperatorTable rows={rows} sortKey={sortKey} sortDirection={sortDirection} onSort={chooseSort} onSelect={setSelectedOperator} />
            </>
          )}
        </div>
      </div>
      <MasteryDetailModal data={selectedData} onClose={() => setSelectedOperator(null)} />
    </>
  );
}

function OperatorCard({ row, onClick }: { row: BoardRow; onClick: (operator: Operator) => void }) {
  const kdColor = row.kd !== null && row.kd >= 1 ? 'text-green-400' : row.kd !== null ? 'text-red-400' : 'text-zinc-500';
  return (
    <button
      type="button"
      onClick={() => onClick(row.operator)}
      className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-left transition-colors hover:border-zinc-600 hover:bg-zinc-800/70"
    >
      <div className="flex items-center gap-2">
        <OperatorMark operator={row.operator} tier={row.tier} />
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-wide text-zinc-100">{row.operator.name}</p>
          <p className={`text-[9px] font-bold uppercase tracking-wider ${row.operator.side === 'attacker' ? 'text-orange-500/80' : 'text-blue-400/80'}`}>
            {row.operator.side === 'attacker' ? 'ATK' : 'DEF'}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className={`rounded border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${TIER_BADGE[row.tier]}`}>
          {TIER_LABEL[row.tier]}
        </span>
        <span className={`text-[11px] font-black tabular-nums ${kdColor}`}>{row.kd !== null ? row.kd.toFixed(2) : '—'}</span>
        <span className="text-[10px] font-bold tabular-nums text-zinc-400">{row.deployments}×</span>
      </div>
    </button>
  );
}

function OperatorTable({
  rows,
  sortKey,
  sortDirection,
  onSort,
  onSelect,
}: {
  rows: BoardRow[];
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  onSelect: (operator: Operator) => void;
}) {
  return (
    <table className="hidden w-full border-separate border-spacing-y-1 md:table">
      <thead className="sticky top-0 bg-zinc-950/95">
        <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          <th className="px-3 py-2 font-bold">Operator</th>
          <th className="px-3 py-2 font-bold">Side</th>
          <th className="px-3 py-2 font-bold">
            <HeaderSort active={sortKey === 'tier'} direction={sortDirection} onClick={() => onSort('tier')}>Tier</HeaderSort>
          </th>
          <th className="px-3 py-2 font-bold">
            <HeaderSort active={sortKey === 'kd'} direction={sortDirection} onClick={() => onSort('kd')}>K/D</HeaderSort>
          </th>
          <th className="px-3 py-2 text-right font-bold">
            <HeaderSort active={sortKey === 'deployments'} direction={sortDirection} onClick={() => onSort('deployments')}>Deployments</HeaderSort>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const kdColor = row.kd !== null && row.kd >= 1 ? 'text-green-400' : row.kd !== null ? 'text-red-400' : 'text-zinc-500';
          return (
            <tr
              key={row.operator.id}
              tabIndex={0}
              onClick={() => onSelect(row.operator)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(row.operator);
                }
              }}
              className="cursor-pointer rounded-lg bg-zinc-900/40 text-sm hover:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <td className="rounded-l-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <OperatorMark operator={row.operator} tier={row.tier} />
                  <span className="font-bold uppercase tracking-wide text-zinc-100">{row.operator.name}</span>
                </div>
              </td>
              <td className={`px-3 py-2 text-xs font-bold uppercase ${row.operator.side === 'attacker' ? 'text-orange-500' : 'text-blue-400'}`}>
                {row.operator.side === 'attacker' ? 'ATK' : 'DEF'}
              </td>
              <td className="px-3 py-2">
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${TIER_BADGE[row.tier]}`}>
                  {TIER_LABEL[row.tier]}
                </span>
              </td>
              <td className={`px-3 py-2 font-black tabular-nums ${kdColor}`}>{row.kd !== null ? row.kd.toFixed(2) : '—'}</td>
              <td className="rounded-r-lg px-3 py-2 text-right font-bold tabular-nums text-zinc-300">{row.deployments}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function OperatorMark({ operator, tier }: { operator: Operator; tier: MasteryTier }) {
  const ring = tier === 'elite'
    ? 'border-brand-500'
    : tier === 'veteran'
      ? 'border-slate-300'
      : tier === 'operative'
        ? 'border-amber-700'
        : tier === 'recruit'
          ? 'border-zinc-500'
          : 'border-zinc-700/50';
  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 ${ring} ${operator.side === 'attacker' ? 'bg-orange-900/20' : 'bg-blue-900/20'}`}>
      <OperatorIcon id={operator.id} className={`h-5 w-5 ${tier === 'unplayed' ? 'grayscale opacity-50' : ''}`}>
        <span className="text-[9px] font-bold text-zinc-500">{operator.name[0]}</span>
      </OperatorIcon>
    </div>
  );
}

function SortButton({
  active,
  direction,
  onClick,
  children,
}: {
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
        active
          ? 'border-brand-500/40 bg-brand-500/15 text-brand-500'
          : 'border-zinc-700/50 bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {children}
      {active ? (direction === 'desc' ? ' ↓' : ' ↑') : ''}
    </button>
  );
}

function HeaderSort({
  active,
  direction,
  onClick,
  children,
}: {
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
  children: string;
}) {
  return (
    <button type="button" onClick={onClick} className={`uppercase tracking-wider ${active ? 'text-brand-500' : 'hover:text-zinc-300'}`}>
      {children}
      {active ? (direction === 'desc' ? ' ↓' : ' ↑') : ''}
    </button>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
        active
          ? 'border-brand-500/30 bg-brand-500/20 text-brand-500'
          : 'border-zinc-700/30 bg-zinc-800/60 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
      }`}
    >
      {children}
    </button>
  );
}
