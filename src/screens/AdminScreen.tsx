import { useDeferredValue, useState, type ReactNode } from 'react';
import { Link, Navigate } from 'react-router';
import clsx from 'clsx';
import {
  Ban, Lock, LockOpen, MessageSquareX, Search, ShieldCheck, ShieldOff, ShieldPlus, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, Button, Chip, ConfirmSheet, EmptyState, ScreenHeader, Skeleton, StatusChip } from '../components';
import { errorMessage } from '../lib/api';
import { formatNumber, formatRelative, plural } from '../lib/format';
import {
  useAdminEventAction, useAdminEvents, useAdminLog, useAdminStats, useAdminUsers, useMe, useSetAdmin,
  type AdminEventAction, type AdminEventFilter,
} from '../lib/queries';
import type { AdminAction, AdminEvent, AdminStats, AdminUser } from '../shared/types';

type Tab = 'spots' | 'people' | 'log';

export function AdminScreen() {
  const me = useMe();
  const [tab, setTab] = useState<Tab>('spots');

  if (me.data && !me.data.isAdmin) return <Navigate to="/profile" replace />;
  if (!me.data) return null;

  return (
    <div className="min-h-dvh bg-paper" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
      <div className="bg-[linear-gradient(180deg,#0B3D2E_0%,#04140D_100%)] pb-5 text-white">
        <ScreenHeader transparent back="/profile" title="Admin panel" className="relative!" />
        <MapHealth />
      </div>

      <div className="sticky top-0 z-20 bg-paper/90 px-4 pb-3 pt-3 backdrop-blur-md">
        <div role="tablist" aria-label="Admin sections" className="grid grid-cols-3 gap-1 rounded-pill bg-line-soft p-1">
          {(
            [
              ['spots', 'Spots'],
              ['people', 'People'],
              ['log', 'Activity'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={clsx(
                'h-10 rounded-pill text-sm font-semibold transition-[background-color,color,box-shadow] duration-150',
                tab === key ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {tab === 'spots' && <SpotsTab />}
        {tab === 'people' && <PeopleTab meId={me.data.id} />}
        {tab === 'log' && <LogTab />}
      </div>
    </div>
  );
}

// ───────────── Header: the state of the map at a glance ─────────────

const SEGMENTS: { key: keyof AdminStats['spots']; label: string; color: string }[] = [
  { key: 'open', label: 'to clean', color: 'bg-spot-open' },
  { key: 'inProgress', label: 'cleaning', color: 'bg-spot-live' },
  { key: 'cleaned', label: 'cleaned', color: 'bg-[#2FA54C]' },
  { key: 'closed', label: 'closed', color: 'bg-white/35' },
];

function MapHealth() {
  const stats = useAdminStats();
  if (stats.isPending) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-2">
        <Skeleton className="h-9 w-40 opacity-20" />
        <Skeleton className="h-3 w-full rounded-pill! opacity-20" />
      </div>
    );
  }
  if (stats.isError) return <p className="px-4 pt-2 text-sm text-mist">{errorMessage(stats.error)}</p>;
  const s = stats.data;
  const total = s.spots.open + s.spots.inProgress + s.spots.cleaned + s.spots.closed;

  return (
    <div className="flex flex-col gap-4 px-4 pt-1">
      <p className="font-display text-[28px] font-bold leading-none">
        {formatNumber(total)} <span className="text-lg font-semibold text-mist">{total === 1 ? 'spot' : 'spots'} on record</span>
      </p>

      <div>
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-pill bg-white/10" role="img" aria-label="Spots by state">
          {total > 0 &&
            SEGMENTS.map(seg =>
              s.spots[seg.key] > 0 ? (
                <span key={seg.key} className={seg.color} style={{ flexGrow: s.spots[seg.key], flexBasis: 0 }} />
              ) : null,
            )}
        </div>
        <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-mist">
          {SEGMENTS.map(seg => (
            <li key={seg.key} className="inline-flex items-center gap-1.5">
              <span className={clsx('size-2 rounded-full', seg.color)} />
              <span className="font-semibold text-white tabular-nums">{s.spots[seg.key]}</span> {seg.label}
            </li>
          ))}
        </ul>
      </div>

      <dl className="grid grid-cols-4 gap-2 border-t border-white/10 pt-3 text-center">
        <Figure label="People" value={s.users} />
        <Figure label="Admins" value={s.admins} />
        <Figure label="New today" value={s.spotsToday} />
        <Figure label="Cleaned, 7 d" value={s.cleanupsThisWeek} />
      </dl>
    </div>
  );
}

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-[11px] leading-tight text-mist">{label}</dt>
      <dd className="font-display text-xl font-bold tabular-nums">{formatNumber(value)}</dd>
    </div>
  );
}

// ───────────── Spots ─────────────

const FILTERS: { key: AdminEventFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'To clean' },
  { key: 'in_progress', label: 'Cleaning' },
  { key: 'cleaned', label: 'Cleaned' },
  { key: 'closed', label: 'Closed' },
];

const ACTION_COPY: Record<AdminEventAction, { title: string; body: string; label: string; done: string }> = {
  close: {
    title: 'Close this spot?',
    body: 'It disappears from the map and nobody can join, check in or finish it. You can reopen it later.',
    label: 'Close spot',
    done: 'Spot closed.',
  },
  reopen: {
    title: 'Reopen this spot?',
    body: 'It goes back on the map and works normally again.',
    label: 'Reopen spot',
    done: 'Spot reopened.',
  },
  delete: {
    title: 'Delete this spot for good?',
    body: 'The spot and its photos are removed permanently. Rewards already paid stay in people’s history.',
    label: 'Delete spot',
    done: 'Spot deleted.',
  },
};

function SpotsTab() {
  const [filter, setFilter] = useState<AdminEventFilter>('all');
  const [query, setQuery] = useState('');
  const q = useDeferredValue(query.trim());
  const events = useAdminEvents(filter, q);
  const act = useAdminEventAction();
  const [pending, setPending] = useState<{ ev: AdminEvent; action: AdminEventAction } | null>(null);
  const copy = pending ? ACTION_COPY[pending.action] : null;

  const run = async () => {
    if (!pending) return;
    try {
      await act.mutateAsync({ id: pending.ev.id, action: pending.action });
      toast.success(ACTION_COPY[pending.action].done);
      setPending(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <SearchInput value={query} onChange={setQuery} placeholder="Search by title, place or email" />
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {FILTERS.map(f => (
          <Chip key={f.key} selected={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {events.isPending && <ListSkeleton />}
      {events.isError && <p className="py-6 text-center text-sm text-muted">{errorMessage(events.error)}</p>}
      {events.isSuccess && events.data.length === 0 && (
        <EmptyState title="No spots match" body="Try another filter or search." />
      )}
      {events.isSuccess && events.data.length > 0 && (
        <ul className={clsx('flex flex-col gap-2 transition-opacity', events.isPlaceholderData && 'opacity-60')}>
          {events.data.map(ev => (
            <SpotRow key={ev.id} ev={ev} onAction={action => setPending({ ev, action })} />
          ))}
        </ul>
      )}

      <ConfirmSheet
        open={!!pending}
        title={copy?.title ?? ''}
        body={
          pending && (
            <>
              <span className="font-semibold text-ink">{pending.ev.title}</span>
              <br />
              {copy?.body}
            </>
          )
        }
        confirmLabel={copy?.label ?? ''}
        cancelLabel="Cancel"
        tone={pending?.action === 'reopen' ? 'default' : 'danger'}
        loading={act.isPending}
        onConfirm={run}
        onClose={() => setPending(null)}
      />
    </div>
  );
}

function SpotRow({ ev, onAction }: { ev: AdminEvent; onAction: (a: AdminEventAction) => void }) {
  return (
    <li className="rounded-card bg-surface p-3 shadow-card">
      <Link to={`/spots/${ev.id}`} className="flex gap-3 rounded-md transition-transform active:scale-[.99]">
        <img
          src={ev.thumbUrl}
          alt=""
          loading="lazy"
          className={clsx('size-16 shrink-0 rounded-md bg-line-soft object-cover', ev.closedAt && 'grayscale')}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {ev.closedAt ? (
              <span className="inline-flex h-6 items-center gap-1 rounded-pill bg-line-soft px-2.5 text-xs font-semibold text-muted">
                <Lock size={12} /> Closed
              </span>
            ) : (
              <StatusChip status={ev.status} size="sm" />
            )}
            {!ev.isPublic && <span className="text-xs font-medium text-muted">Solo</span>}
          </div>
          <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug">{ev.title}</h3>
          <p className="truncate text-[13px] text-muted">
            {ev.organizer.email}, {formatRelative(ev.createdAt)}
          </p>
        </div>
      </Link>
      <div className="mt-3 flex items-center gap-2 border-t border-line/60 pt-3">
        <span className="mr-auto text-[13px] text-muted">
          {ev.isPublic ? `${plural(ev.participantCount, 'hero', 'heroes')}, ${ev.checkedInCount} checked in` : 'Solo cleanup'}
        </span>
        {ev.closedAt ? (
          <Button size="sm" variant="secondary" icon={<LockOpen size={16} />} onClick={() => onAction('reopen')}>
            Reopen
          </Button>
        ) : (
          <Button size="sm" variant="secondary" icon={<Lock size={16} />} onClick={() => onAction('close')}>
            Close
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="px-3! text-danger hover:bg-danger-soft"
          aria-label={`Delete ${ev.title}`}
          onClick={() => onAction('delete')}
        >
          <Trash2 size={18} />
        </Button>
      </div>
    </li>
  );
}

// ───────────── People ─────────────

function PeopleTab({ meId }: { meId: string }) {
  const [query, setQuery] = useState('');
  const q = useDeferredValue(query.trim());
  const users = useAdminUsers(q);
  const setAdmin = useSetAdmin();
  const [pending, setPending] = useState<AdminUser | null>(null);

  const run = async () => {
    if (!pending) return;
    try {
      await setAdmin.mutateAsync({ id: pending.id, isAdmin: !pending.isAdmin });
      toast.success(pending.isAdmin ? `${pending.email} is no longer an admin.` : `${pending.email} is now an admin.`);
      setPending(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <SearchInput value={query} onChange={setQuery} placeholder="Search by name or email" />

      {users.isPending && <ListSkeleton />}
      {users.isError && <p className="py-6 text-center text-sm text-muted">{errorMessage(users.error)}</p>}
      {users.isSuccess && users.data.length === 0 && <EmptyState title="Nobody matches" body="Check the spelling of the name or email." />}
      {users.isSuccess && users.data.length > 0 && (
        <ul className={clsx('flex flex-col overflow-hidden rounded-card bg-surface shadow-card', users.isPlaceholderData && 'opacity-60')}>
          {users.data.map(u => (
            <li key={u.id} className="flex items-center gap-3 border-b border-line/60 px-3 py-3 last:border-b-0">
              <Avatar initials={u.initials} level={u.level} seed={u.id} size={40} frame={false} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-semibold">
                  <span className="truncate">{u.displayName}</span>
                  {u.isAdmin && <ShieldCheck size={15} className="shrink-0 text-brand" aria-label="Admin" />}
                </p>
                <p className="truncate text-[13px] text-muted">{u.email}</p>
                <p className="text-xs text-muted">
                  {formatNumber(u.xp)} XP, {formatNumber(u.coins)} coins, {plural(u.spotsOrganized, 'spot')}
                </p>
              </div>
              {u.id !== meId && (
                <Button
                  size="sm"
                  variant={u.isAdmin ? 'ghost' : 'secondary'}
                  className={clsx('px-3!', u.isAdmin && 'text-danger hover:bg-danger-soft')}
                  aria-label={u.isAdmin ? `Remove admin from ${u.email}` : `Make ${u.email} an admin`}
                  onClick={() => setPending(u)}
                >
                  {u.isAdmin ? <ShieldOff size={18} /> : <ShieldPlus size={18} />}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmSheet
        open={!!pending}
        title={pending?.isAdmin ? 'Remove admin access?' : 'Make this person an admin?'}
        body={
          pending && (
            <>
              <span className="font-semibold text-ink">{pending.email}</span>
              <br />
              {pending.isAdmin
                ? 'They lose access to this panel right away.'
                : 'They can close and delete any spot, and manage other admins.'}
            </>
          )
        }
        confirmLabel={pending?.isAdmin ? 'Remove admin' : 'Make admin'}
        cancelLabel="Cancel"
        tone={pending?.isAdmin ? 'danger' : 'default'}
        loading={setAdmin.isPending}
        onConfirm={run}
        onClose={() => setPending(null)}
      />
    </div>
  );
}

// ───────────── Activity log ─────────────

const LOG_VERB: Record<AdminAction['action'], string> = {
  close_event: 'closed',
  reopen_event: 'reopened',
  delete_event: 'deleted',
  grant_admin: 'made an admin:',
  revoke_admin: 'removed admin from',
  delete_message: 'removed a chat message in',
};

const LOG_ICON: Record<AdminAction['action'], ReactNode> = {
  close_event: <Lock size={16} />,
  reopen_event: <LockOpen size={16} />,
  delete_event: <Ban size={16} />,
  grant_admin: <ShieldPlus size={16} />,
  revoke_admin: <ShieldOff size={16} />,
  delete_message: <MessageSquareX size={16} />,
};

function LogTab() {
  const log = useAdminLog();
  if (log.isPending) return <ListSkeleton />;
  if (log.isError) return <p className="py-6 text-center text-sm text-muted">{errorMessage(log.error)}</p>;
  if (log.data.length === 0) {
    return <EmptyState title="Nothing yet" body="Every close, reopen, delete and admin change shows up here." />;
  }
  return (
    <ol className="flex flex-col overflow-hidden rounded-card bg-surface shadow-card">
      {log.data.map(a => {
        const target = a.targetType === 'event' ? a.detail?.title : a.detail?.email;
        return (
          <li key={a.id} className="flex gap-3 border-b border-line/60 px-3 py-3 last:border-b-0">
            <span
              className={clsx(
                'mt-0.5 grid size-8 shrink-0 place-items-center rounded-full',
                a.action === 'delete_event' || a.action === 'revoke_admin'
                  ? 'bg-danger-soft text-danger'
                  : 'bg-brand-soft text-brand',
              )}
            >
              {LOG_ICON[a.action]}
            </span>
            <div className="min-w-0 flex-1 text-[14px] leading-snug">
              <p>
                <span className="font-semibold">{a.admin?.displayName ?? 'A removed admin'}</span> {LOG_VERB[a.action]}{' '}
                {a.targetType === 'event' && a.action !== 'delete_event' && a.targetId ? (
                  <Link to={`/spots/${a.targetId}`} className="font-medium text-brand underline-offset-2 hover:underline">
                    {target}
                  </Link>
                ) : (
                  <span className="font-medium">{target}</span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted">{formatRelative(a.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ───────────── Bits ─────────────

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block">
      <span className="sr-only">Search</span>
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-pill border-[1.5px] border-line bg-surface pl-11 pr-4 text-[15px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/15"
      />
    </label>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map(i => (
        <Skeleton key={i} className="h-[92px] w-full rounded-card!" />
      ))}
    </div>
  );
}
