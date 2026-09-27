import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Bell, Camera, Gift, Map as MapIcon, Plus, QrCode, Share2, Trash2, Wallet } from 'lucide-react';
import type {
  EventPin,
  EventStatus,
  HistoryEntry,
  LeaderboardEntry,
  PhotoAnalysis,
  PublicUser,
  RankLevel,
  ShopItem,
  Voucher,
} from '../shared/types';
import { RANKS } from '../shared/ranks';
import { SHOP_ITEMS } from '../shared/shop';
import { directionsUrl } from '../lib/geo';
import {
  AiAnalysisCard,
  Avatar,
  BeforeAfter,
  Button,
  ButtonLink,
  CelebrationOverlay,
  CenterPin,
  CheckedInSuccess,
  Chip,
  CleanupRewardCard,
  CoinIcon,
  CoinPill,
  ConfirmSheet,
  CountUp,
  EmptyState,
  Field,
  FilterChips,
  HistoryRow,
  HoldButton,
  IconButton,
  LeaderRow,
  LeaderRowSkeleton,
  LevelUpReveal,
  Logo,
  Notice,
  OtpInput,
  ParticipantStack,
  PhotoCapture,
  PhotoPreview,
  Podium,
  QrTicket,
  RankBadge,
  RankCard,
  ScreenHeader,
  Sheet,
  ShopItemCard,
  Skeleton,
  SpotCard,
  SpotCardSkeleton,
  SpotMarker,
  SpotPreviewCard,
  SproutIcon,
  StatusChip,
  Steps,
  TAB_BAR_SPACE,
  TabBar,
  UserDot,
  UserName,
  VerifyingAnimation,
  VoucherTicket,
  XpBar,
  XpIcon,
  leafConfetti,
} from '../components';

// ---------- mock data ----------
const BEFORE = '/api/dev/sample/before1';
const AFTER = '/api/dev/sample/after1';
const LEVELS: RankLevel[] = [0, 1, 2, 3, 4];
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

const USERS: PublicUser[] = [
  { id: 'u-yacine', displayName: 'Yacine M.', initials: 'YM', level: 4, xp: 3240 },
  { id: 'u-amina', displayName: 'Amina S.', initials: 'AS', level: 3, xp: 1560 },
  { id: 'u-karim', displayName: 'Karim D.', initials: 'KD', level: 2, xp: 720 },
  { id: 'u-lina', displayName: 'Lina K.', initials: 'LK', level: 1, xp: 240 },
  { id: 'u-rayan', displayName: 'Rayan B.', initials: 'RB', level: 0, xp: 60 },
  { id: 'u-sofia', displayName: 'Sofia Benali-Hadj-Mohamed', initials: 'SB', level: 1, xp: 180 },
  { id: 'u-nour', displayName: 'Nour H.', initials: 'NH', level: 0, xp: 40 },
  { id: 'u-ilyes', displayName: 'Ilyes T.', initials: 'IT', level: 2, xp: 410 },
];
const byLevel = (l: RankLevel) => USERS.find(u => u.level === l)!;
const BOARD: LeaderboardEntry[] = USERS.slice().sort((a, b) => b.xp - a.xp).map((user, i) => ({ position: i + 1, user }));

const PINS: EventPin[] = [
  { id: 'e1', title: 'Plastic bottles on the beach stairs', lat: 36.76, lng: 3.05, status: 'open', participantCount: 4, startsAt: hoursFromNow(2), isPublic: true, showName: false, spottedBy: null, thumbUrl: BEFORE },
  { id: 'e2', title: 'Bags dumped behind the park fence near the stadium parking, next to the old kiosk', lat: 36.75, lng: 3.06, status: 'in_progress', participantCount: 7, startsAt: hoursFromNow(-0.5), isPublic: true, showName: false, spottedBy: null, thumbUrl: BEFORE },
  { id: 'e3', title: 'Bab El Oued corniche', lat: 36.79, lng: 3.04, status: 'cleaned', participantCount: 12, startsAt: hoursFromNow(-30), isPublic: true, showName: false, spottedBy: null, thumbUrl: AFTER },
];

