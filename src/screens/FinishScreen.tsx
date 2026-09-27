import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Camera, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  BeforeAfter, Button, Chip, IconButton, LevelUpReveal, Notice, PhotoCapture,
  PhotoPreview, VerifyingAnimation, leafConfetti, ParticipantStack,
} from '../components';
import { ApiError, errorMessage } from '../lib/api';
import { plural } from '../lib/format';
import { useGoBack } from '../lib/history';
import { useComplete, useConfig, useEvent } from '../lib/queries';
import type { CompleteResult, RewardEntry } from '../shared/types';
import { BottomBar } from './parts/BottomBar';
import { usePhotoUpload } from './parts/usePhotoUpload';

const AFTER_SAMPLES = [
  { label: 'Sample: clean', name: 'after1' },
  { label: 'Sample: still dirty', name: 'before1' },
];

type Phase = 'capture' | 'compare' | 'verifying' | 'verified' | 'failed' | 'busy' | 'exhausted';

export function FinishScreen() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const config = useConfig().data!;
  const event = useEvent(id, 4000);
  const complete = useComplete(id);
  const { photo, preparing, take, reset } = usePhotoUpload();

  const [phase, setPhase] = useState<Phase>('capture');
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [levelIdx, setLevelIdx] = useState(0);

  const spot = event.data;

  useEffect(() => {
    if (spot?.status === 'cleaned') setPhase('verified');
  }, [spot?.status]);

  const levelUps = useMemo(
    () => (result?.myRewards ?? []).filter(r => r.kind === 'level_up'),
    [result?.myRewards],
  );
  const cleanupReward = useMemo(
    () => (result?.myRewards ?? []).find(r => r.kind === 'cleanup'),
    [result?.myRewards],
  );

  if (event.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted" aria-busy>
        Loading…
      </div>
    );
  }

  if (event.isError || !spot) {
    return <Navigate to={`/spots/${id}`} replace />;
  }

  if (!spot.viewer?.isOrganizer) {
    return <Navigate to={`/spots/${id}`} replace />;
  }

  if (spot.verifyAttemptsLeft === 0 && phase === 'capture' && spot.status !== 'cleaned') {
    return <Exhausted onBack={() => goBack(`/spots/${id}`)} />;
  }

  const rewardCount = spot.checkedInCount;
  const solo = rewardCount <= 1;

  const onPhoto = async (file: Blob) => {
    const imageId = await take(file);
    if (imageId) setPhase('compare');
  };

  const retake = () => {
    reset();
    setResult(null);
    setPhase('capture');
  };

  const verify = async () => {
    if (!photo?.imageId) return;
    setPhase('verifying');
    const minWait = new Promise(r => setTimeout(r, 1500));
    try {
      const [res] = await Promise.all([complete.mutateAsync(photo.imageId), minWait]);
      setResult(res);
      if (res.verified) {
        leafConfetti({ y: 0.28 });
        setLevelIdx(0);
        setPhase('verified');
        toast.success('Saha! Spot cleaned.');
      } else {
        setPhase('failed');
      }
    } catch (err) {
      await minWait;
      if (err instanceof ApiError && err.status === 503) {
        setPhase('busy');
      } else if (err instanceof ApiError && err.code === 'too_many_attempts') {
        setPhase('exhausted');
      } else {
        toast.error(errorMessage(err));
        setPhase('compare');
      }
    }
  };

  const showLevelUp = phase === 'verified' && levelUps[levelIdx];
  const showSuccess = phase === 'verified' && !showLevelUp;

  return (
    <div className="flex min-h-dvh flex-col">
      <header
        className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 px-3 backdrop-blur-md"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex h-14 items-center gap-2">
          <IconButton label="Back to spot" variant="ghost" onClick={() => goBack(`/spots/${id}`)}>
            <ArrowLeft size={22} />
          </IconButton>
          <h1 className="font-display text-xl font-bold">Finish cleanup</h1>
        </div>
      </header>

      <AnimatePresence>
        {phase === 'verifying' && photo && spot && (
          <VerifyingAnimation key="verify" beforeUrl={spot.beforeImageUrl} afterUrl={photo.url} />
        )}
      </AnimatePresence>

      {showLevelUp && (
        <LevelUpReveal
          level={levelUps[levelIdx].levelAfter!}
          gift={levelUps[levelIdx].coinsDelta}
          onDone={() => {
            if (levelIdx + 1 < levelUps.length) setLevelIdx(i => i + 1);
            else setLevelIdx(levelUps.length);
          }}
        />
      )}

      {phase === 'capture' && (
        <section className="flex flex-col gap-4 px-4 pt-5">
          <div>
            <h2 className="font-display text-display">Time for the AFTER photo</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
              {solo
                ? 'Solo cleanup — you still earn XP.'
                : `${plural(rewardCount, 'hero', 'heroes')} will be rewarded`}
            </p>
          </div>
          <PhotoCapture
            onPhoto={onPhoto}
            title="Show the cleaned spot"
            hint="Same angle as the before photo works best."
            samples={config.devTools ? AFTER_SAMPLES : undefined}
            busy={preparing}
          />
        </section>
      )}

      {phase === 'compare' && photo && spot && (
        <section className="flex flex-col gap-4 px-4 pt-5">
          <PhotoPreview
            src={photo.url}
            alt="After photo of the cleaned spot"
            onRetake={retake}
            uploading={photo.uploading}
            uploaded={!!photo.imageId}
          />
          <BeforeAfter beforeUrl={spot.beforeImageUrl} afterUrl={photo.url} alt={spot.title} />
        </section>
      )}

      {phase === 'busy' && (
        <section className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <Camera size={40} className="text-brand" />
          <h2 className="font-display text-2xl font-bold">The AI referee is busy</h2>
          <p className="max-w-xs text-muted">Your photo is saved — try again in a moment. This attempt won't count.</p>
          <Button size="lg" icon={<RefreshCw size={20} />} onClick={() => setPhase('compare')}>
            Try again
          </Button>
        </section>
      )}

      {phase === 'failed' && result && result.event.verifyAttemptsLeft === 0 && (
        <Exhausted onBack={() => goBack(`/spots/${id}`)} />
      )}

      {phase === 'failed' && result && result.event.verifyAttemptsLeft > 0 && (
        <section className="flex flex-col gap-4 px-4 pt-5">
          <div className="text-center">
            <h2 className="font-display text-display">Not quite yet</h2>
            <p className="mt-2 text-muted">{result.ai.summary}</p>
          </div>
          {result.ai.remainingIssues.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-2">
              {result.ai.remainingIssues.map(issue => (
                <Chip key={issue}>{issue}</Chip>
              ))}
            </ul>
          )}
          <Notice tone="info">
            {plural(result.event.verifyAttemptsLeft, 'attempt')} left — fix what's listed and retake the after photo.
          </Notice>
        </section>
      )}

      {phase === 'exhausted' && <Exhausted onBack={() => goBack(`/spots/${id}`)} />}

      {showSuccess && result && (
        <VerifiedView spot={result.event} result={result} cleanup={cleanupReward} onMap={() => navigate('/', { replace: true })} />
      )}

      {spot.status === 'cleaned' && !result && phase === 'verified' && (
        <VerifiedView spot={spot} result={null} cleanup={null} onMap={() => navigate('/', { replace: true })} />
      )}

      <BottomBar>
        {phase === 'compare' && (
          <Button size="lg" full disabled={!photo?.imageId || photo.uploading} loading={complete.isPending} onClick={verify}>
            Verify with AI
          </Button>
        )}
        {phase === 'failed' && result && result.event.verifyAttemptsLeft > 0 && (
          <Button size="lg" full onClick={retake}>
            Retake the after photo
          </Button>
        )}
      </BottomBar>
    </div>
  );
}

