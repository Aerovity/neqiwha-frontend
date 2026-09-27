import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, CalendarClock, Camera, Clock, MapPin, Send, Share2, Sparkles, UserRound, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  AiAnalysisCard, Button, ButtonLink, Chip, ConfirmSheet, Field, IconButton, PhotoCapture, PhotoPreview, Steps, Switch,
  leafConfetti,
} from '../components';
import { CheckStroke } from '../components/icons';
import { useGoBack } from '../lib/history';
import { useAnalyzePhoto, useConfig, useCreateEvent } from '../lib/queries';
import { ApiError, errorMessage } from '../lib/api';
import { formatMeetTime } from '../lib/format';
import type { LatLng } from '../lib/geo';
import type { EventDetail, PhotoAnalysis } from '../shared/types';
import { BottomBar } from './parts/BottomBar';
import { GpsLocation } from './parts/GpsLocation';
import {
  MAX_AHEAD_MS, PRESETS, fromLocalInput, meetTimeError, nextFullHour, toLocalInput, type PresetKey,
} from './parts/meetTime';
import { shareSpot } from './parts/share';
import { usePhotoUpload } from './parts/usePhotoUpload';

const STEP_LABELS = ['Photo', 'Details', 'Location'];

const BEFORE_SAMPLES = [
  { label: 'Sample: messy fence', name: 'before1' },
  { label: 'Sample: beach', name: 'before2' },
  { label: 'Sample: park', name: 'before3' },
];

type AiState = 'idle' | 'analyzing' | 'done' | 'error';

const titleError = (v: string) => {
  const n = v.trim().length;
  return n < 3 ? 'Give it a title (at least 3 characters).' : n > 60 ? 'Keep the title under 60 characters.' : null;
};
const descError = (v: string) => {
  const n = v.trim().length;
  return n < 3 ? 'Describe the mess (at least 3 characters).' : n > 400 ? 'Keep it under 400 characters.' : null;
};

