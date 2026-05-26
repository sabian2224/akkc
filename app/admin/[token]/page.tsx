import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { DECLARATIONS } from '@/lib/mockData';
import type { FormState, FileInfo } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface ApplicationRow {
  id: string;
  application_id: string;
  submitted_at: string;
  data: FormState;
  files: Record<string, FileInfo>;
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('admin_token', token)
    .single();

  if (error || !data) notFound();

  const app = data as ApplicationRow;
  const fd = app.data;

  // Generate 7-day signed download URLs for every stored file
  const signedUrls: Record<string, string> = {};
  for (const [key, info] of Object.entries(app.files)) {
    const { data: urlData } = await supabase.storage
      .from('documents')
      .createSignedUrl(info.path, 604800);
    if (urlData?.signedUrl) signedUrls[key] = urlData.signedUrl;
  }

  const submittedAt = new Date(app.submitted_at).toLocaleString('sq-AL', {
    timeZone: 'Europe/Tirane',
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <div style={{ fontFamily: '"Times New Roman", Times, serif', maxWidth: 960, margin: '0 auto', padding: '24px 16px', fontSize: '11pt', color: '#1a1a1a' }}>
      {/* Header */}
      <div style={{ background: '#5c4b8c', color: '#fff', padding: '16px 24px', borderRadius: 4, marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: '16pt', fontWeight: 700 }}>AKKC – Panel Administrativ</h1>
        <p style={{ margin: '4px 0 0', fontSize: '9pt', opacity: 0.8 }}>
          Konfidencial – mos e ndani këtë link me persona të paautorizuar
        </p>
      </div>

      {/* Meta bar */}
      <div style={{ background: '#f5f2ec', border: '1px solid #d8d0be', borderRadius: 4, padding: '10px 16px', marginBottom: 24, fontSize: '10pt' }}>
        <strong>ID i aplikimit:</strong> {app.application_id} &nbsp;|&nbsp;
        <strong>Dorëzuar:</strong> {submittedAt}
      </div>

      {/* Section 1 – Applicant */}
      <AdminSection title="1. Të dhënat e aplikantit dhe përfaqësimi">
        <Row label="Emri i subjektit" value={fd.subjectName} />
        <Row label="NUIS/NIPT" value={fd.nipt} />
        <Row label="Telefon" value={fd.phone} />
        <Row label="E-mail i subjektit" value={fd.subjectEmail} />
        <Row label="Adresa" value={fd.address} />
        <Row label="Përfaqësimi" value={fd.applicationFiller} />
        <Row label="Emër" value={fd.repFirstName} />
        <Row label="Mbiemër" value={fd.repLastName} />
        <Row label="Atësi" value={fd.repFatherName} />
        <Row label="Datëlindje" value={fd.repBirthDate} />
        <Row label="Vendlindje" value={fd.repBirthPlace} />
        <Row label="Vendbanim" value={fd.repResidence} />
        <Row label="Nr. ID" value={fd.repId} />
        <Row label="E-mail (përfaqësuesi)" value={fd.repEmail} />
        <Row label="Telefon (përfaqësuesi)" value={fd.repPhone} />
      </AdminSection>

      {/* Section 2 – Licence */}
      <AdminSection title="2. Lloji i licencës dhe të dhënat e veprimtarisë">
        <Row label="Veprimtaritë" value={fd.licenceTypes.join('; ')} />
        <Row label="Përshkrimi i aktivitetit" value={fd.activityDescription} />
        <Row label="Numri i njësive" value={fd.unitNumber} />
        <Row label="Ambienti i kultivimit" value={fd.cultivationEnv.join(', ')} />
        <Row label="Sipërfaqja / vendndodhja" value={fd.unitsDescription} />
      </AdminSection>

      {/* Section 3 – Third parties */}
      {fd.thirdPartyOption && (
        <AdminSection title="3. Aktivitete nga subjekte të treta">
          <Row label="Opsioni" value={fd.thirdPartyOption} />
          {fd.thirdParties.map((tp, i) => (
            <div key={tp.id} style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #ccc' }}>
              <strong>Subjekti i tretë {i + 1}: {tp.name}</strong>
              <Row label="NUIS/NIPT" value={tp.nipt} />
              <Row label="Adresa" value={tp.address} />
              <Row label="Administratori" value={tp.admin} />
              <Row label="Telefon" value={tp.phone} />
              <Row label="E-mail" value={tp.email} />
              <Row label="Shërbimi" value={tp.serviceDesc} />
            </div>
          ))}
        </AdminSection>
      )}

      {/* Section 4 – Documents */}
      <AdminSection title="4. Dokumentacioni i ngarkuar">
        {Object.keys(app.files).length === 0 ? (
          <p style={{ color: '#888' }}>Nuk ka dokumente të ngarkuara.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginTop: 8 }}>
            <thead>
              <tr style={{ background: '#f5f2ec' }}>
                <th style={thStyle}>Dokumenti</th>
                <th style={thStyle}>Personi / Subjekti</th>
                <th style={{ ...thStyle, width: 100 }}>Shkarko</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(app.files).map(([key, info]) => (
                <tr key={key} style={{ borderBottom: '1px solid #e8e0d0' }}>
                  <td style={tdStyle}>{info.label}</td>
                  <td style={tdStyle}>{info.person ?? '—'}</td>
                  <td style={tdStyle}>
                    {signedUrls[key] ? (
                      <a href={signedUrls[key]} target="_blank" rel="noopener noreferrer"
                         style={{ color: '#5c4b8c', fontWeight: 700 }}>
                        Shkarko
                      </a>
                    ) : (
                      <span style={{ color: '#aaa' }}>N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style={{ fontSize: '9pt', color: '#888', marginTop: 8 }}>
          Linket e shkarkimit janë të vlefshëm për 7 ditë nga hapja e kësaj faqeje.
        </p>
      </AdminSection>

      {/* Section 5 – Declarations */}
      <AdminSection title="5. Formulari i vetëdeklarimeve">
        {DECLARATIONS.map((decl, i) => (
          <Row
            key={decl.letter}
            label={`${decl.letter}. ${decl.title}`}
            value={fd.declarations[i] ? 'Konfirmuar ✓' : 'Jo konfirmuar ✗'}
            ok={fd.declarations[i]}
          />
        ))}
        {fd.declarationThirdParties.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <strong>G – Subjekte të treta (vetëdeklarim)</strong>
            {fd.declarationThirdParties.map((dtp, i) => (
              <div key={dtp.id} style={{ marginTop: 8, paddingLeft: 12, borderLeft: '3px solid #d8d0be' }}>
                <Row label={`Subjekti ${i + 1}`} value={dtp.name} />
                <Row label="NIPT" value={dtp.nipt} />
                <Row label="Objekti" value={dtp.object} />
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #ccc' }}>
          <strong>H – Shoqëria SHPSF</strong>
          <Row label="Emri" value={fd.shpsfName} />
          <Row label="NUIS/NIPT" value={fd.shpsfNipt} />
          <Row label="Adresa" value={fd.shpsfAddress} />
          <Row label="Administratori" value={fd.shpsfAdmin} />
          <Row label="Telefon" value={fd.shpsfPhone} />
          <Row label="E-mail" value={fd.shpsfEmail} />
          <Row label="Objekti i marrëveshjes" value={fd.securityObject} />
          <Row label="Kohëzgjatja" value={fd.securityDuration} />
        </div>
      </AdminSection>

      <p style={{ fontSize: '9pt', color: '#aaa', textAlign: 'center', marginTop: 32 }}>
        AKKC Sistem Aplikimesh — {app.application_id}
      </p>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '7px 10px',
  border: '1px solid #d8d0be',
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  padding: '7px 10px',
  border: '1px solid #e8e0d0',
  verticalAlign: 'top',
};

function AdminSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ background: '#5c4b8c', color: '#fff', padding: '7px 14px', fontSize: '10.5pt', fontWeight: 700, borderRadius: '3px 3px 0 0' }}>
        {title}
      </div>
      <div style={{ border: '1px solid #d8d0be', borderTop: 'none', padding: '12px 16px', borderRadius: '0 0 3px 3px' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid #f5f2ec', fontSize: '10pt' }}>
      <span style={{ minWidth: 230, color: '#555', flexShrink: 0 }}>{label}:</span>
      <span style={{ fontWeight: 600, color: ok === false ? '#b91c1c' : ok === true ? '#166534' : 'inherit' }}>
        {value || '—'}
      </span>
    </div>
  );
}
