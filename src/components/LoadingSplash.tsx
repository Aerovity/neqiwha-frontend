import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/** Leaf mark from the brand art (viewBox 14.5 13.5 29 23). */
const LEAF =
  'M38.0715 27.7036C36.9475 28.3868 35.6567 28.7461 34.3414 28.7419C33.2395 28.7331 32.1501 28.5078 31.1351 28.0786C30.3529 29.1829 29.9343 30.5035 29.9375 31.8567V35.3126C29.9378 35.4411 29.9116 35.5683 29.8607 35.6863C29.8097 35.8043 29.7351 35.9105 29.6413 35.9984C29.5476 36.0864 29.4368 36.1541 29.3157 36.1974C29.1947 36.2406 29.0661 36.2586 28.9379 36.2501C28.6969 36.2291 28.4728 36.1178 28.3104 35.9385C28.1481 35.7592 28.0595 35.5251 28.0625 35.2833V33.8255L23.5367 29.2997C22.8639 29.5507 22.1524 29.682 21.4344 29.6876C20.4458 29.69 19.4758 29.4195 18.6312 28.9059C16.0777 27.3544 14.7031 23.7837 14.9691 19.3505C14.9825 19.1211 15.0797 18.9047 15.2421 18.7422C15.4046 18.5798 15.621 18.4826 15.8504 18.4692C20.2836 18.2079 23.8543 19.5778 25.4012 22.1313C26.0089 23.1322 26.2742 24.3038 26.157 25.4688C26.1497 25.5591 26.1164 25.6453 26.0612 25.7171C26.006 25.7888 25.9311 25.843 25.8457 25.8732C25.7603 25.9033 25.668 25.908 25.5799 25.8868C25.4919 25.8656 25.4119 25.8193 25.3496 25.7536L23.0996 23.3981C22.9223 23.2297 22.6863 23.1372 22.4419 23.1404C22.1974 23.1435 21.9638 23.242 21.791 23.4149C21.6181 23.5878 21.5196 23.8213 21.5164 24.0658C21.5133 24.3102 21.6058 24.5463 21.7742 24.7235L28.0883 31.1981C28.0953 31.1067 28.1035 31.0153 28.1129 30.9251C28.3179 29.1869 29.0849 27.5632 30.2972 26.3009L36.2258 20.036C36.4017 19.8603 36.5006 19.6218 36.5007 19.3731C36.5008 19.1245 36.4021 18.8859 36.2263 18.71C36.0506 18.5341 35.8122 18.4352 35.5635 18.4351C35.3148 18.435 35.0763 18.5337 34.9004 18.7094L29.1582 24.7821C29.1007 24.843 29.028 24.8874 28.9475 24.9106C28.8671 24.9339 28.7819 24.9352 28.7008 24.9143C28.6197 24.8935 28.5457 24.8514 28.4864 24.7923C28.4271 24.7332 28.3847 24.6592 28.3637 24.5782C27.8082 22.5298 28.0531 20.4907 29.1137 18.7399C31.2066 15.2852 36.0769 13.436 42.1426 13.7923C42.3719 13.8057 42.5884 13.9028 42.7508 14.0653C42.9133 14.2277 43.0104 14.4442 43.0238 14.6735C43.3754 20.7403 41.5262 25.6106 38.0715 27.7036Z';

/** Draw the outline, then bloom the fill: the splash may leave only after this. */
const INTRO_MS = 1700;
const EXIT_MS = 550;
const ease = [0.65, 0, 0.35, 1] as const;

/**
 * Boot animation, shown on every page load: the leaf outline draws itself, the fill blooms with a glow pulse
 * while the background drifts, then everything swells and fades once the app is `ready` (never before the
 * intro finishes). Reduced motion: a static leaf that simply fades out.
 */
export function LoadingSplash({ ready }: { ready: boolean }) {
  const reduce = !!useReducedMotion();
  const [introDone, setIntroDone] = useState(reduce);
  const [phase, setPhase] = useState<'playing' | 'leaving' | 'gone'>('playing');

  useEffect(() => {
    if (introDone) return;
    const t = setTimeout(() => setIntroDone(true), INTRO_MS);
    return () => clearTimeout(t);
  }, [introDone]);

  useEffect(() => {
    if (!ready || !introDone || phase !== 'playing') return;
    setPhase('leaving');
    document.getElementById('boot-splash')?.remove();
  }, [ready, introDone, phase]);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const t = setTimeout(() => setPhase('gone'), EXIT_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'gone') return null;
  const leaving = phase === 'leaving';

  return (
    <motion.div
      role="status"
      aria-label="Loading Naqiwha"
      className="fixed inset-0 z-[100] overflow-hidden bg-[#6FD83C]"
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: EXIT_MS / 1000, ease: 'easeOut', delay: leaving ? 0.08 : 0 }}
    >
      {/* Background: portrait art on phones, square art on wide screens, drifting slowly. */}
      <motion.div
        aria-hidden
        className="absolute -inset-[6%] bg-[url(/splash/background.webp)] bg-cover bg-center min-[481px]:bg-[url(/splash/backdrop.webp)]"
        initial={reduce ? false : { scale: 1.12, x: '-1.5%', y: '1.5%' }}
        animate={reduce ? undefined : { scale: 1, x: '1.5%', y: '-1%' }}
        transition={{ duration: 4, ease: 'easeOut' }}
      />
      {/* Light blobs that breathe behind the leaf. */}
      {!reduce && (
        <>
          <motion.span
            aria-hidden
            className="absolute left-[8%] top-[18%] size-[60vmax] rounded-full bg-[#C8FF6A]/35 blur-3xl"
            animate={{ x: ['0%', '8%', '0%'], y: ['0%', '5%', '0%'], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            aria-hidden
            className="absolute -bottom-[20%] -right-[15%] size-[55vmax] rounded-full bg-[#0B7A2A]/30 blur-3xl"
            animate={{ x: ['0%', '-6%', '0%'], y: ['0%', '-4%', '0%'] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2">
        {/* Glow pulse when the leaf fills. */}
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute left-1/2 top-1/2 size-[clamp(72px,19vw,104px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-xl"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.9, 2.3], opacity: [0, 0.55, 0] }}
            transition={{ duration: 1.1, delay: 0.95, ease: 'easeOut' }}
          />
        )}
        <motion.svg
          viewBox="14.5 13.5 29 23"
          aria-hidden
          className="relative block w-[clamp(72px,19vw,104px)] overflow-visible drop-shadow-[0_6px_16px_rgba(0,60,20,0.25)]"
          initial={reduce ? false : { y: 10, scale: 0.92 }}
          animate={
            leaving && !reduce
              ? { y: 0, scale: 1.6, opacity: 0 }
              : { y: 0, scale: reduce ? 1 : [0.92, 0.92, 1.08, 1], opacity: 1 }
          }
          transition={
            leaving
              ? { duration: EXIT_MS / 1000, ease: [0.4, 0, 1, 1] }
              : { y: { duration: 1.2, ease }, scale: { duration: 1.6, times: [0, 0.55, 0.78, 1], ease: 'easeOut' } }
          }
        >
          <motion.path
            d={LEAF}
            fill="white"
            stroke="white"
            strokeWidth={0.55}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0, fillOpacity: 0 }}
            animate={{ pathLength: 1, fillOpacity: 1 }}
            transition={{
              pathLength: { duration: 1.05, ease },
              fillOpacity: { duration: 0.45, delay: 0.9, ease: 'easeOut' },
            }}
          />
        </motion.svg>
      </div>
    </motion.div>
  );
}
