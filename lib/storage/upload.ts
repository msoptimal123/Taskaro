import imageCompression from 'browser-image-compression';
import { createBrowserClient } from '@/lib/supabase/client';

export async function uploadAttachment(
  file: File,
  entityType: 'task' | 'project',
  entityId: string,
  userId: string
): Promise<{ path: string; filename: string; mime_type: string; size_bytes: number }> {
  let uploadFile = file;
  let mimeType = file.type;

  if (file.type.startsWith('image/')) {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 2400,
      useWebWorker: true,
      fileType: 'image/webp',
    });
    uploadFile = new File([compressed], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
    mimeType = 'image/webp';
  }

  const filename = `${Date.now()}-${uploadFile.name}`;
  const path = `attachments/${userId}/${entityType}/${entityId}/${filename}`;

  const supabase = createBrowserClient();
  const { error } = await supabase.storage.from('attachments').upload(path, uploadFile);
  if (error) throw error;

  return { path, filename, mime_type: mimeType, size_bytes: uploadFile.size };
}

export async function getSignedUrl(path: string): Promise<string> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.storage.from('attachments').createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
