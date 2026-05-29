import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sendAdminEmail, sendApplicantEmail } from '@/lib/email';
import { buildStoragePath } from '@/lib/files';
import { randomBytes } from 'crypto';
import { MAIN_DOCS, FIGURE_DOCS } from '@/lib/mockData';
import type { FormState, FileInfo } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { applicationId, formData, files: uploadedFiles } = await req.json() as {
      applicationId: string;
      formData: FormState;
      files: { key: string; name: string }[];
    };

    const adminToken = randomBytes(32).toString('hex');

    // Enrich file metadata with human-readable labels for the admin view.
    // Storage paths are derived server-side from the application id + key so we
    // never trust an arbitrary path supplied by the client.
    const files: Record<string, FileInfo> = {};
    for (const { key, name } of uploadedFiles) {
      const path = buildStoragePath(applicationId, key, name);
      let label = key;
      let person: string | undefined;

      if (key === 'repAuthority') {
        label = 'Akti i përfaqësimit';
      } else if (key === 'securityAgreement') {
        label = 'Marrëveshja e sigurisë fizike';
      } else if (key.startsWith('mainDoc_')) {
        const idx = Number(key.split('_')[1]);
        label = MAIN_DOCS[idx]?.[0] ?? key;
      } else if (key.startsWith('personDoc_')) {
        const parts = key.split('_');
        const personId = Number(parts[1]);
        const docId = Number(parts[2]);
        const p = formData.people.find((x) => x.id === personId);
        person = p ? `${p.name} – ${p.role}` : `Person ${personId}`;
        label = FIGURE_DOCS[docId]?.[0] ?? key;
      } else if (key.startsWith('thirdParty_')) {
        const id = Number(key.split('_')[1]);
        const tp = formData.thirdParties.find((x) => x.id === id);
        label = `Marrëveshje noteriale – ${tp?.name ?? ''}`;
      } else if (key.startsWith('supportDoc_')) {
        const id = Number(key.split('_')[1]);
        const sd = formData.supportDocs.find((x) => x.id === id);
        label = sd?.description || 'Dokument mbështetës';
      }

      files[key] = { path, label, ...(person ? { person } : {}) };
    }

    const supabase = createServerClient();

    const { error: dbError } = await supabase.from('applications').insert({
      application_id: applicationId,
      admin_token: adminToken,
      data: formData,
      files,
    });
    if (dbError) {
      // The files were uploaded to Storage before this row could be created.
      // Remove them so a failed submission doesn't leave orphans behind.
      const paths = Object.values(files).map((f) => f.path);
      if (paths.length) {
        await supabase.storage.from('documents').remove(paths);
      }
      throw dbError;
    }

    const now = new Date().toLocaleString('sq-AL', { timeZone: 'Europe/Tirane' });

    // Email failures must not block the submission response
    try {
      await Promise.all([
        sendAdminEmail({
          applicationId,
          adminToken,
          subjectName: formData.subjectName,
          nipt: formData.nipt,
          subjectEmail: formData.subjectEmail,
          repName: `${formData.repFirstName} ${formData.repLastName}`,
          submittedAt: now,
        }),
        sendApplicantEmail({
          applicationId,
          repFirstName: formData.repFirstName,
          repLastName: formData.repLastName,
          subjectEmail: formData.subjectEmail,
          submittedAt: now,
        }),
      ]);
    } catch (emailErr) {
      console.error('[submit] email send failed:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[submit]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
