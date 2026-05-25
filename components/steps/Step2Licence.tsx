'use client';

import { useForm } from '@/contexts/FormContext';

const LICENCES = [
  'Kultivim dhe prodhim i bimës së cannabis-it për qëllime mjekësore',
  'Transport i farërave, bimëve, nënprodukteve dhe produkteve të cannabis-it për qëllime mjekësore në territorin e Republikës së Shqipërisë',
  'Eksport i bimëve, nënprodukteve dhe produkteve të cannabis-it për qëllime mjekësore',
];

const UNITS = ['1 njësi', '2 njësi', '3 njësi', '4 njësi'];

const ENVS = ['Ambient i hapur', 'Ambient i mbuluar', 'Serë'];

export default function Step2Licence() {
  const { state, dispatch } = useForm();

  return (
    <section>
      <div className="section-title">2. LLOJI I LICENCËS DHE TË DHËNAT E VEPRIMTARISË</div>

      <div className="subsection-title">2.1 VEPRIMTARIA PËR TË CILËN APLIKOHET</div>
      <p className="section-note">Mund të zgjidhen të treja veprimtaritë.</p>
      <div className="license-options">
        {LICENCES.map((l) => (
          <label key={l} className="choice">
            <input
              type="checkbox"
              checked={state.licenceTypes.includes(l)}
              onChange={() => dispatch({ type: 'TOGGLE_LICENCE', value: l })}
            />
            {l}
          </label>
        ))}
      </div>

      <div className="subsection-title">
        2.2 PËRSHKRIMI I AKTIVITETIT PËR TË CILIN KËRKOHET LICENCA
      </div>
      <div className="field full">
        <label>
          Përshkrimi i aktivitetit<span className="req">*</span>
        </label>
        <textarea
          value={state.activityDescription}
          onChange={(e) =>
            dispatch({ type: 'SET_FIELD', field: 'activityDescription', value: e.target.value })
          }
        />
      </div>

      <div className="subsection-title">2.3 NUMRI DHE SIPËRFAQJA E NJËSIVE</div>
      <p>
        Licenca mund të përfshijë deri në 4 njësi, të cilat duhet të jenë kufitare me
        njëra-tjetrën. Sipërfaqja e çdo njësie: minimumi 5 hektarë, maksimumi 10 hektarë
        (sipas pikës 7, të nenit 14, të ligjit nr. 61/2023).
      </p>
      <div className="choice-grid">
        {UNITS.map((u) => (
          <label key={u} className="choice">
            <input
              type="radio"
              name="unitNumber"
              checked={state.unitNumber === u}
              onChange={() =>
                dispatch({ type: 'SET_FIELD', field: 'unitNumber', value: u })
              }
            />
            {u}
          </label>
        ))}
      </div>

      <div className="subsection-title">Ambienti i kultivimit</div>
      <div className="choice-grid">
        {ENVS.map((env) => (
          <label key={env} className="choice">
            <input
              type="checkbox"
              checked={state.cultivationEnv.includes(env)}
              onChange={() => dispatch({ type: 'TOGGLE_CULTIVATION', value: env })}
            />
            {env}
          </label>
        ))}
      </div>

      <div className="field full" style={{ marginTop: 16 }}>
        <label>
          Përshkruani sipërfaqen, koordinatat dhe vendndodhjen e secilës njësi të propozuar
          për licencim<span className="req">*</span>
        </label>
        <textarea
          value={state.unitsDescription}
          onChange={(e) =>
            dispatch({ type: 'SET_FIELD', field: 'unitsDescription', value: e.target.value })
          }
        />
      </div>

      <div className="action-row">
        <button
          type="button"
          className="nav-btn"
          onClick={() => dispatch({ type: 'SET_STEP', step: 0 })}
        >
          Kthehu
        </button>
        <button
          type="button"
          className="nav-btn primary"
          onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}
        >
          Vazhdo tek hapi tjetër
        </button>
      </div>
    </section>
  );
}
