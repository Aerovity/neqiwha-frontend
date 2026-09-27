import type { ReactNode } from 'react';
import { Sheet } from './Sheet';
import { Button } from './Button';

export interface ConfirmSheetProps {
  open: boolean;
  title: ReactNode;
  body?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
  /** default = brand green, danger = destructive red, gold = spending coins. */
  tone?: 'default' | 'danger' | 'gold';
  icon?: ReactNode;
}

/** Yes/no bottom sheet. Not dismissible while loading. */
export function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  loading,
  tone = 'default',
  icon,
}: ConfirmSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={title} dismissible={!loading}>
      <div className="flex flex-col items-center gap-5 text-center">
        {icon}
        {body && <div className="max-w-sm text-[15px] leading-relaxed text-muted">{body}</div>}
        <div className="flex w-full flex-col gap-2">
          <Button
            size="lg"
            full
            variant={tone === 'danger' ? 'danger' : tone === 'gold' ? 'gold' : 'primary'}
            loading={loading}
            onClick={onConfirm}
            data-autofocus
          >
            {confirmLabel}
          </Button>
          <Button size="lg" full variant="ghost" className="text-muted" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
