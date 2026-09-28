import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from './api';
import type {
  AdminAction, AdminEvent, AdminStats, AdminUser, AppConfig, CheckinResult, CompleteResult, EventDetail, EventPin, HistoryEntry, LeaderboardResponse, Me,
  PhotoAnalysis, ShopItem, Voucher,
} from '../shared/types';
import type { ChatMessage, ChatPage } from '../shared/chat';
import { mergeChat, type ChatView } from './chat';

// ---------- queries ----------

export const useConfig = () =>
  useQuery({ queryKey: ['config'], queryFn: () => api<AppConfig>('/config'), staleTime: Infinity });

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await api<Me>('/me');
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    retry: false,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });

export const useEvents = () =>
  useQuery({ queryKey: ['events'], queryFn: () => api<EventPin[]>('/events'), refetchInterval: 15_000 });

export const useEvent = (id: string | undefined, pollMs = 4000) =>
  useQuery({
    queryKey: ['event', id],
    queryFn: () => api<EventDetail>(`/events/${id}`),
    enabled: !!id,
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 1,
    refetchInterval: q => (q.state.data?.status === 'cleaned' || q.state.error ? false : pollMs),
  });

export const useLeaderboard = () =>
  useQuery({ queryKey: ['leaderboard'], queryFn: () => api<LeaderboardResponse>('/leaderboard'), refetchInterval: 30_000 });

export const useShop = () =>
  useQuery({ queryKey: ['shop'], queryFn: () => api<ShopItem[]>('/shop/items'), staleTime: 60_000 });

export const useVouchers = () =>
  useQuery({ queryKey: ['vouchers'], queryFn: () => api<Voucher[]>('/vouchers') });

export const useHistory = () =>
  useQuery({ queryKey: ['history'], queryFn: () => api<HistoryEntry[]>('/me/history') });

export const useMyEvents = () =>
  useQuery({
    queryKey: ['my-events'],
    queryFn: () => api<{ organized: EventPin[]; joined: EventPin[] }>('/me/events'),
  });

// Polls every 3 s for messages created or deleted since the last cursor, merging them into the cached view.
// Stops on any error (e.g. 403 after leaving the spot, 410 once the chat has closed).
export const useChat = (id: string | undefined) => {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['chat', id],
    queryFn: async () => {
      const prev = qc.getQueryData<ChatView>(['chat', id]);
      const since = prev ? `?since=${encodeURIComponent(prev.cursor)}` : '';
      return mergeChat(prev, await api<ChatPage>(`/events/${id}/messages${since}`));
    },
    enabled: !!id,
    retry: (count, err) => !(err instanceof ApiError && [401, 403, 404, 409, 410].includes(err.status)) && count < 1,
    refetchInterval: q => (q.state.error ? false : 3000),
  });
};

// ---------- mutations ----------

export function useRequestCode() {
  return useMutation({
    mutationFn: (email: string) =>
      api<{ ok: true; devLogin?: boolean }>('/auth/request-code', { method: 'POST', json: { email } }),
  });
}

export function useVerifyCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { email: string; code: string }) =>
      api<{ user: Me; isNew: boolean }>('/auth/verify-code', { method: 'POST', json: v }),
    onSuccess: data => {
      qc.setQueryData(['me'], data.user);
      qc.invalidateQueries({ queryKey: ['event'] });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<{ ok: true }>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      qc.clear();
      qc.setQueryData(['me'], null);
    },
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { firstName: string; lastName: string }) => api<Me>('/me', { method: 'PATCH', json: v }),
    onSuccess: me => qc.setQueryData(['me'], me),
  });
}

export function useAnalyzePhoto() {
  return useMutation({
    mutationFn: (imageId: string) => api<PhotoAnalysis>('/ai/analyze-photo', { method: 'POST', json: { imageId } }),
  });
}

export interface CreateEventInput {
  title: string;
  description: string;
  lat: number;
  lng: number;
  address?: string;
  startsAt: string;
  beforeImageId: string;
  /** false = solo cleanup (nobody else can join). */
  isPublic: boolean;
  /** Solo spots only: show the organizer's name. */
  showName: boolean;
}
export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: CreateEventInput) => api<EventDetail>('/events', { method: 'POST', json: v }),
    onSuccess: ev => {
      qc.setQueryData(['event', ev.id], ev);
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['my-events'] });
    },
  });
}

