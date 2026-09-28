import { useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { useParams } from 'react-router';
import clsx from 'clsx';
import { ArrowDown, Ellipsis, Lock, MessageCircle, SearchX, SendHorizontal, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, Button, ButtonLink, ConfirmSheet, EmptyState, IconButton, Notice, ScreenHeader, Skeleton } from '../components';
import { ApiError, errorMessage } from '../lib/api';
import { formatClosesIn } from '../lib/chat';
import { plural } from '../lib/format';
import { isChatGone, useChat, useDeleteMessage, useEvent, useMe, useSendMessage } from '../lib/queries';
import type { ChatMessage } from '../shared/chat';
import { groupByDay } from './parts/groupByDay';

const MAX_LENGTH = 500;
const COUNTER_FROM = 450;
const NEAR_BOTTOM = 80;
const LONG_PRESS_MS = 500;
const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

export function ChatScreen() {
  const { id = '' } = useParams();
  const event = useEvent(id);
  const chat = useChat(id);
  const me = useMe();
  const del = useDeleteMessage(id);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const title = event.data?.title ?? 'Chat';
  const header = (
    <ScreenHeader
      back={`/spots/${id}`}
      title={title}
      right={event.data && <span className="pr-2 text-[13px] text-muted">{plural(event.data.participantCount, 'hero', 'heroes')}</span>}
    />
  );

  if (isChatGone(chat.error) || (chat.isError && !chat.data)) {
    const err = chat.error;
    const status = err instanceof ApiError ? err.status : 0;
    const gone = isChatGone(err);
    return (
      <div className="min-h-dvh">
        {header}
        <EmptyState
          icon={status === 404 ? <SearchX size={36} /> : <MessageCircle size={36} />}
          title={
            status === 403 ? 'Join this spot to see its chat.'
            : status === 410 ? 'This chat has closed.'
            : gone ? errorMessage(err)
            : "We couldn't load this chat."
          }
          body={gone ? undefined : 'Check your connection and try again.'}
          action={
            gone ? (
              <ButtonLink to={status === 404 ? '/' : `/spots/${id}`}>{status === 404 ? 'Back to the map' : 'Back to the spot'}</ButtonLink>
            ) : (
              <Button onClick={() => chat.refetch()} loading={chat.isFetching}>Try again</Button>
            )
          }
        />
      </div>
    );
  }

  if (!chat.data) {
    return (
      <div className="min-h-dvh">
        {header}
        <div className="flex flex-col gap-3 p-4">
          <Skeleton className="h-12 w-2/3 rounded-card" />
          <Skeleton className="ml-auto h-12 w-1/2 rounded-card" />
          <Skeleton className="h-16 w-3/4 rounded-card" />
        </div>
      </div>
    );
  }

  const { messages, state, canPost, closesAt } = chat.data;
  const moderatorView = !!me.data?.isAdmin && event.data?.viewer?.hasJoined === false;

  const onDelete = () => {
    if (!confirmId) return;
    del.mutate(confirmId, {
      onSuccess: () => {
        toast.success('Message deleted.');
        setConfirmId(null);
      },
      onError: err => toast.error(errorMessage(err)),
    });
  };

  return (
    <div className="flex h-dvh flex-col">
      {header}

      <div className="flex flex-col gap-2 px-4 pt-3 empty:hidden">
        {state === 'cleaned' && closesAt && (
          <Notice tone="cleaned" title="Saha! Spot cleaned.">
            This chat closes in {formatClosesIn(closesAt)}.
          </Notice>
        )}
        {state === 'closed' && (
          <Notice tone="danger" icon={<Lock size={18} />}>
            A moderator closed this spot. The chat is read-only.
          </Notice>
        )}
        {moderatorView && (
          <Notice icon={<ShieldCheck size={18} />}>You're viewing as a moderator.</Notice>
        )}
      </div>

      <MessageList messages={messages} onAskDelete={setConfirmId} />

      {canPost && <Composer eventId={id} />}

      <ConfirmSheet
        open={!!confirmId}
        title="Delete this message?"
        body="Everyone in the chat will see that it was deleted."
        confirmLabel="Delete"
        tone="danger"
        loading={del.isPending}
        onConfirm={onDelete}
        onClose={() => setConfirmId(null)}
      />
    </div>
  );
}

function MessageList({ messages, onAskDelete }: { messages: ChatMessage[]; onAskDelete: (id: string) => void }) {
  const listRef = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const prevCount = useRef(0);
  const [unseen, setUnseen] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior) => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  };

  useLayoutEffect(() => {
    const count = messages.length;
    if (count > prevCount.current) {
      if (prevCount.current === 0) scrollToBottom('auto');
      else if (nearBottom.current || messages[count - 1]?.mine) scrollToBottom(scrollBehavior());
      else setUnseen(true);
    }
    prevCount.current = count;
  }, [messages]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM;
    if (nearBottom.current) setUnseen(false);
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState icon={<MessageCircle size={36} />} title="No messages yet" body="Say salam to your crew 👋" />
      </div>
    );
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={listRef} onScroll={onScroll} className="h-full overflow-y-auto px-4 py-3" aria-live="polite">
        {groupByDay(messages).map(group => (
          <section key={group.key} className="flex flex-col gap-1.5">
            <h2 className="my-2 self-center rounded-pill bg-line-soft px-3 py-1 text-xs font-medium text-muted">{group.label}</h2>
            {group.items.map((m, i) => (
              <Bubble
                key={m.id}
                message={m}
                showAuthor={!m.mine && group.items[i - 1]?.author?.id !== m.author?.id}
                onAskDelete={onAskDelete}
              />
            ))}
          </section>
        ))}
      </div>
      {unseen && (
        <button
          type="button"
          onClick={() => scrollToBottom(scrollBehavior())}
          className="absolute bottom-3 left-1/2 inline-flex h-11 -translate-x-1/2 items-center gap-1.5 rounded-pill bg-ink px-4 text-sm font-semibold text-white shadow-float"
        >
          New messages <ArrowDown size={16} />
        </button>
      )}
    </div>
  );
}