export function CreateSpotScreen() {
  const goBack = useGoBack();
  const config = useConfig().data!;
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [created, setCreated] = useState<EventDetail | null>(null);

  // Step 1: photo + AI
  const { photo, preparing, take, reset } = usePhotoUpload();
  const analyze = useAnalyzePhoto();
  const [aiState, setAiState] = useState<AiState>('idle');
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const currentImage = useRef<string | null>(null);

  // Step 2: details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const aiFill = useRef({ title: '', description: '' });
  // Off by default: most spots are quick solo cleanups; a public meetup is opt-in.
  const [isPublic, setIsPublic] = useState(false);
  // Solo spots are anonymous unless the user opts in.
  const [showName, setShowName] = useState(false);
  const [meetAt, setMeetAt] = useState(() => toLocalInput(nextFullHour()));
  const [preset, setPreset] = useState<PresetKey | null>(null);
  const [landmark, setLandmark] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  // Step 3: location
  const [pos, setPos] = useState<LatLng | null>(null);
  const create = useCreateEvent();

  const hasPhoto = !!photo || preparing;
  const photoAccepted = !!photo?.imageId && aiState === 'done' && !!analysis?.accepted;

  useEffect(() => {
    if (!hasPhoto || created) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasPhoto, created]);

  const onPhoto = async (file: Blob) => {
    setAiState('idle');
    setAnalysis(null);
    currentImage.current = null;
    const id = await take(file);
    if (!id) return;
    currentImage.current = id;
    await runAnalysis(id);
  };

  /** The AI decides whether the photo may become a spot; the server enforces the same verdict on publish. */
  const runAnalysis = async (id: string) => {
    setAiState('analyzing');
    try {
      const res = await analyze.mutateAsync(id);
      if (currentImage.current !== id) return;
      setAnalysis(res);
      setAiState('done');
      if (!res.accepted) return;
      const t = res.suggestedTitle.trim().slice(0, 60);
      const d = res.suggestedDescription.trim().slice(0, 400);
      setTitle(cur => (!cur.trim() || cur === aiFill.current.title ? t : cur));
      setDescription(cur => (!cur.trim() || cur === aiFill.current.description ? d : cur));
      aiFill.current = { title: t, description: d };
    } catch {
      if (currentImage.current === id) setAiState('error');
    }
  };

  const retake = () => {
    reset();
    currentImage.current = null;
    setAiState('idle');
    setAnalysis(null);
  };

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    window.scrollTo({ top: 0 });
  };

  const leave = () => goBack();

  const back = () => {
    if (step > 0) go(step - 1);
    else if (hasPhoto) setConfirmLeave(true);
    else leave();
  };

  const close = () => (hasPhoto ? setConfirmLeave(true) : leave());

  const detailErrors = {
    title: titleError(title),
    description: descError(description),
    meetAt: isPublic ? meetTimeError(meetAt) : null,
  };
  const detailsValid = !detailErrors.title && !detailErrors.description && !detailErrors.meetAt;

  const continueDetails = () => {
    setShowErrors(true);
    if (detailsValid) go(2);
    else toast.error('Check the highlighted fields.');
  };

  const choosePreset = (key: PresetKey) => {
    const p = PRESETS.find(x => x.key === key)!;
    setPreset(key);
    setMeetAt(toLocalInput(p.at(new Date())));
  };

  const publish = async () => {
    if (!photoAccepted || !photo?.imageId) return go(0);
    if (!detailsValid) {
      setShowErrors(true);
      toast.error('Check the details first.');
      return go(1);
    }
    if (!pos) return;
    const startsAt = !isPublic || preset === 'now' ? new Date() : fromLocalInput(meetAt)!;
    try {
      const ev = await create.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        lat: pos.lat,
        lng: pos.lng,
        address: landmark.trim() || undefined,
        startsAt: startsAt.toISOString(),
        beforeImageId: photo.imageId,
        isPublic,
        showName: !isPublic && showName,
      });
      toast.success('Spot published — it’s on the map.');
      setCreated(ev);
    } catch (err) {
      toast.error(errorMessage(err));
      if (err instanceof ApiError && ['image_not_found', 'photo_rejected', 'photo_not_checked'].includes(err.code)) {
        retake();
        go(0);
      } else if (err instanceof ApiError && err.code === 'invalid_input') {
        setShowErrors(true);
        go(1);
      }
    }
  };

  if (created) return <Published spot={created} />;

  const now = new Date();
  const slide = reduce
    ? {}
    : {
        initial: { opacity: 0, x: dir * 36 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: dir * -36 },
        transition: { duration: 0.22, ease: 'easeOut' as const },
      };

  return (
    <div className="flex min-h-dvh flex-col">
      <header
        className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 px-3 pb-3 backdrop-blur-md"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex h-14 items-center gap-1">
          <IconButton label={step > 0 ? 'Previous step' : 'Back'} variant="ghost" onClick={back}>
            <ArrowLeft size={22} strokeWidth={2.25} />
          </IconButton>
          <h1 className="min-w-0 flex-1 truncate font-display text-xl font-bold">Spot a mess</h1>
          <IconButton label="Cancel" variant="ghost" onClick={close}>
            <X size={22} strokeWidth={2.25} />
          </IconButton>
        </div>
        <Steps current={step} labels={STEP_LABELS} className="px-2" />
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {step === 0 && (
          <motion.section key="photo" {...slide} className="flex flex-col gap-4 px-4 pt-5">
            {!photo ? (
              <>
                <div>
                  <h2 className="font-display text-display">Show us the mess</h2>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
                    Snap a photo. Our AI suggests a title and description for you.
                  </p>
                </div>
                <PhotoCapture
                  onPhoto={onPhoto}
                  title="Take a photo of the mess"
                  hint="Get the whole mess in the frame."
                  samples={config.devTools ? BEFORE_SAMPLES : undefined}
                  busy={preparing}
                />
              </>
            ) : (
              <>
                <PhotoPreview
                  src={photo.url}
                  alt="Before photo of the mess"
                  onRetake={retake}
                  uploading={photo.uploading}
                  uploaded={!!photo.imageId}
                />
                {aiState !== 'idle' && (
                  <AiAnalysisCard
                    state={aiState}
                    analysis={analysis}
                    onRetry={photo.imageId ? () => runAnalysis(photo.imageId!) : undefined}
                  />
                )}
              </>
            )}
          </motion.section>
        )}

        {step === 1 && (
          <motion.section key="details" {...slide} className="flex flex-col gap-5 px-4 pt-5">
            <Switch
              checked={isPublic}
              onChange={setIsPublic}
              icon={<Users size={20} />}
              label="Public cleanup meetup"
              description={isPublic ? 'Other heroes can join you at a set time.' : 'You’ll clean it yourself, right now.'}
            />
            {!isPublic && (
              <Switch
                checked={showName}
                onChange={setShowName}
                icon={<UserRound size={20} />}
                label="Show my name on the map"
                description={showName ? 'Your name appears on this spot.' : 'The spot stays anonymous.'}
              />
            )}

            <Field
              label="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={60}
              placeholder="e.g. Plastic bottles on the beach stairs"
              error={showErrors ? detailErrors.title : null}
              hint={title && title === aiFill.current.title ? <AiHint /> : undefined}
              autoComplete="off"
              enterKeyHint="next"
            />
            <Field
              multiline
              label="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={400}
              rows={4}
              placeholder="What’s there, how big is it, what should people bring?"
              error={showErrors ? detailErrors.description : null}
              hint={description && description === aiFill.current.description ? <AiHint /> : undefined}
            />

            {isPublic && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 px-1 text-sm font-semibold">
                  <Clock size={16} className="text-brand" />
                  Meeting time
                </div>
                <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
                  {PRESETS.map(p => (
                    <Chip key={p.key} selected={preset === p.key} onClick={() => choosePreset(p.key)}>
                      {p.label}
                    </Chip>
                  ))}
                </div>
                <Field
                  label={<span className="font-medium text-muted">Or pick a date and time</span>}
                  type="datetime-local"
                  value={meetAt}
                  min={toLocalInput(now)}
                  max={toLocalInput(new Date(now.getTime() + MAX_AHEAD_MS))}
                  onChange={e => {
                    setMeetAt(e.target.value);
                    setPreset(null);
                  }}
                  error={showErrors ? detailErrors.meetAt : null}
                  hint={
                    !detailErrors.meetAt ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock size={14} />
                        {preset === 'now' ? 'Right now' : formatMeetTime(fromLocalInput(meetAt)!.toISOString())}
                      </span>
                    ) : undefined
                  }
                />
              </div>
            )}

            <Field
              label={
                <span>
                  Landmark <span className="font-normal text-muted">(optional)</span>
                </span>
              }
              value={landmark}
              onChange={e => setLandmark(e.target.value)}
              maxLength={120}
              counter={landmark.length > 90}
              placeholder="e.g. behind the stadium parking"
              autoComplete="off"
            />
          </motion.section>
        )}

        {step === 2 && (
          <motion.section key="location" {...slide} className="flex flex-1 flex-col gap-3 px-4 pt-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                <MapPin size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-[22px] font-bold leading-tight">This is where you are</h2>
                <p className="text-sm text-muted">
                  The spot goes on the map at your live GPS position{isPublic ? ', and heroes meet you there' : ''}.
                </p>
              </div>
            </div>
            <div className="relative min-h-[340px] flex-1 overflow-hidden rounded-card bg-line-soft shadow-card">
              <GpsLocation mapId={config.mapId} onChange={setPos} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <BottomBar>
        {step === 0 && (
          <Button
            size="lg"
            full
            disabled={!photoAccepted}
            onClick={() => go(1)}
            iconRight={<ArrowRight size={20} />}
          >
            {photo?.uploading ? 'Uploading…' : aiState === 'analyzing' ? 'Checking…' : 'Continue'}
          </Button>
        )}
        {step === 1 && (
          <Button size="lg" full onClick={continueDetails} iconRight={<ArrowRight size={20} />}>
            Continue
          </Button>
        )}
        {step === 2 && (
          <Button size="lg" full loading={create.isPending} disabled={!pos} onClick={publish} icon={<Send size={20} />}>
            Publish
          </Button>
        )}
      </BottomBar>

      <ConfirmSheet
        open={confirmLeave}
        title="Leave without publishing?"
        body="Your photo and details will be lost."
        confirmLabel="Leave"
        cancelLabel="Keep editing"
        tone="danger"
        onConfirm={() => {
          setConfirmLeave(false);
          reset();
          leave();
        }}
        onClose={() => setConfirmLeave(false)}
      />
    </div>
  );
}

