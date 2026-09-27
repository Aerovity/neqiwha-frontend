import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Camera, Users } from 'lucide-react';
import { Button, CoinIcon, SpotMarker, XpIcon } from '../../../components';
import { Sheet } from '../../../components';

const STEPS: { icon: ReactNode; tint: string; title: string; body: string }[] = [
  {
    icon: <Camera size={24} strokeWidth={2.2} />,
    tint: 'bg-brand-soft text-brand',
    title: 'Spot a mess',
    body: 'Snap a photo, AI writes the details, and a green dot lands on the map.',
  },
  {
    icon: <Users size={24} strokeWidth={2.2} />,
    tint: 'bg-spot-cleaned-soft text-spot-cleaned',
    title: 'Clean together',
    body: 'Join a spot, show your QR on site, clean it with your crew.',
  },
  {
    icon: (
      <span className="relative block size-6">
        <XpIcon size={22} className="absolute -left-0.5 -top-0.5" />
        <CoinIcon size={16} className="absolute -bottom-1 -right-1.5" />
      </span>
    ),
    tint: 'bg-coin-soft text-coin-ink',
    title: 'Level up',
    body: 'AI checks the before and after. Earn XP and coins, then spend them at local shops.',
  },
];

/** First-visit "How it works" sheet. */
export function IntroSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex flex-col">
        <div className="relative mb-5 h-32 overflow-hidden rounded-card bg-[linear-gradient(160deg,#0B3D2E,#04140D)]">
          <span aria-hidden className="absolute -right-10 -top-16 size-48 rounded-full bg-[radial-gradient(circle,rgba(155,219,78,0.35),rgba(155,219,78,0)_70%)]" />
          <svg aria-hidden className="absolute inset-0 size-full" viewBox="0 0 400 128" preserveAspectRatio="none">
            <path d="M40 96 C 120 20, 200 120, 280 52 S 380 40, 390 30" fill="none" stroke="rgba(185,212,195,0.35)" strokeWidth="2.5" strokeDasharray="2 9" strokeLinecap="round" />
          </svg>
          {[
            { left: '14%', top: '56%', el: <SpotMarker status="open" participantCount={2} />, d: 0.1 },
            { left: '48%', top: '44%', el: <SpotMarker status="in_progress" participantCount={5} />, d: 0.25 },
            { left: '80%', top: '34%', el: <SpotMarker status="cleaned" />, d: 0.4 },
          ].map(m => (
            <motion.span
              key={m.left}
              className="absolute -translate-1/2"
              style={{ left: m.left, top: m.top }}
              initial={reduce ? false : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: m.d }}
            >
              {m.el}
            </motion.span>
          ))}
        </div>

        <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-brand">How it works</p>
        <h2 className="mt-1 text-center font-display text-[26px] font-bold leading-tight">Clean your city, climb the ranks</h2>

        <ol className="mt-5 flex flex-col gap-3">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              initial={reduce ? false : { x: -12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.3 }}
              className="flex items-start gap-3.5 rounded-md bg-paper p-3.5"
            >
              <span className={`grid size-12 shrink-0 place-items-center rounded-full ${s.tint}`}>{s.icon}</span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-sm font-bold text-muted tabular-nums">{i + 1}</span>
                  <h3 className="font-display text-lg font-bold leading-tight">{s.title}</h3>
                </div>
                <p className="mt-0.5 text-[14px] leading-snug text-muted">{s.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>

        <Button size="lg" full className="mt-6" onClick={onClose} data-autofocus>
          Yallah!
        </Button>
      </div>
    </Sheet>
  );
}
