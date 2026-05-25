'use client';

import { useForm } from '@/contexts/FormContext';
import { STEP_NAMES } from '@/lib/mockData';
import Step1Applicant from './steps/Step1Applicant';
import Step2Licence from './steps/Step2Licence';
import Step3ThirdParty from './steps/Step3ThirdParty';
import Step4Documents from './steps/Step4Documents';
import Step5Declarations from './steps/Step5Declarations';
import Step6Review from './steps/Step6Review';

const STEPS = [
  Step1Applicant,
  Step2Licence,
  Step3ThirdParty,
  Step4Documents,
  Step5Declarations,
  Step6Review,
];

export default function ApplicationForm() {
  const { state, dispatch, status } = useForm();
  const { currentStep } = state;
  const ActiveStep = STEPS[currentStep];

  return (
    <form className="panel application" noValidate>
      <div className="panel-head">
        <h2>Formular aplikimi online</h2>
      </div>
      <div className="panel-body">
        <div className="stepper">
          {STEP_NAMES.map((name, i) => (
            <button
              key={i}
              type="button"
              className={[
                'step',
                i === currentStep ? 'active' : '',
                status.sections[i]?.done ? 'done' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => dispatch({ type: 'SET_STEP', step: i })}
            >
              <strong>
                {i + 1}. {name}
              </strong>
            </button>
          ))}
        </div>
        <ActiveStep />
      </div>
    </form>
  );
}
