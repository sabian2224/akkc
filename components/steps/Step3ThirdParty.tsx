'use client';

import { useForm, ThirdParty } from '@/contexts/FormContext';

function ThirdPartyCard({
  tp,
  index,
}: {
  tp: ThirdParty;
  index: number;
}) {
  const { dispatch } = useForm();

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      dispatch({ type: 'UPDATE_THIRD_PARTY', id: tp.id, field, value: e.target.value });
  }

  return (
    <div className="third-party-card accordion">
      <button
        type="button"
        className="acc-head"
        onClick={() => dispatch({ type: 'TOGGLE_THIRD_PARTY', id: tp.id })}
      >
        <span>{tp.name || `Subjekti i tretë ${index + 1}`}</span>
        <span>{tp.open ? '▲' : '▼'}</span>
      </button>
      {tp.open && (
        <div className="acc-body">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button
              type="button"
              className="remove-third"
              onClick={() => dispatch({ type: 'REMOVE_THIRD_PARTY', id: tp.id })}
            >
              Fshi
            </button>
          </div>
          <div className="third-party-fields">
            <div className="field">
              <label>
                Emri i subjektit (i personit juridik)<span className="req">*</span>
              </label>
              <input type="text" value={tp.name} onChange={update('name')} />
            </div>
            <div className="field">
              <label>
                Numri i Identifikimit (NUIS/NIPT)<span className="req">*</span>
              </label>
              <input type="text" value={tp.nipt} onChange={update('nipt')} />
            </div>
            <div className="field full">
              <label>
                Adresa<span className="req">*</span>
              </label>
              <input type="text" value={tp.address} onChange={update('address')} />
            </div>
            <div className="field">
              <label>
                Emri dhe mbiemri i Administratorit<span className="req">*</span>
              </label>
              <input type="text" value={tp.admin} onChange={update('admin')} />
            </div>
            <div className="field">
              <label>
                Telefon<span className="req">*</span>
              </label>
              <input type="tel" value={tp.phone} onChange={update('phone')} />
            </div>
            <div className="field">
              <label>
                e-mail<span className="req">*</span>
              </label>
              <input type="email" value={tp.email} onChange={update('email')} />
            </div>
            <div className="field full">
              <label>
                Përshkrim i shërbimit ose aktivitetit që do të kryejë pala e tretë
                <span className="req">*</span>
              </label>
              <textarea value={tp.serviceDesc} onChange={update('serviceDesc')} />
            </div>
            <div className="field full">
              <label>
                Marrëveshja noteriale/dokument mbështetës<span className="req">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f)
                    dispatch({
                      type: 'UPDATE_THIRD_PARTY',
                      id: tp.id,
                      field: 'fileName',
                      value: f.name,
                    });
                }}
              />
              {tp.fileName && (
                <p style={{ color: 'var(--ok)', fontWeight: 800, marginTop: 6 }}>
                  ✓ {tp.fileName}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Step3ThirdParty() {
  const { state, dispatch } = useForm();

  return (
    <section>
      <div className="section-title">
        3. AKTIVITETE QË DO TË KRYHEN NGA SUBJEKTE TË TRETA<span className="req">*</span>
      </div>

      <div className="choice-grid" style={{ gridTemplateColumns: '1fr' }}>
        <label className="choice">
          <input
            type="radio"
            name="thirdPartyOption"
            checked={state.thirdPartyOption === 'Vetëm aplikanti'}
            onChange={() =>
              dispatch({ type: 'SET_FIELD', field: 'thirdPartyOption', value: 'Vetëm aplikanti' })
            }
          />
          Të gjitha aktivitetet do të kryhen tërësisht vetëm nga subjekti aplikues.
        </label>
        <label className="choice">
          <input
            type="radio"
            name="thirdPartyOption"
            checked={state.thirdPartyOption === 'Subjekte të treta'}
            onChange={() =>
              dispatch({
                type: 'SET_FIELD',
                field: 'thirdPartyOption',
                value: 'Subjekte të treta',
              })
            }
          />
          Disa nga aktivitetet e parashikuara në licencë mund të kryhen, tërësisht ose
          pjesërisht, nga subjekte të treta të kontraktuara, në përputhje me pikën 5, të
          nenit 14, të ligjit nr. 61/2023, si dhe me marrëveshjet përkatëse.
        </label>
      </div>

      {state.thirdPartyOption === 'Subjekte të treta' && (
        <div style={{ marginTop: 16 }}>
          <label className="upload-label">
            Në rast se zgjidhet opsioni i dytë, shtoni të dhënat për çdo subjekt të tretë
            dhe ngarkoni marrëveshjen/dokumentin përkatës.
          </label>
          <div className="third-party-list">
            {state.thirdParties.map((tp, i) => (
              <ThirdPartyCard key={tp.id} tp={tp} index={i} />
            ))}
          </div>
          <button
            type="button"
            className="draft"
            onClick={() => dispatch({ type: 'ADD_THIRD_PARTY' })}
          >
            + Shto subjekt të tretë
          </button>
        </div>
      )}

      <div className="action-row">
        <button
          type="button"
          className="nav-btn"
          onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
        >
          Kthehu
        </button>
        <button
          type="button"
          className="nav-btn primary"
          onClick={() => dispatch({ type: 'SET_STEP', step: 3 })}
        >
          Vazhdo tek hapi tjetër
        </button>
      </div>
    </section>
  );
}
