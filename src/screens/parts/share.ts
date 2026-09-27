import { toast } from 'sonner';

export const spotUrl = (id: string) => `${window.location.origin}/spots/${id}`;

/** Web Share API when available, otherwise copy the link and toast. */
export async function shareSpot(spot: { id: string; title: string }) {
  const url = spotUrl(spot.id);
  const text = `Help clean this spot with me on Naqiwha: ${spot.title}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: spot.title, text, url });
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied — send it to your friends.');
  } catch {
    toast.error(`Couldn't copy the link. Here it is: ${url}`);
  }
}