function VerifiedView({
  spot,
  result,
  cleanup,
  onMap,
}: {
  spot: CompleteResult['event'];
  result: CompleteResult | null;
  cleanup: RewardEntry | null | undefined;
  onMap: () => void;
}) {
  const ai = result?.ai ?? spot.ai;
  const rewarded = result?.rewardedCount ?? spot.participantCount;
  const rewardedUsers = spot.participants.filter(p => p.checkedIn).map(p => p.user);

  return (
    <section className="flex flex-col gap-5 px-4 pt-6 pb-4">
      <div className="text-center">
        <h2 className="font-display text-display">Saha! Spot cleaned.</h2>
        {ai?.summary && <p className="mt-2 text-[15px] leading-relaxed text-muted">{ai.summary}</p>}
        {ai?.failOpen && (
          <p className="mt-2 text-sm text-muted">Verified without AI (referee unavailable)</p>
        )}
      </div>

      {cleanup && (cleanup.xpDelta > 0 || cleanup.coinsDelta > 0) && (
        <div className="rounded-card bg-surface p-4 text-center shadow-card">
          <p className="text-sm font-semibold text-muted">Your rewards</p>
          <p className="mt-1 font-display text-2xl font-bold text-brand">
            +{cleanup.xpDelta} XP · +{cleanup.coinsDelta} coins
          </p>
        </div>
      )}

      <div className="flex flex-col items-center gap-2 rounded-card bg-spot-cleaned-soft px-4 py-5 text-center">
        <ParticipantStack users={rewardedUsers.length ? rewardedUsers : spot.participants.map(p => p.user)} size={40} />
        <p className="font-semibold text-spot-cleaned-ink">{plural(rewarded, 'hero', 'heroes')} rewarded</p>
      </div>

      {spot.afterImageUrl && spot.beforeImageUrl && (
        <BeforeAfter beforeUrl={spot.beforeImageUrl} afterUrl={spot.afterImageUrl} alt={spot.title} />
      )}

      <Button size="lg" full onClick={onMap}>
        Back to the map
      </Button>
    </section>
  );
}

function Exhausted({ onBack }: { onBack: () => void }) {
  return (
    <section className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <h2 className="font-display text-2xl font-bold">No attempts left</h2>
      <p className="max-w-xs text-muted">
        The AI couldn't verify this cleanup after several tries. Head back and contact support if you think this is wrong.
      </p>
      <Button size="lg" onClick={onBack}>
        Back to the spot
      </Button>
    </section>
  );
}
