export interface PermissionSettings {
  locationGranted: boolean;
  cameraGranted: boolean;
  notificationsGranted: boolean;
  lastPromptedAt: string;
}

const STORAGE_KEY = 'bazar360_persistent_permissions';

export function getSavedPermissions(): PermissionSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return {
    locationGranted: false,
    cameraGranted: false,
    notificationsGranted: false,
    lastPromptedAt: ''
  };
}

export function savePermissionState(
  key: 'locationGranted' | 'cameraGranted' | 'notificationsGranted',
  value: boolean
): PermissionSettings {
  const current = getSavedPermissions();
  const updated = {
    ...current,
    [key]: value,
    lastPromptedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

export async function requestLocationAccessPersistent(): Promise<GeolocationPosition | null> {
  if (!navigator.geolocation) return null;
  
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        savePermissionState('locationGranted', true);
        resolve(pos);
      },
      (err) => {
        console.warn('Location permission request declined or unavailable:', err);
        savePermissionState('locationGranted', false);
        resolve(null);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
}

export async function requestCameraAccessPersistent(): Promise<MediaStream | null> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return null;
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    savePermissionState('cameraGranted', true);
    return stream;
  } catch (err) {
    console.warn('Camera access denied or device unavailable:', err);
    savePermissionState('cameraGranted', false);
    return null;
  }
}
