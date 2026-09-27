import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Button, Notice, OtpInput } from '../components';
import { ApiError } from '../lib/api';
import { useRequestCode, useVerifyCode } from '../lib/queries';
import { AuthShell } from './parts/AuthShell';
import { safeNext, withQuery } from './parts/nav';

const RESEND_SEC = 30;

export function CodeScreen() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const email = params.get('email')?.trim().toLowerCase() ?? '';
  const next = safeNext(params.get('next'));

  const verify = useVerifyCode();
  const resend = useRequestCode();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [devLogin, setDevLogin] = useState(() => !!(location.state as { devLogin?: boolean } | null)?.devLogin);
  const [cooldown, setCooldown] = useState(RESEND_SEC);

  useEffect(() => {
    if (!email) navigate(withQuery('/login', { next: next !== '/' ? next : null }), { replace: true });
  }, [email, navigate, next]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown(c => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submit = useCallback(
    async (digits: string) => {
      if (!email || verify.isPending) return;
      setError(null);
      try {
        const data = await verify.mutateAsync({ email, code: digits });
        const needsOnboarding = data.isNew || !data.user.firstName;
        navigate(needsOnboarding ? withQuery('/onboarding', { next: next !== '/' ? next : null }) : safeNext(next), {
          replace: true,
        });
      } catch (err) {
        setCode('');
        setError(err instanceof ApiError ? err.message : 'That code did not work.');
      }
    },
    [email, verify, navigate, next],
  );

  const onResend = async () => {
    if (!email || cooldown > 0 || resend.isPending) return;
    try {
      const res = await resend.mutateAsync(email);
      setDevLogin(!!res.devLogin);
      setCooldown(RESEND_SEC);
      setCode('');
      setError(null);
      toast.success('New code sent.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not resend the code.');
    }
  };

  if (!email) return null;

  return (
    <AuthShell>
      <div className="flex flex-1 flex-col">
        <h1 className="font-display text-[28px] font-bold leading-tight">Check your inbox</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          We sent a 6-digit code to{' '}
          <span className="font-semibold text-ink">{email}</span>.{' '}
          <Link
            to={withQuery('/login', { email, next: next !== '/' ? next : null })}
            className="font-semibold text-brand underline-offset-2 hover:underline"
          >
            Change
          </Link>
        </p>

        {devLogin && (
          <Notice tone="info" className="mt-5" title="Test account — use code 424242">
            Any <span className="font-mono">@naqiwha.test</span> address skips real email in dev.
          </Notice>
        )}

        <div className="mt-8">
          <OtpInput value={code} onChange={setCode} onComplete={submit} disabled={verify.isPending} error={error} autoFocus />
        </div>

        <div className="mt-auto pt-10">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            full
            disabled={cooldown > 0 || resend.isPending}
            loading={resend.isPending}
            onClick={onResend}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
