import type { ChatMessage, ChatPage, ChatState } from '../shared/chat';
import type { EventDetail } from '../shared/types';

const HOUR = 60 * 60 * 1000;

/** The chat as the screen sees it: every message received so far, plus the latest page's state. */
export type ChatView = { messages: ChatMessage[]; cursor: string; state: ChatState; canPost: boolean; closesAt: string | null };

/** Merges a page of new or changed messages into the view (replace by id, oldest first). Deletion is final: a stale
 *  copy from an overlapping poll never brings a deleted message back. */
export function mergeChat(prev: ChatView | undefined, page: ChatPage): ChatView {
  const byId = new Map((prev?.messages ?? []).map(m => [m.id, m]));
  for (const m of page.messages) {
    if (byId.get(m.id)?.deleted && !m.deleted) continue;
    byId.set(m.id, m);
  }
  const messages = [...byId.values()].sort((a, b) =>
    a.createdAt === b.createdAt ? a.id.localeCompare(b.id) : a.createdAt < b.createdAt ? -1 : 1);
  return { messages, cursor: page.cursor, state: page.state, canPost: page.canPost, closesAt: page.closesAt };
}

/** Chats close 24 h after the spot is cleaned or closed by a moderator. */
export function chatClosesAt(ev: EventDetail): Date | null {
  const endsAt = ev.closedAt ?? ev.cleanedAt;
  return endsAt ? new Date(Date.parse(endsAt) + 24 * HOUR) : null;
}

export function chatAvailable(ev: EventDetail, isAdmin: boolean): boolean {
  const closesAt = chatClosesAt(ev);
  return ev.isPublic && (!!ev.viewer?.hasJoined || isAdmin) && !(closesAt && closesAt.getTime() <= Date.now());
}

/** "5 h", or "less than an hour" in the last hour. */
export function formatClosesIn(closesAt: string, now = Date.now()): string {
  const hours = (Date.parse(closesAt) - now) / HOUR;
  return hours < 1 ? 'less than an hour' : `${Math.floor(hours)} h`;
}
