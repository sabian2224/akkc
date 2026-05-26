export interface DocEntry {
  id: number;
  name: string;
  help: string;
  fileName: string;
}

export interface Person {
  id: number;
  name: string;
  role: string;
  open: boolean;
  docs: DocEntry[];
}

export interface ThirdParty {
  id: number;
  name: string;
  nipt: string;
  address: string;
  admin: string;
  phone: string;
  email: string;
  serviceDesc: string;
  fileName: string;
  open: boolean;
}

export interface DeclarationThirdParty {
  id: number;
  name: string;
  nipt: string;
  address: string;
  admin: string;
  phone: string;
  email: string;
  object: string;
  open: boolean;
}

export interface SupportDoc {
  id: number;
  description: string;
  fileName: string;
}

export interface FormState {
  subjectName: string;
  nipt: string;
  phone: string;
  subjectEmail: string;
  address: string;
  applicationFiller: string;
  repFirstName: string;
  repLastName: string;
  repFatherName: string;
  repBirthDate: string;
  repBirthPlace: string;
  repResidence: string;
  repId: string;
  repEmail: string;
  repPhone: string;
  repAuthorityFileName: string;

  licenceTypes: string[];
  activityDescription: string;
  unitNumber: string;
  cultivationEnv: string[];
  unitsDescription: string;

  thirdPartyOption: string;
  thirdParties: ThirdParty[];
  nextThirdPartyId: number;

  mainDocs: DocEntry[];
  people: Person[];
  nextPersonId: number;
  supportDocs: SupportDoc[];
  nextSupportDocId: number;

  declarations: boolean[];
  shpsfName: string;
  shpsfNipt: string;
  shpsfAddress: string;
  shpsfAdmin: string;
  shpsfPhone: string;
  shpsfEmail: string;
  securityObject: string;
  securityDuration: string;
  securityAgreementFileName: string;
  declarationThirdParties: DeclarationThirdParty[];
  nextDeclThirdPartyId: number;

  currentStep: number;
  submitted: boolean;
  applicationId: string;
}

export interface FileInfo {
  path: string;
  label: string;
  person?: string;
}
