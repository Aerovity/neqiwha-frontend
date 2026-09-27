import { type FormEvent, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Avatar, Button, Field, UserName } from '../components';
import { ApiError } from '../lib/api';
import { useMe, useUpdateMe } from '../lib/queries';
import { AuthShell } from './parts/AuthShell';
import { safeNext } from './parts/nav';

function previewDisplay(first: string, last: string) {
  const f = first.trim();
  const l = last.trim();
  if (!f) return 'Your name';
  return l ? `${f} ${l[0]}.` : f;
}

function previewInitials(first: string, last: string) {
  const a = first.trim()[0] ?? '';
  const b = last.trim()[0] ?? '';
  return (a + b).toUpperCase() || '?';
}

export function OnboardingScreen() {
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const navigate = useNavigate();
  const me = useMe();
  const update = useUpdateMe();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<{ first?: string; last?: string }>({});

  const preview = useMemo(() => previewDisplay(firstName, lastName), [firstName, lastName]);
  const initials = useMemo(() => previewInitials(firstName, lastName), [firstName, lastName]);
  const seed = me.data?.id ?? 'preview';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const f = firstName.trim();
    const l = lastName.trim();
    const nextErrors: typeof errors = {};
    if (f.length < 1) nextErrors.first = 'First name is required.';
    if (l.length < 1) nextErrors.last = 'Last name is required.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    try {
      await update.mutateAsync({ firstName: f, lastName: l });
      navigate(safeNext(next), { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save your name.');
    }
  };

  return (
    <AuthShell>
      <form onSubmit={submit} className="flex flex-1 flex-col">
        <h1 className="font-display text-[28px] font-bold leading-tight">What should we call you?</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Your first name and last initial show on the map and leaderboard.
        </p>

        <div className="mt-8 flex items-center gap-4 rounded-card bg-surface p-4 shadow-card">
          <Avatar initials={initials} level={0} seed={seed} size={56} label={preview} />
          <UserName name={preview} level={0} className="text-lg" />
        </div>

        <Field
          className="mt-6"
          label="First name"
          name="firstName"
          autoComplete="given-name"
          autoFocus
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          maxLength={40}
          error={errors.first ?? null}
          disabled={update.isPending}
        />
        <Field
          className="mt-4"
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          maxLength={40}
          error={errors.last ?? null}
          disabled={update.isPending}
        />

        <div className="mt-auto pt-8">
          <Button type="submit" size="lg" full loading={update.isPending}>
            Let&apos;s go
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
