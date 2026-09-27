import { type FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Button, Field } from '../components';
import { ApiError } from '../lib/api';
import { useRequestCode } from '../lib/queries';
import { AuthShell } from './parts/AuthShell';
import { safeNext, withQuery } from './parts/nav';

export function LoginScreen() {
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const navigate = useNavigate();
  const request = useRequestCode();
  const [email, setEmail] = useState(() => params.get('email')?.trim() ?? '');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldError('Enter a valid email address.');
      return;
    }
    setFieldError(null);
    try {
      const res = await request.mutateAsync(trimmed);
      navigate(withQuery('/login/code', { email: trimmed, next: next !== '/' ? next : null }), {
        replace: true,
        state: { devLogin: !!res.devLogin },
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not send the code.');
    }
  };

  return (
    <AuthShell>
      <form onSubmit={submit} className="flex flex-1 flex-col">
        <h1 className="font-display text-[28px] font-bold leading-tight">Log in with your email</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">We&apos;ll email you a 6-digit code. No password.</p>

        <Field
          className="mt-8"
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          autoFocus
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={fieldError}
          counter={false}
          disabled={request.isPending}
        />

        <div className="mt-auto pt-8">
          <Button type="submit" size="lg" full loading={request.isPending}>
            Send me a code
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
