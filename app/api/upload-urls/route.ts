import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { randomBytes } from 'crypto';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateApplicationId(): string {
  const rand = Array.from(randomBytes(6))
    .map((b) => CHARS[b % CHARS.length])
    .join('');
  return `AKKC-${new Date().getFullYear()}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      files: { key: string; name: string; type: string }[];
    };

    const applicationId = generateApplicationId();
    const supabase = createServerClient();

    const urls = await Promise.all(
      body.files.map(async ({ key, name }) => {
        const ext = name.split('.').pop()?.toLowerCase() ?? 'bin';
        const path = `${applicationId}/${key}.${ext}`;
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUploadUrl(path);
        if (error) throw error;
        return { key, signedUrl: data.signedUrl, path };
      })
    );

    return NextResponse.json({ applicationId, urls });
  } catch (err) {
    console.error('[upload-urls]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
