'use client';

import { useState } from 'react';
import { useForm } from '@/contexts/FormContext';

export default function Sidebar() {
  const { state, dispatch, status } = useForm();
  const [missingOpen, setMissingOpen] = useState(false);
  const pct = Math.round((status.doneSections / status.totalSections) * 100);

  return (
    <aside className="side">
      <div className="panel side-progress">
        <div className="panel-head">
          <h2>Progresi i aplikimit</h2>
        </div>
        <div className="panel-body">
          <div className="progress-big">
            <span>{status.doneSections}</span>/<span>{status.totalSections}</span>
          </div>
          <div className="bar">
            <span style={{ width: `${pct}%` }} />
          </div>
          <button
            className="submit"
            disabled={!status.allCore}
            onClick={() => dispatch({ type: 'SET_STEP', step: 5 })}
          >
            Dërgo aplikimin
          </button>
          <p className="side-note">
            {status.allCore
              ? 'Aplikimi është gati për dërgim.'
              : 'Plotësoni seksionet e aplikimit për të vazhduar.'}
          </p>

          <div className="missing-dropdown">
            <button
              className="missing-toggle"
              onClick={() => setMissingOpen((o) => !o)}
            >
              Seksionet e paplotësuara ▾
            </button>
            {missingOpen && (
              <div className="missing-menu">
                {status.sections.every((s) => s.done) ? (
                  <button style={{ borderColor: '#c8e6c9', background: '#f1f8f1', color: 'var(--ok)' }}>
                    Të gjitha seksionet janë plotësuar
                  </button>
                ) : (
                  status.sections
                    .filter((s) => !s.done)
                    .map((s) => (
                      <button
                        key={s.step}
                        onClick={() => {
                          dispatch({ type: 'SET_STEP', step: s.step });
                          setMissingOpen(false);
                        }}
                      >
                        {s.label}
                      </button>
                    ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel download-panel">
        <div className="panel-head">
          <h2>Dokumente për aplikimin</h2>
        </div>
        <div className="panel-body">
          <p className="download-intro">Konsultoni dokumentet shoqëruese të procedurës.</p>
          <a className="download-link" href="#">
            Paketa e aplikimit
          </a>
          <a className="download-link" href="#">
            Manuali i procedurave për pajisjen me licencë
          </a>
          <a className="download-link" href="#">
            Metodologjia e vlerësimit
          </a>
        </div>
      </div>
    </aside>
  );
}
