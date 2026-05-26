'use client';

import { useForm, DeclarationThirdParty } from '@/contexts/FormContext';
import { DECLARATIONS } from '@/lib/mockData';

function DeclThirdPartyCard({
  dtp,
  index,
  canRemove,
}: {
  dtp: DeclarationThirdParty;
  index: number;
  canRemove: boolean;
}) {
  const { dispatch } = useForm();

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      dispatch({ type: 'UPDATE_DECL_THIRD_PARTY', id: dtp.id, field, value: e.target.value });
  }

  return (
    <div className="third-party-card accordion">
      <button
        type="button"
        className="acc-head"
        onClick={() => dispatch({ type: 'TOGGLE_DECL_THIRD_PARTY', id: dtp.id })}
      >
        <span className="third-party-title">
          {dtp.name || `Subjekti i tretë ${index + 1}`}
        </span>
        <span>{dtp.open ? '▲' : '▼'}</span>
      </button>
      {dtp.open && (
        <div className="acc-body">
          {canRemove && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <button
                type="button"
                className="remove-third"
                onClick={() => dispatch({ type: 'REMOVE_DECL_THIRD_PARTY', id: dtp.id })}
              >
                Fshi
              </button>
            </div>
          )}
          <div className="third-party-fields">
            <div className="field">
              <label>Emri i subjektit (i personit juridik)</label>
              <input type="text" value={dtp.name} onChange={update('name')} />
            </div>
            <div className="field">
              <label>Numri i Identifikimit (NUIS/NIPT)</label>
              <input type="text" value={dtp.nipt} onChange={update('nipt')} />
            </div>
            <div className="field full">
              <label>Adresa</label>
              <input type="text" value={dtp.address} onChange={update('address')} />
            </div>
            <div className="field">
              <label>Emri dhe mbiemri i Administratorit</label>
              <input type="text" value={dtp.admin} onChange={update('admin')} />
            </div>
            <div className="field">
              <label>Telefon</label>
              <input type="tel" value={dtp.phone} onChange={update('phone')} />
            </div>
            <div className="field">
              <label>e-mail</label>
              <input type="email" value={dtp.email} onChange={update('email')} />
            </div>
            <div className="field full">
              <label>
                Objekti i marrëveshjes/Përshkrim i shërbimit ose aktivitetit që do të kryejë
                pala e tretë
              </label>
              <textarea value={dtp.object} onChange={update('object')} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShpsfFields() {
  const { state, dispatch, registerFile } = useForm();

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: 'SET_FIELD', field: field as never, value: e.target.value });
  }

  return (
    <div className="declaration-fields">
      <div className="field">
        <label>
          Emri i shoqërisë SHPSF<span className="req">*</span>
        </label>
        <input type="text" value={state.shpsfName} onChange={set('shpsfName')} />
      </div>
      <div className="field">
        <label>
          Numri i Identifikimit (NUIS/NIPT)<span className="req">*</span>
        </label>
        <input type="text" value={state.shpsfNipt} onChange={set('shpsfNipt')} />
      </div>
      <div className="field full">
        <label>
          Adresa<span className="req">*</span>
        </label>
        <input type="text" value={state.shpsfAddress} onChange={set('shpsfAddress')} />
      </div>
      <div className="field">
        <label>
          Emri dhe mbiemri i Administratorit<span className="req">*</span>
        </label>
        <input type="text" value={state.shpsfAdmin} onChange={set('shpsfAdmin')} />
      </div>
      <div className="field">
        <label>
          Telefon<span className="req">*</span>
        </label>
        <input type="tel" value={state.shpsfPhone} onChange={set('shpsfPhone')} />
      </div>
      <div className="field">
        <label>
          e-mail<span className="req">*</span>
        </label>
        <input type="email" value={state.shpsfEmail} onChange={set('shpsfEmail')} />
      </div>
      <div className="field full">
        <label>
          Objekti i marrëveshjes<span className="req">*</span>
        </label>
        <input type="text" value={state.securityObject} onChange={set('securityObject')} />
      </div>
      <div className="field">
        <label>
          Kohëzgjatja<span className="req">*</span>
        </label>
        <input type="text" value={state.securityDuration} onChange={set('securityDuration')} />
      </div>
      <div className="field">
        <label>
          Marrëveshja e sigurisë fizike<span className="req">*</span>
        </label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              dispatch({ type: 'SET_FIELD', field: 'securityAgreementFileName', value: f.name });
              registerFile('securityAgreement', f);
            }
          }}
        />
        {state.securityAgreementFileName && (
          <p style={{ color: 'var(--ok)', fontWeight: 800, marginTop: 6 }}>
            ✓ {state.securityAgreementFileName}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Step5Declarations() {
  const { state, dispatch } = useForm();

  function handleDeclare() {
    dispatch({ type: 'SET_ALL_DECLARATIONS', value: true });
  }

  return (
    <section>
      <div className="section-title">5. FORMULARI I VETËDEKLARIMEVE</div>

      <div className="selfdeclarations">
        {DECLARATIONS.map((decl, i) => (
          <div key={decl.letter} className="self-card">
            <label className="self-check">
              <input
                type="checkbox"
                checked={state.declarations[i]}
                onChange={(e) =>
                  dispatch({ type: 'SET_DECLARATION', index: i, value: e.target.checked })
                }
              />
              {decl.letter}. {decl.title} <span className="req">*</span>
            </label>
            <p>{decl.text}</p>
            {decl.items.length > 0 && (
              <ul>
                {decl.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}

            {decl.hasThirdPartyList && (
              <>
                <div className="third-party-list" style={{ marginTop: 14 }}>
                  {state.declarationThirdParties.map((dtp, idx) => (
                    <DeclThirdPartyCard
                      key={dtp.id}
                      dtp={dtp}
                      index={idx}
                      canRemove={idx > 0}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="draft"
                  style={{ marginTop: 8 }}
                  onClick={() => dispatch({ type: 'ADD_DECL_THIRD_PARTY' })}
                >
                  + Shto subjekt të tretë
                </button>
                <p className="small-note">
                  Pas pajisjes me licencë, subjekti dorëzon pranë Agjencisë kontratat e lidhura
                  me subjektet e treta brenda 5 ditëve nga nënshkrimi i tyre.
                </p>
              </>
            )}

            {decl.hasShpsfFields && <ShpsfFields />}
          </div>
        ))}
      </div>

      <div className="declare-action">
        <button type="button" onClick={handleDeclare}>
          Deklaroj
        </button>
      </div>

      <div className="action-row">
        <button
          type="button"
          className="nav-btn"
          onClick={() => dispatch({ type: 'SET_STEP', step: 3 })}
        >
          Kthehu
        </button>
        <button
          type="button"
          className="nav-btn primary"
          onClick={() => dispatch({ type: 'SET_STEP', step: 5 })}
        >
          Vazhdo tek hapi tjetër
        </button>
      </div>
    </section>
  );
}
