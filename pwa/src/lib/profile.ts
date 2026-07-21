/** Local profile (UI-only). PFP stored as data URL on-device. */

const KEY = 'toofies.pwa.profile';

export type UserProfile = {
  displayName: string;
  handle: string;
  bio: string;
  city: string;
  locationLabel: string; // e.g. "Orlando, FL" or place vibe
  locationApprox: boolean; // privacy: approximate only
  avatarDataUrl: string; // empty = use initial
  website: string;
};

const defaults: UserProfile = {
  displayName: '',
  handle: '',
  bio: '',
  city: '',
  locationLabel: '',
  locationApprox: true,
  avatarDataUrl: '',
  website: '',
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...(JSON.parse(raw) as Partial<UserProfile>) };
  } catch {
    return { ...defaults };
  }
}

export function saveProfile(patch: Partial<UserProfile>): UserProfile {
  const next = { ...loadProfile(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // quota — drop avatar if needed
    try {
      const slim = { ...next, avatarDataUrl: '' };
      localStorage.setItem(KEY, JSON.stringify(slim));
      return slim;
    } catch {
      return next;
    }
  }
  return next;
}

/** Read file → resized JPEG data URL for local avatar / dessert photo. */
export function fileToDataUrl(file: File, max = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('canvas'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image'));
    };
    img.src = url;
  });
}