function AiHint() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Sparkles size={13} className="text-brand" />
      Suggested by AI — edit it freely.
    </span>
  );
}

function Published({ spot }: { spot: EventDetail }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    const t = setTimeout(() => leafConfetti({ y: 0.3 }), 250);
    return () => clearTimeout(t);
  }, []);

  const rise = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.4 } };

  return (
    <div
      className="flex min-h-dvh flex-col items-center px-5 text-center"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 56px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
    >
      <motion.div
        initial={reduce ? false : { scale: 0, rotate: -25 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        className="relative grid size-24 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_22%,#9BDB4E_0%,#2FA54C_38%,#006233_100%)] shadow-[0_18px_40px_-14px_rgba(0,98,51,0.8)]"
      >
        <span aria-hidden className="absolute -inset-3 rounded-full border-2 border-dashed border-brand/25" />
        <CheckStroke size={48} strokeWidth={3} />
      </motion.div>

      <motion.h1 className="mt-7 font-display text-display" {...rise(0.15)}>
        {spot.isPublic ? 'Spot published! 🌿' : 'Yallah, clean it up! 🌿'}
      </motion.h1>
      <motion.p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted" {...rise(0.25)}>
        {spot.isPublic
          ? 'It’s on the map now. The more friends join, the bigger the dot.'
          : 'When you’re done, snap the AFTER photo from the same angle to earn your XP and coins.'}
      </motion.p>

      <motion.div className="mt-7 w-full overflow-hidden rounded-card bg-surface text-left shadow-card" {...rise(0.35)}>
        <img src={spot.beforeImageUrl} alt={`Before photo of ${spot.title}`} className="aspect-[16/9] w-full object-cover" />
        <div className="flex flex-col gap-1 p-4">
          <h2 className="line-clamp-2 font-display text-lg font-bold leading-snug">{spot.title}</h2>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Clock size={14} className="shrink-0" />
            <span className="shrink-0">{spot.isPublic ? formatMeetTime(spot.startsAt) : 'Solo cleanup'}</span>
            {spot.address && <span className="min-w-0 truncate">· {spot.address}</span>}
          </p>
        </div>
      </motion.div>

      <motion.div className="mt-auto flex w-full flex-col gap-2 pt-8" {...rise(0.45)}>
        {spot.isPublic ? (
          <Button size="lg" full icon={<Share2 size={20} />} onClick={() => shareSpot(spot)}>
            Share with friends
          </Button>
        ) : (
          <ButtonLink to={`/spots/${spot.id}/finish`} replace size="lg" full icon={<Camera size={20} />}>
            I’m done, take the after photo
          </ButtonLink>
        )}
        <ButtonLink to={`/spots/${spot.id}`} replace variant="secondary" size="lg" full>
          View spot
        </ButtonLink>
      </motion.div>
    </div>
  );
}
