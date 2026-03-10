import { api } from '@/lib/api';

const MEDIA_MARKER = '/media/';

export function extractMediaPublicId(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url, window.location.origin);
    const path = parsed.pathname || '';
    const markerIndex = path.indexOf(MEDIA_MARKER);
    if (markerIndex === -1) return null;
    const publicId = decodeURIComponent(path.slice(markerIndex + MEDIA_MARKER.length));
    return publicId || null;
  } catch {
    return null;
  }
}

function encodePath(publicId: string): string {
  return publicId
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/');
}

export async function deleteMediaUrl(url: string | null | undefined): Promise<boolean> {
  const publicId = extractMediaPublicId(url);
  if (!publicId) return false;
  await api.delete(`/admin/upload/${encodePath(publicId)}`);
  return true;
}

export async function deleteMediaUrls(urls: Array<string | null | undefined>): Promise<void> {
  const seen = new Set<string>();
  for (const url of urls) {
    const publicId = extractMediaPublicId(url);
    if (!publicId || seen.has(publicId)) continue;
    seen.add(publicId);
    await api.delete(`/admin/upload/${encodePath(publicId)}`);
  }
}