const ANALYSIS: PhotoAnalysis = {
  isDirty: true,
  dirtLevel: 4,
  items: ['plastic bottles', 'cans', 'bags', 'cardboard'],
  suggestedTitle: 'Plastic bottles on the beach stairs',
  suggestedDescription: 'Lots of bottles and bags piled on the stairs.',
  accepted: true,
  rejectReason: null,
};

const VOUCHERS: Voucher[] = [
  { id: 'v1', itemId: 'bahdja-espresso', partner: 'Café El Bahdja', title: 'Espresso on the house', code: 'NQW-7F3K9Q', cost: 100, status: 'active', createdAt: hoursFromNow(-3), usedAt: null },
  { id: 'v2', itemId: 'zitoun-slice', partner: 'Pizzeria Dar Zitoun', title: 'Slice + soda', code: 'NQW-2M8XQA', cost: 100, status: 'used', createdAt: hoursFromNow(-200), usedAt: hoursFromNow(-150) },
];

const HISTORY: HistoryEntry[] = [
  { id: 'h1', kind: 'cleanup', eventId: 'e3', eventTitle: 'Plastic bottles on the beach stairs', xpDelta: 100, coinsDelta: 100, levelAfter: null, createdAt: hoursFromNow(-0.2), voucherTitle: null },
  { id: 'h2', kind: 'level_up', eventId: null, eventTitle: null, xpDelta: 0, coinsDelta: 100, levelAfter: 1, createdAt: hoursFromNow(-0.2), voucherTitle: null },
  { id: 'h3', kind: 'purchase', eventId: null, eventTitle: null, xpDelta: 0, coinsDelta: -100, levelAfter: null, createdAt: hoursFromNow(-26), voucherTitle: 'Espresso on the house' },
  { id: 'h4', kind: 'cleanup', eventId: 'e9', eventTitle: 'Organized: Sablettes promenade', xpDelta: 150, coinsDelta: 300, levelAfter: null, createdAt: hoursFromNow(-200), voucherTitle: null },
];

const ITEM: ShopItem = SHOP_ITEMS[0];

// ---------- layout helpers ----------
const SECTIONS = [
  'Brand', 'Ranks', 'Markers', 'Economy', 'Buttons', 'Inputs', 'Sheets', 'Headers', 'OTP', 'Photos', 'AI', 'Tickets',
  'Hold', 'Rewards', 'Rank cards', 'Spots', 'Shop', 'Leaderboard', 'History', 'States',
];
const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

