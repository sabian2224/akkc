'use client';

import { useState } from 'react';
import { useForm } from '@/contexts/FormContext';
import { DECLARATIONS } from '@/lib/mockData';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li>
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </li>
  );
}

function EditBtn({ step }: { step: number }) {
  const { dispatch } = useForm();
  return (
    <button
      type="button"
      className="review-edit"
      onClick={() => dispatch({ type: 'SET_STEP', step })}
    >
      Ndrysho
    </button>
  );
}

function ReviewSection({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
  return (
    <>
      <h3>
        <EditBtn step={step} />
        {title}
      </h3>
      {children}
    </>
  );
}

export default function Step6Review() {
  const { state, dispatch, status, getFileMap } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');
  const [submitError, setSubmitError] = useState('');

  if (state.submitted) {
    return (
      <section>
        <div className="success-screen">
          <div className="success-icon">✓</div>
          <h2>Aplikimi u dërgua me sukses!</h2>
          <p>
            Aplikimi juaj u dorëzua dhe do të shqyrtohet nga Agjencia Kombëtare e Kontrollit
            të Cannabis-it.
          </p>
          {state.applicationId && (
            <p style={{ marginTop: 12, fontSize: '11pt' }}>
              ID i aplikimit tuaj:{' '}
              <strong style={{ fontFamily: 'monospace', fontSize: '13pt' }}>
                {state.applicationId}
              </strong>
            </p>
          )}
          <p style={{ marginTop: 8 }}>
            Dorëzimi i aplikimit <strong>nuk nënkupton miratim</strong> të licencës.
          </p>
          <p style={{ marginTop: 12, color: '#403b49' }}>
            Një email konfirmimi u dërgua në{' '}
            <strong>{state.subjectEmail}</strong>.
          </p>
          <p style={{ marginTop: 8, color: '#403b49' }}>
            Për çdo pyetje kontaktoni: <strong>info@nacc.gov.al</strong>
          </p>
        </div>
      </section>
    );
  }

  async function handleSubmit() {
    if (!status.allCore) {
      alert('Aplikimi nuk është i plotësuar. Ju lutemi plotësoni seksionet e paplotësuara.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const fileMap = getFileMap();
      const fileEntries = Array.from(fileMap.entries());

      // Step 1: request signed upload URLs + application ID from server
      setSubmitProgress('Duke përgatitur ngarkimin e dokumenteve…');
      const urlsRes = await fetch('/api/upload-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: fileEntries.map(([key, file]) => ({
            key,
            name: file.name,
            type: file.type || 'application/octet-stream',
          })),
        }),
      });
      if (!urlsRes.ok) throw new Error('Nuk u morën URL-et e ngarkimit.');
      const { applicationId, urls } = await urlsRes.json() as {
        applicationId: string;
        urls: { key: string; signedUrl: string; path: string }[];
      };

      // Step 2: upload each file directly to Supabase Storage
      const filePaths: Record<string, string> = {};
      for (let i = 0; i < urls.length; i++) {
        const { key, signedUrl, path } = urls[i];
        setSubmitProgress(`Duke ngarkuar dokumentet… (${i + 1}/${urls.length})`);
        const file = fileMap.get(key)!;
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!uploadRes.ok) throw new Error(`Ngarkimi i dokumentit dështoi (${key}).`);
        filePaths[key] = path;
      }

      // Step 3: save to database + send emails
      setSubmitProgress('Duke ruajtur aplikimin…');
      const submitRes = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, formData: state, filePaths }),
      });
      if (!submitRes.ok) throw new Error('Ruajtja e aplikimit dështoi.');

      dispatch({ type: 'SUBMIT', applicationId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gabim i panjohur.';
      setSubmitError(`Ndodhi një gabim: ${msg} Ju lutemi provoni përsëri.`);
    } finally {
      setSubmitting(false);
      setSubmitProgress('');
    }
  }

  const fillerVal = state.applicationFiller || '—';
  const licenceVal = state.licenceTypes.join('; ') || '—';
  const cultivationVal = state.cultivationEnv.join(', ') || '—';

  return (
    <section>
      <div className="section-title">6. RISHIKIMI I APLIKIMIT</div>

      <div className="notice">
        Përpara dërgimit të aplikimit, ju lutemi kontrolloni me kujdes të gjitha të dhënat e
        plotësuara dhe dokumentet e ngarkuara.
      </div>

      <div className="review-warning">
        Çdo deklarim i rreme, fshehje e të dhënave ose paraqitje dokumentacioni të falsifikuar
        sjell refuzimin ose përjashtimin e aplikimit, pezullimin/shfuqizimin e licencës kur
        zbulohet pas licencimit, njoftimin e organeve kompetente dhe përgjegjësi penale sipas
        Kodit Penal të Republikës së Shqipërisë.
      </div>

      <div style={{ textAlign: 'right', marginBottom: 12 }}>
        <button className="print-btn" type="button" onClick={() => window.print()}>
          Printo
        </button>
      </div>

      <div className="review-paper">
        {/* Section 1 */}
        <ReviewSection title="1. Të dhënat e aplikantit dhe përfaqësimi" step={0}>
          <ul className="review-list">
            <Row label="Emri i subjektit" value={state.subjectName} />
            <Row label="NUIS/NIPT" value={state.nipt} />
            <Row label="Telefon" value={state.phone} />
            <Row label="e-mail i subjektit" value={state.subjectEmail} />
            <Row label="Adresa" value={state.address} />
            <Row label="Përfaqësimi" value={fillerVal} />
            <Row label="Emër" value={state.repFirstName} />
            <Row label="Mbiemër" value={state.repLastName} />
            <Row label="Atësi" value={state.repFatherName} />
            <Row label="Datëlindje" value={state.repBirthDate} />
            <Row label="Vendlindje" value={state.repBirthPlace} />
            <Row label="Vendbanim" value={state.repResidence} />
            <Row label="Nr. ID" value={state.repId} />
            <Row label="Adresë elektronike" value={state.repEmail} />
            <Row label="Numër telefoni" value={state.repPhone} />
            {state.applicationFiller === 'Personi i autorizuar nga subjekti aplikues' && (
              <Row label="Akti i përfaqësimit" value={state.repAuthorityFileName} />
            )}
          </ul>
        </ReviewSection>

        {/* Section 2 */}
        <ReviewSection title="2. Lloji i licencës dhe të dhënat e veprimtarisë" step={1}>
          <ul className="review-list">
            <Row label="Veprimtaritë e zgjedhura" value={licenceVal} />
            <Row label="Përshkrimi i aktivitetit" value={state.activityDescription} />
            <Row label="Numri i njësive" value={state.unitNumber} />
            <Row label="Ambienti i kultivimit" value={cultivationVal} />
            <Row label="Sipërfaqja, koordinatat dhe vendndodhja" value={state.unitsDescription} />
          </ul>
        </ReviewSection>

        {/* Section 3 */}
        <ReviewSection title="3. Aktivitete që do të kryhen nga subjekte të treta" step={2}>
          <ul className="review-list">
            <Row label="Opsioni i zgjedhur" value={state.thirdPartyOption || '—'} />
          </ul>
          {state.thirdParties.length > 0 && (
            <>
              {state.thirdParties.map((tp, i) => (
                <div key={tp.id}>
                  <h4>Subjekti i tretë {i + 1}</h4>
                  <ul className="review-list">
                    <Row label="Emri i subjektit" value={tp.name} />
                    <Row label="NUIS/NIPT" value={tp.nipt} />
                    <Row label="Adresa" value={tp.address} />
                    <Row label="Administratori" value={tp.admin} />
                    <Row label="Telefon" value={tp.phone} />
                    <Row label="e-mail" value={tp.email} />
                    <Row label="Përshkrimi i shërbimit" value={tp.serviceDesc} />
                    <Row label="Dokumenti mbështetës" value={tp.fileName} />
                  </ul>
                </div>
              ))}
            </>
          )}
        </ReviewSection>

        {/* Section 4.1 */}
        <ReviewSection title="4.1 Dokumentacioni i përgjithshëm" step={3}>
          <table className="review-docs">
            <thead>
              <tr>
                <th>Dokumenti</th>
                <th>Dokumenti i ngarkuar</th>
              </tr>
            </thead>
            <tbody>
              {state.mainDocs.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td style={{ color: d.fileName ? 'var(--ok)' : 'var(--danger)', fontWeight: 800 }}>
                    {d.fileName || 'Mungon'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReviewSection>

        {/* Section 4.2 */}
        <ReviewSection title="4.2 Dokumentacioni për verifikimin e pastërtisë së figurës" step={3}>
          {state.people.map((p) => (
            <div key={p.id}>
              <h4>
                {p.name} – {p.role}
              </h4>
              <table className="review-docs">
                <thead>
                  <tr>
                    <th>Dokumenti</th>
                    <th>Dokumenti i ngarkuar</th>
                  </tr>
                </thead>
                <tbody>
                  {p.docs.map((d) => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td style={{ color: d.fileName ? 'var(--ok)' : 'var(--danger)', fontWeight: 800 }}>
                        {d.fileName || 'Mungon'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </ReviewSection>

        {/* Section 4.3 */}
        {state.supportDocs.length > 0 && (
          <ReviewSection title="4.3 Dokumente të tjera mbështetëse" step={3}>
            <table className="review-docs">
              <thead>
                <tr>
                  <th>Përshkrimi</th>
                  <th>Dokumenti i ngarkuar</th>
                </tr>
              </thead>
              <tbody>
                {state.supportDocs.map((sd) => (
                  <tr key={sd.id}>
                    <td>{sd.description || '—'}</td>
                    <td>{sd.fileName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ReviewSection>
        )}

        {/* Section 5 */}
        <ReviewSection title="5. Formulari i vetëdeklarimeve" step={4}>
          <ul className="review-list">
            {DECLARATIONS.map((decl, i) => (
              <Row
                key={decl.letter}
                label={`${decl.letter}. ${decl.title}`}
                value={state.declarations[i] ? 'Konfirmuar ✓' : 'Jo konfirmuar'}
              />
            ))}
          </ul>
          {state.declarationThirdParties.length > 0 && (
            <>
              {state.declarationThirdParties.map((dtp, i) => (
                <div key={dtp.id}>
                  <h4>G – {dtp.name || `Subjekti i tretë ${i + 1}`}</h4>
                  <ul className="review-list">
                    <Row label="Emri" value={dtp.name} />
                    <Row label="NUIS/NIPT" value={dtp.nipt} />
                    <Row label="Adresa" value={dtp.address} />
                    <Row label="Administratori" value={dtp.admin} />
                    <Row label="Objekti i marrëveshjes" value={dtp.object} />
                  </ul>
                </div>
              ))}
            </>
          )}
          <h4>H – Shoqëria SHPSF</h4>
          <ul className="review-list">
            <Row label="Emri i shoqërisë SHPSF" value={state.shpsfName} />
            <Row label="NUIS/NIPT" value={state.shpsfNipt} />
            <Row label="Adresa" value={state.shpsfAddress} />
            <Row label="Administratori" value={state.shpsfAdmin} />
            <Row label="Telefon" value={state.shpsfPhone} />
            <Row label="e-mail" value={state.shpsfEmail} />
            <Row label="Objekti i marrëveshjes" value={state.securityObject} />
            <Row label="Kohëzgjatja" value={state.securityDuration} />
            <Row label="Marrëveshja e sigurisë fizike" value={state.securityAgreementFileName} />
          </ul>
        </ReviewSection>
      </div>

      <div className="disclaimer">
        Për çdo paqartësi ose pyetje lidhur me aplikimin, mund të kontaktoni Agjencinë në
        adresën info@nacc.gov.al.
      </div>

      {submitError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 4, padding: '10px 14px', marginBottom: 12, color: '#b91c1c', fontSize: '10pt' }}>
          {submitError}
        </div>
      )}

      {submitting && submitProgress && (
        <div style={{ background: '#f5f2ec', border: '1px solid #d8d0be', borderRadius: 4, padding: '10px 14px', marginBottom: 12, color: '#5c4b8c', fontSize: '10pt' }}>
          ⏳ {submitProgress}
        </div>
      )}

      <div className="action-row">
        <button
          type="button"
          className="nav-btn"
          disabled={submitting}
          onClick={() => dispatch({ type: 'SET_STEP', step: 4 })}
        >
          Kthehu
        </button>
        <button
          type="button"
          className="nav-btn primary"
          disabled={!status.allCore || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Duke u dërguar…' : 'Dërgo aplikimin'}
        </button>
      </div>
    </section>
  );
}
