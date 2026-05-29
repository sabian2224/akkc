// Shared file rules used on both the client (pre-upload validation) and the
// server (storage paths). Keep the limits in sync with the bucket settings in
// supabase/schema.sql.

export const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB
export const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];
export const ALLOWED_EXT = ['pdf', 'jpg', 'jpeg', 'png'];

/**
 * Validates a file against the type/size rules. Returns an Albanian error
 * message to show the user, or null when the file is acceptable.
 */
export function validateFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const typeOk = ALLOWED_MIME.includes(file.type) || ALLOWED_EXT.includes(ext);
  if (!typeOk) {
    return 'Lloji i skedarit nuk lejohet. Lejohen vetëm PDF, JPG, JPEG ose PNG.';
  }
  if (file.size > MAX_FILE_BYTES) {
    return 'Skedari është shumë i madh. Madhësia maksimale është 20 MB për dokument.';
  }
  return null;
}

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

/**
 * Resolves the Content-Type to send when uploading. Browsers sometimes report
 * an empty `file.type`; since the bucket now restricts MIME types, falling back
 * to the extension keeps valid uploads from being rejected.
 */
export function contentTypeFor(file: File): string {
  if (file.type && ALLOWED_MIME.includes(file.type)) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

/**
 * Builds the canonical storage path for an uploaded document. Used by both the
 * upload-url route and the submit route so the path is always derived
 * server-side from the application id + key, never trusted from the client.
 */
export function buildStoragePath(applicationId: string, key: string, name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? 'bin';
  return `${applicationId}/${key}.${ext}`;
}
