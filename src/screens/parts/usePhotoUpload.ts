import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { errorMessage, uploadImage } from '../../lib/api';
import { compressImage } from '../../lib/image';

export interface UploadedPhoto {
  /** Local object URL for instant preview. */
  url: string;
  imageId: string | null;
  uploading: boolean;
}

/**
 * compress → local preview → upload. Resolves with the image id, or null when it failed or a newer photo
 * (or a reset) superseded it.
 */
export function usePhotoUpload() {
  const [photo, setPhoto] = useState<UploadedPhoto | null>(null);
  const [preparing, setPreparing] = useState(false);
  const token = useRef(0);
  const urlRef = useRef<string | null>(null);

  const setUrl = (url: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = url;
  };
  useEffect(() => () => setUrl(null), []);

  const take = useCallback(async (file: Blob): Promise<string | null> => {
    const mine = ++token.current;
    setPreparing(true);
    let blob: Blob;
    try {
      blob = await compressImage(file);
    } catch (err) {
      if (mine === token.current) {
        setPreparing(false);
        toast.error(errorMessage(err));
      }
      return null;
    }
    if (mine !== token.current) return null;
    const url = URL.createObjectURL(blob);
    setUrl(url);
    setPreparing(false);
    setPhoto({ url, imageId: null, uploading: true });
    try {
      const { id } = await uploadImage(blob);
      if (mine !== token.current) return null;
      setPhoto({ url, imageId: id, uploading: false });
      return id;
    } catch (err) {
      if (mine !== token.current) return null;
      setUrl(null);
      setPhoto(null);
      toast.error(errorMessage(err));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    token.current++;
    setUrl(null);
    setPhoto(null);
    setPreparing(false);
  }, []);

  return { photo, preparing, take, reset };
}
