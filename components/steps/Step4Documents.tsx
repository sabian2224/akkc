'use client';

import { useState } from 'react';
import { useForm, Person } from '@/contexts/FormContext';
import { PERSON_ROLES } from '@/lib/mockData';

function DocRow({
  doc,
  onUpload,
}: {
  doc: { id: number; name: string; help: string; fileName: string };
  onUpload: (id: number, fileName: string, file: File) => void;
}) {
  return (
    <tr>
      <td>{doc.id + 1}</td>
      <td>
        <div className="doc-name">
          {doc.name}
          <span className="req">*</span>
        </div>
        <p className="doc-help">{doc.help}</p>
      </td>
      <td>
        <span className={`doc-status${doc.fileName ? ' ok' : ''}`}>
          {doc.fileName ? 'Ngarkuar' : 'Mungon'}
        </span>
      </td>
      <td className="doc-actions">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(doc.id, f.name, f);
          }}
        />
        {doc.fileName && (
          <div style={{ color: 'var(--ok)', fontSize: '10.5pt', marginTop: 4 }}>
            ✓ {doc.fileName}
          </div>
        )}
      </td>
    </tr>
  );
}

function PersonAccordion({ person }: { person: Person }) {
  const { dispatch, registerFile } = useForm();

  return (
    <div className="accordion">
      <button
        type="button"
        className="acc-head"
        onClick={() => dispatch({ type: 'TOGGLE_PERSON', id: person.id })}
      >
        <span>
          {person.name}
          <small>{person.role}</small>
        </span>
        <span>{person.open ? '▲' : '▼'}</span>
      </button>
      {person.open && (
        <div className="acc-body">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button
              type="button"
              className="remove-person"
              onClick={() => dispatch({ type: 'REMOVE_PERSON', id: person.id })}
            >
              Fshi
            </button>
          </div>
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>Nr.</th>
                <th>Dokumenti</th>
                <th style={{ width: 130 }}>Statusi</th>
                <th style={{ width: 260 }}>Ngarko</th>
              </tr>
            </thead>
            <tbody>
              {person.docs.map((doc) => (
                <DocRow
                  key={doc.id}
                  doc={doc}
                  onUpload={(docId, fileName, file) => {
                    dispatch({ type: 'UPLOAD_PERSON_DOC', personId: person.id, docId, fileName });
                    registerFile(`personDoc_${person.id}_${docId}`, file);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Step4Documents() {
  const { state, dispatch, registerFile } = useForm();
  const [mainOpen, setMainOpen] = useState(false);
  const [figureOpen, setFigureOpen] = useState(false);
  const [personName, setPersonName] = useState('');
  const [personRole, setPersonRole] = useState(PERSON_ROLES[0]);
  const [nameError, setNameError] = useState(false);

  function addPerson() {
    if (!personName.trim()) {
      setNameError(true);
      return;
    }
    dispatch({ type: 'ADD_PERSON', name: personName.trim(), role: personRole });
    setPersonName('');
    setNameError(false);
  }

  return (
    <section>
      <div className="section-title">4. DOKUMENTACIONI</div>
      <p className="section-note">
        <em>
          Dokumentet ngarkohen në format PDF, JPG, JPEG ose PNG, me madhësi deri në 20 MB për
          dokument. Dokumentet duhet të jenë të plota dhe të lexueshme.
        </em>
      </p>

      {/* 4.1 Main docs */}
      <div className="doc-collapse">
        <button
          type="button"
          className="doc-collapse-head"
          onClick={() => setMainOpen((o) => !o)}
        >
          <span>4.1 DOKUMENTACIONI I PËRGJITHSHËM</span>
          <span className="doc-collapse-action">
            {mainOpen ? 'Mbyll dokumentet' : 'Hap dokumentet'}
          </span>
        </button>
        {mainOpen && (
          <div className="doc-collapse-body">
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: 48 }}>Nr.</th>
                  <th>Dokumenti</th>
                  <th style={{ width: 130 }}>Statusi</th>
                  <th style={{ width: 260 }}>Ngarko</th>
                </tr>
              </thead>
              <tbody>
                {state.mainDocs.map((doc) => (
                  <DocRow
                    key={doc.id}
                    doc={doc}
                    onUpload={(docId, fileName, file) => {
                      dispatch({ type: 'UPLOAD_MAIN_DOC', docId, fileName });
                      registerFile(`mainDoc_${docId}`, file);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4.2 Figure docs */}
      <div className="doc-collapse">
        <button
          type="button"
          className="doc-collapse-head"
          onClick={() => setFigureOpen((o) => !o)}
        >
          <span>4.2 DOKUMENTACIONI PËR VERIFIKIMIN E PASTËRTISË SË FIGURËS</span>
          <span className="doc-collapse-action">
            {figureOpen ? 'Mbyll dokumentet' : 'Hap dokumentet'}
          </span>
        </button>
        {figureOpen && (
          <div className="doc-collapse-body">
            <p className="section-note">
              Ky seksion plotësohet për secilin person të deklaruar sipas rolit/funksionit në
              subjekt.
            </p>
            <div className="person-box">
              <div>
                <label>
                  Personi për të cilin po ngarkohen dokumentet <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Emër Mbiemër"
                  value={personName}
                  className={nameError ? 'invalid' : ''}
                  onChange={(e) => {
                    setPersonName(e.target.value);
                    setNameError(false);
                  }}
                />
                {nameError && (
                  <p className="error-text">Ju lutemi shkruani emrin e personit.</p>
                )}
              </div>
              <div>
                <label>Roli/Funksioni <span className="req">*</span></label>
                <select value={personRole} onChange={(e) => setPersonRole(e.target.value)}>
                  {PERSON_ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <button type="button" className="draft" onClick={addPerson}>
                  + Shto person tjetër
                </button>
              </div>
            </div>
            <div>
              {state.people.map((p) => (
                <PersonAccordion key={p.id} person={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4.3 Support docs */}
      <div className="support-docs">
        <div className="support-docs-title">4.3 Dokumente të tjera mbështetëse</div>
        <p className="support-docs-note">
          Nëse subjekti vlerëson se ka dokumente të tjera që mbështesin aplikimin, mund t&apos;i
          ngarkojë në këtë seksion. Këto dokumente nuk zëvendësojnë dokumentacionin e
          detyrueshëm të kërkuar në seksionet 4.1 dhe 4.2.
        </p>
        <div className="support-doc-list">
          {state.supportDocs.map((sd) => (
            <div key={sd.id} className="support-doc-item">
              <div className="support-doc-fields">
                <div>
                  <label>Përshkrimi i dokumentit</label>
                  <input
                    type="text"
                    placeholder="P.sh. dokument mbështetës shtesë"
                    value={sd.description}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_SUPPORT_DOC',
                        id: sd.id,
                        field: 'description',
                        value: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label>Dokumenti</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        dispatch({ type: 'UPDATE_SUPPORT_DOC', id: sd.id, field: 'fileName', value: f.name });
                        registerFile(`supportDoc_${sd.id}`, f);
                      }
                    }}
                  />
                  {sd.fileName && (
                    <div style={{ color: 'var(--ok)', marginTop: 4, fontWeight: 800 }}>
                      ✓ {sd.fileName}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="remove-support-doc"
                  onClick={() => dispatch({ type: 'REMOVE_SUPPORT_DOC', id: sd.id })}
                >
                  Fshi
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="draft"
          onClick={() => dispatch({ type: 'ADD_SUPPORT_DOC' })}
        >
          + Shto dokument tjetër
        </button>
      </div>

      <div className="action-row">
        <button
          type="button"
          className="nav-btn"
          onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}
        >
          Kthehu
        </button>
        <button
          type="button"
          className="nav-btn primary"
          onClick={() => dispatch({ type: 'SET_STEP', step: 4 })}
        >
          Vazhdo tek hapi tjetër
        </button>
      </div>
    </section>
  );
}