export function useJoin(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (join: boolean) => api<EventDetail>(`/events/${id}/join`, { method: join ? 'POST' : 'DELETE' }),
    onSuccess: ev => {
      qc.setQueryData(['event', id], ev);
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['my-events'] });
    },
  });
}

export function useCheckin(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => api<CheckinResult>(`/events/${id}/checkin`, { method: 'POST', json: { code } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useComplete(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (afterImageId: string) =>
      api<CompleteResult>(`/events/${id}/complete`, { method: 'POST', json: { afterImageId } }),
    onSuccess: res => {
      qc.setQueryData(['event', id], res.event);
      qc.invalidateQueries({ queryKey: ['events'] });
      if (res.verified) {
        qc.invalidateQueries({ queryKey: ['me'] });
        qc.invalidateQueries({ queryKey: ['leaderboard'] });
        qc.invalidateQueries({ queryKey: ['history'] });
      }
    },
  });
}

export function useRewardsSeen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => api<{ ok: true }>('/rewards/seen', { method: 'POST', json: { ids } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function usePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      api<{ voucher: Voucher; coins: number }>('/shop/purchase', { method: 'POST', json: { itemId } }),
    onSuccess: res => {
      qc.setQueryData<Me | null>(['me'], me => (me ? { ...me, coins: res.coins } : me));
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['vouchers'] });
      qc.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useUseVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<Voucher>(`/vouchers/${id}/use`, { method: 'POST' }),
    onSuccess: v => {
      qc.setQueryData<Voucher[]>(['vouchers'], list => list?.map(x => (x.id === v.id ? v : x)));
      qc.invalidateQueries({ queryKey: ['vouchers'] });
    },
  });
}

// ---------- admin ----------

export type AdminEventFilter = 'all' | 'open' | 'in_progress' | 'cleaned' | 'closed';

export const useAdminStats = () =>
  useQuery({ queryKey: ['admin', 'stats'], queryFn: () => api<AdminStats>('/admin/stats') });

export const useAdminEvents = (status: AdminEventFilter, q: string) =>
  useQuery({
    queryKey: ['admin', 'events', status, q],
    queryFn: () => api<AdminEvent[]>(`/admin/events?${new URLSearchParams({ status, q })}`),
    placeholderData: prev => prev,
  });

export const useAdminUsers = (q: string) =>
  useQuery({
    queryKey: ['admin', 'users', q],
    queryFn: () => api<AdminUser[]>(`/admin/users?${new URLSearchParams({ q })}`),
    placeholderData: prev => prev,
  });

export const useAdminLog = () =>
  useQuery({ queryKey: ['admin', 'log'], queryFn: () => api<AdminAction[]>('/admin/log') });

export type AdminEventAction = 'close' | 'reopen' | 'delete';

/** Close / reopen / delete any spot. Refreshes the map, the spot itself and the admin lists. */
export function useAdminEventAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: AdminEventAction }) =>
      action === 'delete'
        ? api<{ ok: true }>(`/admin/events/${id}`, { method: 'DELETE' })
        : api<{ ok: true }>(`/admin/events/${id}/${action}`, { method: 'POST' }),
    onSuccess: (_res, { id, action }) => {
      if (action === 'delete') qc.removeQueries({ queryKey: ['event', id] });
      else qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['my-events'] });
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useSetAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAdmin }: { id: string; isAdmin: boolean }) =>
      api<{ ok: true }>(`/admin/users/${id}/admin`, { method: 'POST', json: { isAdmin } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });
}

// ---------- chat ----------

/** Puts a message the server just returned into the cached chat without waiting for the next poll. */
function useMergeMessage(id: string) {
  const qc = useQueryClient();
  return (msg: ChatMessage) =>
    qc.setQueryData<ChatView>(['chat', id], v => v && mergeChat(v, { ...v, messages: [msg] }));
}

export function useSendMessage(id: string) {
  const merge = useMergeMessage(id);
  return useMutation({
    mutationFn: (body: string) => api<ChatMessage>(`/events/${id}/messages`, { method: 'POST', json: { body } }),
    onSuccess: merge,
  });
}

export function useDeleteMessage(id: string) {
  const merge = useMergeMessage(id);
  return useMutation({
    mutationFn: (messageId: string) => api<ChatMessage>(`/events/${id}/messages/${messageId}`, { method: 'DELETE' }),
    onSuccess: merge,
  });
}
