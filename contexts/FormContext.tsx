'use client';

import React, { createContext, useContext, useReducer, useMemo, useRef, useCallback } from 'react';
import { MAIN_DOCS, FIGURE_DOCS } from '@/lib/mockData';
import type {
  DocEntry,
  Person,
  ThirdParty,
  DeclarationThirdParty,
  SupportDoc,
  FormState,
} from '@/lib/types';

// Re-export types that step components already import from here
export type { DocEntry, Person, ThirdParty, DeclarationThirdParty, SupportDoc, FormState };

type Action =
  | { type: 'SET_FIELD'; field: keyof FormState; value: unknown }
  | { type: 'TOGGLE_FILLER'; value: string }
  | { type: 'TOGGLE_LICENCE'; value: string }
  | { type: 'TOGGLE_CULTIVATION'; value: string }
  | { type: 'SET_STEP'; step: number }
  | { type: 'ADD_PERSON'; name: string; role: string }
  | { type: 'REMOVE_PERSON'; id: number }
  | { type: 'TOGGLE_PERSON'; id: number }
  | { type: 'UPLOAD_PERSON_DOC'; personId: number; docId: number; fileName: string }
  | { type: 'ADD_THIRD_PARTY' }
  | { type: 'REMOVE_THIRD_PARTY'; id: number }
  | { type: 'UPDATE_THIRD_PARTY'; id: number; field: string; value: string }
  | { type: 'TOGGLE_THIRD_PARTY'; id: number }
  | { type: 'UPLOAD_MAIN_DOC'; docId: number; fileName: string }
  | { type: 'ADD_SUPPORT_DOC' }
  | { type: 'REMOVE_SUPPORT_DOC'; id: number }
  | { type: 'UPDATE_SUPPORT_DOC'; id: number; field: 'description' | 'fileName'; value: string }
  | { type: 'SET_DECLARATION'; index: number; value: boolean }
  | { type: 'SET_ALL_DECLARATIONS'; value: boolean }
  | { type: 'ADD_DECL_THIRD_PARTY' }
  | { type: 'REMOVE_DECL_THIRD_PARTY'; id: number }
  | { type: 'UPDATE_DECL_THIRD_PARTY'; id: number; field: string; value: string }
  | { type: 'TOGGLE_DECL_THIRD_PARTY'; id: number }
  | { type: 'SUBMIT'; applicationId: string };

function makePerson(id: number, name: string, role: string): Person {
  return {
    id,
    name,
    role,
    open: true,
    docs: FIGURE_DOCS.map((d, i) => ({ id: i, name: d[0], help: d[1], fileName: '' })),
  };
}

const initialState: FormState = {
  subjectName: '',
  nipt: '',
  phone: '',
  subjectEmail: '',
  address: '',
  applicationFiller: '',
  repFirstName: '',
  repLastName: '',
  repFatherName: '',
  repBirthDate: '',
  repBirthPlace: '',
  repResidence: '',
  repId: '',
  repEmail: '',
  repPhone: '',
  repAuthorityFileName: '',

  licenceTypes: [],
  activityDescription: '',
  unitNumber: '',
  cultivationEnv: [],
  unitsDescription: '',

  thirdPartyOption: '',
  thirdParties: [],
  nextThirdPartyId: 1,

  mainDocs: MAIN_DOCS.map((d, i) => ({ id: i, name: d[0], help: d[1], fileName: '' })),
  people: [makePerson(1, 'Personi 1', 'Administrator')],
  nextPersonId: 2,
  supportDocs: [],
  nextSupportDocId: 1,

  declarations: Array(8).fill(false),
  shpsfName: '',
  shpsfNipt: '',
  shpsfAddress: '',
  shpsfAdmin: '',
  shpsfPhone: '',
  shpsfEmail: '',
  securityObject: '',
  securityDuration: '',
  securityAgreementFileName: '',
  declarationThirdParties: [
    { id: 1, name: '', nipt: '', address: '', admin: '', phone: '', email: '', object: '', open: true },
  ],
  nextDeclThirdPartyId: 2,

  currentStep: 0,
  submitted: false,
  applicationId: '',
};