function Bubble({ message: m, showAuthor, onAskDelete }: {
  message: ChatMessage; showAuthor: boolean; onAskDelete: (id: string) => void;
}) {
  const pressTimer = useRef<number | undefined>(undefined);
  const cancelPress = () => window.clearTimeout(pressTimer.current);
  const longPress = m.canDelete
    ? {
        onTouchStart: () => { pressTimer.current = window.setTimeout(() => onAskDelete(m.id), LONG_PRESS_MS); },
        onTouchEnd: cancelPress,
        onTouchMove: cancelPress,
        onContextMenu: (e: MouseEvent) => e.preventDefault(),
      }
    : {};
  const name = m.author?.displayName ?? 'Former hero';

  return (
    <div className={clsx('flex items-end gap-2', m.mine ? 'flex-row-reverse' : 'flex-row', showAuthor && 'mt-2')}>
      {!m.mine && (
        <div className="w-8 shrink-0">
          {showAuthor && (
            <Avatar initials={m.author?.initials ?? '?'} level={m.author?.level ?? 0} size={28} seed={m.author?.id} frame={false} />
          )}
        </div>
      )}
      <div className={clsx('flex min-w-0 max-w-[78%] flex-col', m.mine ? 'items-end' : 'items-start')}>
        {showAuthor && (
          <div className="mb-0.5 flex items-center gap-1.5 px-1 text-xs text-muted">
            <span className="font-semibold text-ink">{name}</span>
            {m.isOrganizer && <span className="rounded-pill bg-brand-soft px-1.5 py-px font-medium text-brand-strong">Organizer</span>}
          </div>
        )}
        <div
          {...longPress}
          className={clsx(
            'rounded-card px-3.5 py-2 text-[15px] leading-snug select-text',
            m.deleted ? 'bg-line-soft text-muted italic'
            : m.mine ? 'rounded-br-sm bg-brand text-white'
            : 'rounded-bl-sm bg-surface text-ink shadow-card',
          )}
        >
          {m.deleted ? (
            m.deleted === 'moderator' ? 'Removed by a moderator' : 'Message deleted'
          ) : (
            <p dir="auto" className="whitespace-pre-wrap [overflow-wrap:anywhere]">{m.body}</p>
          )}
          <span className={clsx('mt-0.5 block text-right text-[11px]', m.mine && !m.deleted ? 'text-white/70' : 'text-muted')}>
            {time.format(new Date(m.createdAt))}
          </span>
        </div>
      </div>
      {m.canDelete && (
        <IconButton label="Message options" variant="ghost" className="text-muted" onClick={() => onAskDelete(m.id)}>
          <Ellipsis size={18} />
        </IconButton>
      )}
    </div>
  );
}

function Composer({ eventId }: { eventId: string }) {
  const send = useSendMessage(eventId);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow up to 5 lines, then scroll inside the box.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [draft]);

  const submit = () => {
    const text = draft.trim();
    if (!text || send.isPending) return;
    send.mutate(text, {
      onSuccess: () => setDraft(''),
      onError: err => toast.error(errorMessage(err)),
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter is a new line; never send mid-composition (Arabic and other IMEs).
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={e => { e.preventDefault(); submit(); }}
      className="border-t border-line/70 bg-paper px-3 pt-2"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
    >
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          maxLength={MAX_LENGTH}
          rows={1}
          dir="auto"
          placeholder="Message your crew"
          aria-label="Message"
          className="min-h-11 flex-1 resize-none rounded-[22px] bg-surface px-4 py-2.5 text-[15px] leading-snug shadow-[inset_0_0_0_1.5px_var(--color-line)] outline-none focus:shadow-[inset_0_0_0_2px_var(--color-brand)]"
        />
        <Button
          type="submit"
          aria-label="Send"
          size="sm"
          className="w-11 shrink-0 px-0!"
          loading={send.isPending}
          disabled={!draft.trim() || send.isPending}
        >
          <SendHorizontal size={20} />
        </Button>
      </div>
      {draft.length >= COUNTER_FROM && (
        <p className={clsx('mt-1 px-2 text-right text-xs', draft.length >= MAX_LENGTH ? 'text-danger' : 'text-muted')}>
          {draft.length}/{MAX_LENGTH}
        </p>
      )}
    </form>
  );
}