function Section({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section id={slug(title)} className="scroll-mt-16 border-t border-line/70 px-4 py-8">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-display text-sm font-bold text-muted tabular-nums">{String(SECTIONS.indexOf(title) + 1).padStart(2, '0')}</span>
        <h2 className="font-display text-[26px] font-bold leading-none">{title}</h2>
      </div>
      {note && <p className="-mt-3 mb-5 text-sm text-muted">{note}</p>}
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Demo({ label, children, className = '', dark }: { label: string; children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</div>
      <div className={`rounded-card p-4 ${dark ? 'bg-[linear-gradient(160deg,#0B3D2E,#04140D)] text-white' : 'bg-surface shadow-card'} ${className}`}>
        {children}
      </div>
    </div>
  );
}

function MapBg({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-card bg-[#EEF2EE] ring-1 ring-line ${className}`}>
      <div className="absolute -bottom-24 -left-16 h-60 w-72 rounded-full bg-[#D5E6F0]" />
      <div className="absolute right-6 top-6 h-16 w-28 rounded-[30px] bg-[#DCEAD9]" />
      <div className="absolute inset-x-0 top-28 h-2 -rotate-6 bg-white" />
      <div className="absolute -top-4 left-40 h-[420px] w-1.5 rotate-[18deg] bg-white" />
      {children}
    </div>
  );
}

// ---------- screen ----------
export function KitScreen() {
  const [filters, setFilters] = useState({ showOpen: true, showCleaned: true });
  const [selected, setSelected] = useState<string | null>('e1');
  const [coins, setCoins] = useState(240);
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiState, setAiState] = useState<'analyzing' | 'done' | 'error'>('analyzing');
  const [clean, setClean] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [checkedKey, setCheckedKey] = useState(0);
  const [holdLoading, setHoldLoading] = useState(false);
  const [levelUp, setLevelUp] = useState<RankLevel | null>(null);
  const [rewardOverlay, setRewardOverlay] = useState(false);
  const [preset, setPreset] = useState('In 1 hour');
  const [title, setTitle] = useState('Plastic bottles on the beach stairs');
  const [desc, setDesc] = useState('');
  const [step, setStep] = useState(1);
  const [tabBar, setTabBar] = useState(true);
  const [buying, setBuying] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const onPhoto = (blob: Blob) => {
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(blob));
    setUploading(true);
    setProgress(0);
    setAiState('analyzing');
    [0.3, 0.65, 0.9, 1].forEach((p, i) => later(() => setProgress(p), 250 * (i + 1)));
    later(() => setUploading(false), 1200);
    later(() => setAiState('done'), 2600);
  };

  return (
    <div className="min-h-dvh bg-paper" style={{ paddingBottom: tabBar ? TAB_BAR_SPACE : 32 }}>
      <ScreenHeader title="Naqiwha UI kit" back="/" right={<CoinPill coins={coins} size="sm" />} />
      <nav className="sticky top-14 z-20 -mt-px flex gap-1.5 overflow-x-auto border-b border-line/60 bg-paper/90 px-3 py-2 backdrop-blur-md [scrollbar-width:none]">
        {SECTIONS.map(s => (
          <a key={s} href={`#${slug(s)}`} className="shrink-0 rounded-pill bg-surface px-3 py-1.5 text-xs font-semibold text-muted shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink">
            {s}
          </a>
        ))}
      </nav>

      <div className="px-4 pb-2 pt-6">
        <p className="text-sm text-muted">
          Every design-system component with mock data. Photos come from <code className="text-xs">/api/dev/sample/*</code>.
        </p>
      </div>

      {/* 01 Brand */}
      <Section title="Brand">
        <Demo label="Logo · light" className="flex flex-col items-start gap-5">
          <Logo size={56} />
          <Logo size={36} />
          <div className="flex items-end gap-4">
            <Logo size={64} wordmark={false} />
            <Logo size={40} wordmark={false} />
            <Logo size={24} wordmark={false} />
            <Logo size={16} wordmark={false} />
          </div>
        </Demo>
        <Demo label="Logo · dark" dark className="flex flex-col items-start gap-5">
          <Logo size={56} variant="dark" />
          <Logo size={32} variant="dark" />
        </Demo>
        <Demo label="Brand icons" className="flex items-center justify-around">
          <CoinIcon size={44} />
          <XpIcon size={44} />
          <SproutIcon size={44} />
          <CoinIcon size={20} />
          <XpIcon size={20} />
          <SproutIcon size={20} />
        </Demo>
      </Section>

      {/* 02 Ranks */}
      <Section title="Ranks" note="Insignia at 64/28/20; frames in a 160% box at 28/40/64/112. Diamond frame animates (static under reduced motion).">
        <Demo label="RankBadge" className="grid grid-cols-5 gap-2">
          {LEVELS.map(l => (
            <div key={l} className="flex flex-col items-center gap-2">
              <RankBadge level={l} size={60} />
              <div className="flex items-center gap-1.5">
                <RankBadge level={l} size={28} />
                <RankBadge level={l} size={20} />
              </div>
              <span className="text-center text-[10px] font-semibold leading-tight text-muted">{RANKS[l].name}</span>
            </div>
          ))}
        </Demo>
        {LEVELS.map(l => {
          const u = byLevel(l);
          return (
            <Demo key={l} label={`Avatar · ${l} ${RANKS[l].name}`} dark={l === 4} className="flex items-center justify-between gap-2 overflow-hidden px-6 py-10">
              <Avatar initials={u.initials} level={l} seed={u.id} size={28} />
              <Avatar initials={u.initials} level={l} seed={u.id} size={40} />
              <Avatar initials={u.initials} level={l} seed={u.id} size={64} />
              <Avatar initials={u.initials} level={l} seed={u.id} size={112} />
            </Demo>
          );
        })}
        <Demo label="Crown (leaderboard #1) · plain disc" className="flex items-center justify-around py-10">
          <Avatar initials="YM" level={4} seed="u-yacine" size={64} crown />
          <Avatar initials="AS" level={3} seed="u-amina" size={64} crown />
          <Avatar initials="RB" level={0} seed="u-rayan" size={64} frame={false} />
        </Demo>
        <Demo label="UserName · light" className="flex flex-col gap-2.5 text-[17px]">
          {LEVELS.map(l => (
            <UserName key={l} name={byLevel(l).displayName} level={l} />
          ))}
          <div className="w-40 rounded-md bg-paper p-2 text-[15px]">
            <UserName name="Sofia Benali-Hadj-Mohamed" level={4} />
          </div>
        </Demo>
        <Demo label="UserName · dark" dark className="flex flex-col gap-2.5 text-[17px]">
          {LEVELS.map(l => (
            <UserName key={l} name={byLevel(l).displayName} level={l} tone="dark" />
          ))}
        </Demo>
      </Section>

      {/* 03 Markers */}
      <Section title="Markers">
        <Demo label="Needs cleaning · cleaning now · cleaned · selected" className="flex items-center justify-between px-6 py-8">
          <SpotMarker status="open" />
          <SpotMarker status="in_progress" />
          <SpotMarker status="cleaned" />
          <SpotMarker status="open" selected />
          <SpotMarker status="cleaned" selected />
        </Demo>
        <Demo label="You are here · CenterPin (tip = cross)" className="flex items-center justify-around py-8">
          <UserDot />
          <div className="relative size-24 rounded-md bg-paper">
            <span className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 bg-danger" />
            <span className="absolute left-1/2 top-1/2 h-6 w-px -translate-y-1/2 bg-danger" />
            <CenterPin />
          </div>
          <div className="relative size-24 rounded-md bg-paper">
            <CenterPin lifted />
          </div>
        </Demo>
        <MapBg className="h-[380px]">
          <FilterChips className="absolute left-3 top-3" {...filters} onChange={setFilters} />
          {filters.showOpen && (
            <>
              <button className="absolute left-[52%] top-[26%] -translate-1/2" onClick={() => setSelected('e1')}>
                <SpotMarker status="open" selected={selected === 'e1'} />
              </button>
              <button className="absolute left-[22%] top-[52%] -translate-1/2" onClick={() => setSelected('e4')}>
                <SpotMarker status="open" selected={selected === 'e4'} />
              </button>
              <button className="absolute left-[78%] top-[20%] -translate-1/2" onClick={() => setSelected('e2')}>
                <SpotMarker status="in_progress" selected={selected === 'e2'} />
              </button>
            </>
          )}
          {filters.showCleaned &&
            [['70%', '58%'], ['88%', '42%'], ['40%', '70%']].map(([l, t]) => (
              <span key={l} className="absolute -translate-1/2" style={{ left: l, top: t }}>
                <SpotMarker status="cleaned" />
              </span>
            ))}
          <span className="absolute left-[50%] top-[62%] -translate-1/2">
            <UserDot />
          </span>
          <IconButton label="Locate me" className="absolute bottom-3 right-3">
            <MapIcon size={20} />
          </IconButton>
        </MapBg>
      </Section>

      {/* 04 Economy */}
      <Section title="Economy">
        <Demo label="StatusChip · md / sm" className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {(['open', 'in_progress', 'cleaned'] as EventStatus[]).map(s => (
              <StatusChip key={s} status={s} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(['open', 'in_progress', 'cleaned'] as EventStatus[]).map(s => (
              <StatusChip key={s} status={s} size="sm" />
            ))}
          </div>
        </Demo>
        <Demo label="CoinPill (tap +100 to count up)" className="flex flex-wrap items-center gap-3">
          <CoinPill coins={coins} />
          <CoinPill coins={coins} size="sm" />
          <Button size="sm" variant="gold" icon={<Plus size={16} />} onClick={() => setCoins(c => c + 100)}>
            100
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setCoins(c => Math.max(0, c - 100))}>
            −100
          </Button>
          <span className="font-display text-2xl font-bold tabular-nums">
            <CountUp value={coins * 10} />
          </span>
        </Demo>
        <Demo label="XpBar · 0 / 240 / 1 560 / 3 240 (max) · compact" className="flex flex-col gap-6">
          <XpBar xp={0} />
          <XpBar xp={240} />
          <XpBar xp={1560} />
          <XpBar xp={3240} />
          <XpBar xp={240} compact />
          <XpBar xp={3240} compact />
        </Demo>
      </Section>

      {/* 05 Buttons */}
      <Section title="Buttons">
        <Demo label="Variants · md" className="flex flex-wrap gap-2">
          <Button>Join the cleanup</Button>
          <Button variant="secondary">Leave</Button>
          <Button variant="ghost">Change</Button>
          <Button variant="danger" icon={<Trash2 size={18} />}>Delete</Button>
          <Button variant="gold" icon={<Gift size={18} />}>Spend your coins</Button>
          <Button variant="dark">Enter code</Button>
          <div className="rounded-pill bg-deep p-1.5">
            <Button variant="light">Yallah!</Button>
          </div>
        </Demo>
        <Demo label="Sizes · loading · disabled · full" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button loading>Publishing</Button>
            <Button variant="secondary" loading>Saving</Button>
            <Button disabled>Disabled</Button>
          </div>
          <Button size="lg" full icon={<QrCode size={22} />}>Show my QR</Button>
          <ButtonLink to="/kit" size="lg" full variant="secondary" icon={<Wallet size={20} />}>
            ButtonLink → Wallet
          </ButtonLink>
        </Demo>
        <div className="relative overflow-hidden rounded-card">
          <img src={BEFORE} alt="" className="h-40 w-full bg-deep object-cover" />
          <div className="absolute inset-0 flex items-center justify-around">
            <IconButton label="Share" variant="blur"><Share2 size={20} /></IconButton>
            <IconButton label="Camera" variant="surface"><Camera size={20} /></IconButton>
            <IconButton label="Notifications" variant="dark"><Bell size={20} /></IconButton>
            <IconButton label="Map" variant="ghost" className="bg-white/70"><MapIcon size={20} /></IconButton>
          </div>
        </div>
      </Section>

      {/* 06 Inputs */}
      <Section title="Inputs">
        <Demo label="Chip (meeting time)" className="flex flex-wrap gap-2">
          {['Now', 'In 1 hour', 'Tomorrow 10:00', 'Saturday 10:00'].map(p => (
            <Chip key={p} selected={preset === p} onClick={() => setPreset(p)}>
              {p}
            </Chip>
          ))}
        </Demo>
        <Demo label="Field" className="flex flex-col gap-4">
          <Field label="Title" value={title} maxLength={60} onChange={e => setTitle(e.target.value)} />
          <Field
            label="Description"
            multiline
            value={desc}
            maxLength={400}
            placeholder="What's there? Where exactly?"
            onChange={e => setDesc(e.target.value)}
            hint="Help people find it."
          />
          <Field label="Email" type="email" defaultValue="yacine@" error="Enter a valid email address." />
          <Field label="Landmark (optional)" placeholder="e.g. behind the stadium parking" />
        </Demo>
        <Demo label="Steps" className="flex flex-col gap-3">
          <Steps current={step} labels={['Photo', 'Details', 'Location']} />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setStep(s => Math.max(0, s - 1))}>Back</Button>
            <Button size="sm" onClick={() => setStep(s => Math.min(2, s + 1))}>Next</Button>
          </div>
        </Demo>
        <div className="flex flex-col gap-2">
          <Notice tone="success" icon={<SproutIcon size={20} />} title="You're checked in ✓">
            Rewards land when the spot is verified.
          </Notice>
          <Notice tone="cleaned" title="Cleaned on 12 Oct · 7 heroes rewarded">
            The stairs are spotless now — great teamwork.
          </Notice>
          <Notice tone="info">Test account — use code 424242</Notice>
          <Notice tone="danger">Wrong code. 2 tries left.</Notice>
        </div>
      </Section>

      {/* 07 Sheets */}
      <Section title="Sheets">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setSheet(true)}>Open sheet</Button>
          <Button variant="gold" onClick={() => setConfirm(true)}>Confirm sheet</Button>
          <Button variant="secondary" onClick={() => setTabBar(t => !t)}>{tabBar ? 'Hide' : 'Show'} tab bar</Button>
        </div>
        <Sheet open={sheet} onClose={() => setSheet(false)} title="7 heroes joined">
          <div className="flex flex-col gap-1">
            {USERS.slice(0, 7).map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 py-2">
                <Avatar initials={u.initials} level={u.level} seed={u.id} size={36} className="mx-2" />
                <UserName name={u.displayName} level={u.level} className="flex-1" />
                <span className="text-xs font-semibold text-muted">{i === 0 ? 'Organizer' : i < 4 ? 'Checked in ✓' : 'Joined'}</span>
              </div>
            ))}
          </div>
        </Sheet>
        <ConfirmSheet
          open={confirm}
          title="Spend 100 coins on Espresso on the house?"
          body="You'll get a voucher to show at the Café El Bahdja counter."
          confirmLabel="Confirm"
          tone="gold"
          loading={confirmLoading}
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            setConfirmLoading(true);
            later(() => {
              setConfirmLoading(false);
              setConfirm(false);
              toast.success('Voucher added to your wallet 🎁');
            }, 1200);
          }}
        />
      </Section>

      {/* 08 Headers */}
      <Section title="Headers">
        <div className="overflow-hidden rounded-card bg-paper ring-1 ring-line">
          <ScreenHeader title="Spot details with a very long title that truncates" back="/kit" right={<Avatar initials="LK" level={1} seed="u-lina" size={30} />} />
          <div className="h-10" />
        </div>
        <div className="relative h-48 overflow-hidden rounded-card">
          <img src={BEFORE} alt="" className="absolute inset-0 size-full bg-deep object-cover" />
          <ScreenHeader transparent back="/kit" right={<IconButton label="Share" variant="blur"><Share2 size={20} /></IconButton>} />
          <StatusChip status="in_progress" className="absolute bottom-3 left-3 shadow-float" />
        </div>
      </Section>

      {/* 09 OTP */}
      <Section title="OTP" note="Type or paste 424242 → success; anything else shakes.">
        <Demo label="OtpInput" className="py-6">
          <OtpInput
            value={otp}
            error={otpError}
            onChange={v => {
              setOtp(v);
              if (otpError) setOtpError(null);
            }}
            onComplete={v => {
              if (v === '424242') toast.success('Welcome back!');
              else setOtpError('Wrong code. 2 tries left.');
            }}
            autoFocus={false}
          />
        </Demo>
      </Section>

      {/* 10 Photos */}
      <Section title="Photos">
        {photo ? (
          <PhotoPreview src={photo} alt="Before photo" uploading={uploading} progress={progress} uploaded={!uploading} onRetake={() => setPhoto(null)} />
        ) : (
          <PhotoCapture
            title="Take a photo of the mess"
            onPhoto={onPhoto}
            samples={[
              { label: 'Sample: dirty', name: 'before1' },
              { label: 'Sample: clean', name: 'after1' },
            ]}
          />
        )}
        <Demo label="PhotoCapture · busy" className="p-0! shadow-none!">
          <PhotoCapture onPhoto={() => {}} busy />
        </Demo>
        <Demo label="BeforeAfter (drag or ← →)" className="p-0! shadow-none!">
          <BeforeAfter beforeUrl={BEFORE} afterUrl={AFTER} alt="Plastic bottles on the beach stairs" />
        </Demo>
      </Section>

      {/* 11 AI */}
      <Section title="AI">
        <div className="flex flex-wrap gap-2">
          {(['analyzing', 'done', 'error'] as const).map(s => (
            <Chip key={s} selected={aiState === s && !clean} onClick={() => { setAiState(s); setClean(false); }}>{s}</Chip>
          ))}
          <Chip selected={clean} onClick={() => { setAiState('done'); setClean(true); }}>refused</Chip>
        </div>
        <AiAnalysisCard state={aiState} analysis={clean ? { ...ANALYSIS, isDirty: false, dirtLevel: 1, items: [], accepted: false, rejectReason: 'This shows a laptop on a desk, not a littered place.' } : ANALYSIS} />
        <Button
          variant="dark"
          onClick={() => {
            setVerifying(true);
            later(() => setVerifying(false), 6000);
          }}
        >
          Play VerifyingAnimation (6 s)
        </Button>
        <VerifyingAnimation beforeUrl={BEFORE} afterUrl={AFTER} fullscreen={false} />
        <AnimatePresence>{verifying && <VerifyingAnimation beforeUrl={BEFORE} afterUrl={AFTER} />}</AnimatePresence>
      </Section>

      {/* 12 Tickets */}
      <Section title="Tickets">
        <Demo label="ParticipantStack" className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <ParticipantStack users={USERS} />
            <span className="text-sm text-muted">8 heroes joined · 3 checked in</span>
          </div>
          <ParticipantStack users={USERS.slice(0, 3)} size={28} />
        </Demo>
        <QrTicket displayName="Amina S." initials="AS" level={3} qrCode="7F3K9Q2M" seed="u-amina" subtitle="Plastic bottles on the beach stairs" />
        <QrTicket displayName="Yacine M." initials="YM" level={4} qrCode="2M8XQA4B" seed="u-yacine" />
        <Demo label="CheckedInSuccess" className="py-8">
          <CheckedInSuccess
            key={checkedKey}
            body="Plastic bottles on the beach stairs"
            action={<Button variant="secondary" onClick={() => setCheckedKey(k => k + 1)}>Replay</Button>}
          />
        </Demo>
        <VoucherTicket voucher={VOUCHERS[0]} />
        <VoucherTicket voucher={VOUCHERS[1]} />
        <div className="flex flex-col gap-2">
          {VOUCHERS.map(v => (
            <VoucherTicket key={v.id} voucher={v} compact />
          ))}
        </div>
      </Section>

      {/* 13 Hold */}
      <Section title="Hold">
        <HoldButton
          label="Hold to mark as used"
          loading={holdLoading}
          onComplete={() => {
            setHoldLoading(true);
            later(() => {
              setHoldLoading(false);
              toast.success('Voucher marked as used');
            }, 1000);
          }}
        />
        <HoldButton label="Disabled" disabled onComplete={() => {}} />
      </Section>

      {/* 14 Rewards */}
      <Section title="Rewards">
        <div className="grid grid-cols-5 gap-2">
          {LEVELS.slice(1).map(l => (
            <Button key={l} size="sm" variant={l === 4 ? 'gold' : 'secondary'} onClick={() => setLevelUp(l)}>
              L{l}
            </Button>
          ))}
          <Button size="sm" onClick={() => leafConfetti()}>🍃</Button>
        </div>
        <Button variant="dark" onClick={() => setRewardOverlay(true)}>Cleanup reward in overlay</Button>
        <div className="flex justify-center">
          <CleanupRewardCard title="Plastic bottles on the beach stairs" xp={150} coins={300} onNext={() => toast('Next!')} />
        </div>
        <AnimatePresence>
          {levelUp != null && (
            <LevelUpReveal
              key="lvl"
              level={levelUp}
              gift={RANKS[levelUp].levelUpGift}
              onDone={() => setLevelUp(null)}
              ctaExtra={
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10" onClick={() => setLevelUp(null)}>
                  Spend your coins 🎁
                </Button>
              }
            />
          )}
          {rewardOverlay && (
            <CelebrationOverlay key="rw" onClose={() => setRewardOverlay(false)}>
              <CleanupRewardCard title={null} xp={100} coins={100} onNext={() => setRewardOverlay(false)} />
            </CelebrationOverlay>
          )}
        </AnimatePresence>
      </Section>

      {/* 15 Rank cards */}
      <Section title="Rank cards" note="Viewer at 240 XP (Silver), then a Diamond viewer, then logged out.">
        {LEVELS.map(l => (
          <RankCard key={l} level={l} xp={240} />
        ))}
        <RankCard level={4} xp={3240} />
        <RankCard level={2} xp={null} />
      </Section>

      {/* 16 Spots */}
      <Section title="Spots">
        {PINS.map(p => (
          <SpotCard key={p.id} pin={p} to="/kit" />
        ))}
        <MapBg className="flex h-72 items-end p-3">
          <AnimatePresence mode="wait">
            {selected && (
              <SpotPreviewCard
                key={selected}
                className="w-full"
                pin={PINS.find(p => p.id === selected) ?? PINS[1]}
                distanceKm={0.65}
                onDetails={() => toast('Open details')}
                directionsHref={directionsUrl(PINS[0])}
                onClose={() => setSelected(null)}
              />
            )}
          </AnimatePresence>
          {!selected && (
            <Button className="mx-auto" onClick={() => setSelected('e2')}>Select a pin</Button>
          )}
        </MapBg>
      </Section>

      {/* 17 Shop */}
      <Section title="Shop">
        <ShopItemCard
          item={ITEM}
          coins={240}
          loading={buying}
          onGet={() => {
            setBuying(true);
            later(() => setBuying(false), 1200);
          }}
        />
        <ShopItemCard item={ITEM} coins={40} onGet={() => {}} />
      </Section>

      {/* 18 Leaderboard */}
      <Section title="Leaderboard">
        <Podium top3={BOARD.slice(0, 3)} />
        <div className="flex flex-col gap-1.5">
          {BOARD.slice(3).map(e => (
            <LeaderRow key={e.user.id} entry={e} highlight={e.user.id === 'u-lina'} />
          ))}
        </div>
        <div className="flex flex-col rounded-card bg-surface">
          <LeaderRowSkeleton />
          <LeaderRowSkeleton />
        </div>
      </Section>

      {/* 19 History */}
      <Section title="History">
        <div className="divide-y divide-line-soft rounded-card bg-surface px-4 shadow-card">
          {HISTORY.map(h => (
            <HistoryRow key={h.id} entry={h} />
          ))}
        </div>
      </Section>

      {/* 20 States */}
      <Section title="States">
        <Demo label="Skeleton" className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton shape="circle" width={48} />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton shape="line" width="70%" />
              <Skeleton shape="line" width="45%" />
            </div>
          </div>
          <Skeleton className="aspect-[4/3] w-full" />
        </Demo>
        <SpotCardSkeleton />
        <SpotCardSkeleton />
        <Demo label="EmptyState">
          <EmptyState
            title="No spots here yet"
            body="See a mess? Be the first to spot it."
            action={<Button icon={<Plus size={20} />}>Spot a mess</Button>}
          />
        </Demo>
        <Demo label="EmptyState · wallet">
          <EmptyState icon={<Wallet size={34} />} title="No vouchers yet" body="Cleanups earn coins, coins get rewards." />
        </Demo>
      </Section>

      {tabBar && <TabBar />}
    </div>
  );
}