function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };

    case 'TOGGLE_FILLER': {
      const next = state.applicationFiller === action.value ? '' : action.value;
      return { ...state, applicationFiller: next };
    }

    case 'TOGGLE_LICENCE': {
      const arr = state.licenceTypes.includes(action.value)
        ? state.licenceTypes.filter((x) => x !== action.value)
        : [...state.licenceTypes, action.value];
      return { ...state, licenceTypes: arr };
    }

    case 'TOGGLE_CULTIVATION': {
      const arr = state.cultivationEnv.includes(action.value)
        ? state.cultivationEnv.filter((x) => x !== action.value)
        : [...state.cultivationEnv, action.value];
      return { ...state, cultivationEnv: arr };
    }

    case 'SET_STEP':
      return { ...state, currentStep: action.step };

    case 'ADD_PERSON':
      return {
        ...state,
        people: [...state.people, makePerson(state.nextPersonId, action.name, action.role)],
        nextPersonId: state.nextPersonId + 1,
      };

    case 'REMOVE_PERSON':
      return { ...state, people: state.people.filter((p) => p.id !== action.id) };

    case 'TOGGLE_PERSON':
      return {
        ...state,
        people: state.people.map((p) => (p.id === action.id ? { ...p, open: !p.open } : p)),
      };

    case 'UPLOAD_PERSON_DOC':
      return {
        ...state,
        people: state.people.map((p) =>
          p.id === action.personId
            ? {
                ...p,
                docs: p.docs.map((d) =>
                  d.id === action.docId ? { ...d, fileName: action.fileName } : d
                ),
              }
            : p
        ),
      };

    case 'ADD_THIRD_PARTY':
      return {
        ...state,
        thirdParties: [
          ...state.thirdParties,
          {
            id: state.nextThirdPartyId,
            name: '',
            nipt: '',
            address: '',
            admin: '',
            phone: '',
            email: '',
            serviceDesc: '',
            fileName: '',
            open: true,
          },
        ],
        nextThirdPartyId: state.nextThirdPartyId + 1,
      };

    case 'REMOVE_THIRD_PARTY':
      return { ...state, thirdParties: state.thirdParties.filter((p) => p.id !== action.id) };

    case 'UPDATE_THIRD_PARTY':
      return {
        ...state,
        thirdParties: state.thirdParties.map((p) =>
          p.id === action.id ? { ...p, [action.field]: action.value } : p
        ),
      };

    case 'TOGGLE_THIRD_PARTY':
      return {
        ...state,
        thirdParties: state.thirdParties.map((p) =>
          p.id === action.id ? { ...p, open: !p.open } : p
        ),
      };

    case 'UPLOAD_MAIN_DOC':
      return {
        ...state,
        mainDocs: state.mainDocs.map((d) =>
          d.id === action.docId ? { ...d, fileName: action.fileName } : d
        ),
      };

    case 'ADD_SUPPORT_DOC':
      return {
        ...state,
        supportDocs: [
          ...state.supportDocs,
          { id: state.nextSupportDocId, description: '', fileName: '' },
        ],
        nextSupportDocId: state.nextSupportDocId + 1,
      };

    case 'REMOVE_SUPPORT_DOC':
      return { ...state, supportDocs: state.supportDocs.filter((d) => d.id !== action.id) };

    case 'UPDATE_SUPPORT_DOC':
      return {
        ...state,
        supportDocs: state.supportDocs.map((d) =>
          d.id === action.id ? { ...d, [action.field]: action.value } : d
        ),
      };

    case 'SET_DECLARATION':
      return {
        ...state,
        declarations: state.declarations.map((d, i) => (i === action.index ? action.value : d)),
      };

    case 'SET_ALL_DECLARATIONS':
      return { ...state, declarations: state.declarations.map(() => action.value) };

    case 'ADD_DECL_THIRD_PARTY':
      return {
        ...state,
        declarationThirdParties: [
          ...state.declarationThirdParties,
          {
            id: state.nextDeclThirdPartyId,
            name: '',
            nipt: '',
            address: '',
            admin: '',
            phone: '',
            email: '',
            object: '',
            open: true,
          },
        ],
        nextDeclThirdPartyId: state.nextDeclThirdPartyId + 1,
      };

    case 'REMOVE_DECL_THIRD_PARTY':
      return {
        ...state,
        declarationThirdParties: state.declarationThirdParties.filter((p) => p.id !== action.id),
      };

    case 'UPDATE_DECL_THIRD_PARTY':
      return {
        ...state,
        declarationThirdParties: state.declarationThirdParties.map((p) =>
          p.id === action.id ? { ...p, [action.field]: action.value } : p
        ),
      };

    case 'SUBMIT':
      return { ...state, submitted: true, applicationId: action.applicationId };

    default:
      return state;
  }
}

