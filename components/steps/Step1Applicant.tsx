'use client';

import { useForm } from '@/contexts/FormContext';

function Field({
  label,
  required,
  children,
  full,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`field${full ? ' full' : ''}`}>
      <label>
        {label}
        {required && <span className="req">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function Step1Applicant() {
  const { state, dispatch, registerFile } = useForm();
  const isAuthorized = state.applicationFiller === 'Personi i autorizuar nga subjekti aplikues';

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: 'SET_FIELD', field: field as never, value: e.target.value });
  }

  return (
    <section>
      <div className="section-title">1. TË DHËNAT E SUBJEKTIT DHE PËRFAQËSIMI NË APLIKIM</div>

      <div className="grid">
        <Field label="Emri i subjektit (i personit juridik)" required full>
          <input type="text" value={state.subjectName} onChange={set('subjectName')} />
        </Field>
        <Field label="Numri i Identifikimit (NUIS/NIPT)" required>
          <input type="text" value={state.nipt} onChange={set('nipt')} />
        </Field>
        <Field label="Telefon" required>
          <input type="tel" value={state.phone} onChange={set('phone')} />
        </Field>
        <Field label="e-mail i subjektit" required>
          <input type="email" value={state.subjectEmail} onChange={set('subjectEmail')} />
        </Field>
        <Field label="Adresa" required full>
          <input type="text" value={state.address} onChange={set('address')} />
        </Field>
      </div>

      <div className="filler-choice">
        <div className="filler-choice-title">
          Përfaqësimi në procedurën e aplikimit<span className="req">*</span>
        </div>
        <div className="choice-grid" style={{ gridTemplateColumns: 'repeat(2,minmax(0,1fr))' }}>
          {[
            'Administratori/përfaqësuesi ligjor i subjektit',
            'Personi i autorizuar nga subjekti aplikues',
          ].map((opt) => (
            <label key={opt} className="choice">
              <input
                type="checkbox"
                checked={state.applicationFiller === opt}
                onChange={() => dispatch({ type: 'TOGGLE_FILLER', value: opt })}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div className="subsection-title">TË DHËNAT E PERSONIT QË KRYEN APLIKIMIN</div>
      <p className="section-note">
        Ky seksion plotësohet për personin që kryen aplikimin online. Nëse aplikimi kryhet nga
        personi i autorizuar, akti i përfaqësimit (autorizimi/prokura) duhet të ngarkohet.
      </p>

      <div className="notice">
        {state.applicationFiller === ''
          ? 'Zgjidhni nëse aplikimi kryhet nga administratori/përfaqësuesi ligjor apo nga personi i autorizuar.'
          : `Aplikimi po kryhet nga: ${state.applicationFiller}.`}
      </div>

      <div className="grid">
        <Field label="Emër" required>
          <input type="text" value={state.repFirstName} onChange={set('repFirstName')} />
        </Field>
        <Field label="Mbiemër" required>
          <input type="text" value={state.repLastName} onChange={set('repLastName')} />
        </Field>
        <Field label="Atësi" required>
          <input type="text" value={state.repFatherName} onChange={set('repFatherName')} />
        </Field>
        <Field label="Datëlindje" required>
          <input type="date" value={state.repBirthDate} onChange={set('repBirthDate')} />
        </Field>
        <Field label="Vendlindje" required>
          <input type="text" value={state.repBirthPlace} onChange={set('repBirthPlace')} />
        </Field>
        <Field label="Vendbanim" required>
          <input type="text" value={state.repResidence} onChange={set('repResidence')} />
        </Field>
        <Field label="Nr. ID" required>
          <input type="text" value={state.repId} onChange={set('repId')} />
        </Field>
        <Field label="Adresë elektronike" required>
          <input type="email" value={state.repEmail} onChange={set('repEmail')} />
        </Field>
        <Field label="Numër telefoni" required>
          <input type="tel" value={state.repPhone} onChange={set('repPhone')} />
        </Field>

        {isAuthorized && (
          <Field label="Akti i përfaqësimit (autorizimi/prokura)" required full>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  dispatch({ type: 'SET_FIELD', field: 'repAuthorityFileName', value: f.name });
                  registerFile('repAuthority', f);
                }
              }}
            />
            {state.repAuthorityFileName && (
              <p style={{ color: 'var(--ok)', fontWeight: 800, marginTop: 6 }}>
                ✓ {state.repAuthorityFileName}
              </p>
            )}
            <p className="small-note">
              Ngarkoni aktin e përfaqësimit kur aplikimi kryhet nga personi i autorizuar.
            </p>
          </Field>
        )}
      </div>

      <div className="action-row">
        <span />
        <button
          type="button"
          className="nav-btn primary"
          onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
        >
          Vazhdo tek hapi tjetër
        </button>
      </div>
    </section>
  );
}