export interface SectionInfo {
  label: string;
  step: number;
  done: boolean;
}

export interface SectionStatus {
  sections: SectionInfo[];
  doneSections: number;
  totalSections: number;
  allCore: boolean;
}

function computeStatus(state: FormState): SectionStatus {
  const isAuthorized =
    state.applicationFiller === 'Personi i autorizuar nga subjekti aplikues';

  const step1TextFields = [
    state.subjectName, state.nipt, state.phone, state.subjectEmail, state.address,
    state.repFirstName, state.repLastName, state.repFatherName, state.repBirthDate,
    state.repBirthPlace, state.repResidence, state.repId, state.repEmail, state.repPhone,
  ];
  const step1Done =
    step1TextFields.every((f) => f.trim().length > 0) &&
    state.applicationFiller !== '' &&
    (!isAuthorized || state.repAuthorityFileName !== '');

  const step2Done =
    state.licenceTypes.length > 0 &&
    state.activityDescription.trim().length > 0 &&
    state.unitNumber !== '' &&
    state.cultivationEnv.length > 0 &&
    state.unitsDescription.trim().length > 0;

  const thirdPartiesOk =
    state.thirdParties.length > 0 &&
    state.thirdParties.every(
      (tp) =>
        tp.name && tp.nipt && tp.address && tp.admin && tp.phone && tp.email && tp.serviceDesc && tp.fileName
    );
  const step3Done =
    state.thirdPartyOption === 'Vetëm aplikanti' ||
    (state.thirdPartyOption === 'Subjekte të treta' && thirdPartiesOk);

  const allMainUploaded = state.mainDocs.every((d) => d.fileName !== '');
  const allFigureUploaded =
    state.people.length > 0 && state.people.every((p) => p.docs.every((d) => d.fileName !== ''));
  const step4Done = allMainUploaded && allFigureUploaded;

  const shpsfFields = [
    state.shpsfName, state.shpsfNipt, state.shpsfAddress, state.shpsfAdmin,
    state.shpsfPhone, state.shpsfEmail, state.securityObject, state.securityDuration,
    state.securityAgreementFileName,
  ];
  const step5Done =
    state.declarations.every(Boolean) && shpsfFields.every((f) => f.trim().length > 0);

  const allCore = step1Done && step2Done && step3Done && step4Done && step5Done;

  const sections: SectionInfo[] = [
    { label: 'Të dhënat e subjektit dhe përfaqësimi', step: 0, done: step1Done },
    { label: 'Lloji i licencës dhe të dhënat e veprimtarisë', step: 1, done: step2Done },
    { label: 'Aktivitetet nga subjekte të treta', step: 2, done: step3Done },
    { label: 'Dokumentacioni', step: 3, done: step4Done },
    { label: 'Deklarime', step: 4, done: step5Done },
    { label: 'Rishikimi i aplikimit', step: 5, done: allCore },
  ];

  return {
    sections,
    doneSections: sections.filter((s) => s.done).length,
    totalSections: 6,
    allCore,
  };
}

interface FormContextValue {
  state: FormState;
  dispatch: React.Dispatch<Action>;
  status: SectionStatus;
  registerFile: (key: string, file: File) => void;
  getFileMap: () => Map<string, File>;
}

const FormContext = createContext<FormContextValue | null>(null);

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const status = useMemo(() => computeStatus(state), [state]);

  // File objects live outside the reducer — they are not serialisable and
  // don't need to trigger re-renders; a ref is the right primitive here.
  const filesRef = useRef<Map<string, File>>(new Map());
  const registerFile = useCallback((key: string, file: File) => {
    filesRef.current.set(key, file);
  }, []);
  const getFileMap = useCallback(() => filesRef.current, []);

  return (
    <FormContext.Provider value={{ state, dispatch, status, registerFile, getFileMap }}>
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error('useForm must be used inside FormProvider');
  return ctx;
}
