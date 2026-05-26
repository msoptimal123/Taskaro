export type TaskType = 'task' | 'deadline' | 'rezervacija';
export type TaskStatus = 'open' | 'in_progress' | 'done';
export type ProjectStatus = 'reserved' | 'active' | 'done';

export interface Task {
  id: string;
  user_id: string;
  client_id: string | null;
  project_id: string | null;
  type: TaskType;
  title: string;
  description: string | null;
  location: string | null;
  due_date: string | null;
  due_time: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TaskStatus;
  source_transcript: string | null;
  completed_at: string | null;
  reminded: boolean;
  reminder_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  location: string | null;
  obseg: string | null;
  color: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  closed_at: string | null;
  converted_from_task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  text: string;
  source_transcript: string | null;
  created_at: string;
}

export interface Attachment {
  id: string;
  user_id: string;
  entity_type: 'task' | 'project';
  entity_id: string;
  storage_path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface ParsedVoice {
  type: TaskType | 'note';
  title: string;
  description: string | null;
  client_name: string | null;
  location: string | null;
  due_date: string | null;
  due_time: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface ParsedIntent {
  type: TaskType | 'note' | 'ponudba';
  title: string;
  description?: string | null;
  client_name?: string | null;
  location?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  ponudba_postavke?: Array<{
    naziv: string;
    enota?: string;
    kolicina?: number;
    cena_na_enoto?: number;
  }>;
}

export type PredlogStatus = 'aktiven' | 'sprejet' | 'zavrnjen' | 'zastarel';
export type PredlogKategorija =
  | 'task_complete' | 'task_reschedule' | 'task_delete'
  | 'ponudba_send_reminder' | 'ponudba_status_update'
  | 'rezervacija_release' | 'rezervacija_activate'
  | 'project_close' | 'client_add_contact'
  | 'attach_to_entity' | 'create_followup_task';

export interface Predlog {
  id: string;
  user_id: string;
  vir: 'voice' | 'system';
  ai_session_id: string | null;
  kategorija: PredlogKategorija;
  prioriteta: number;
  entity_type: string;
  entity_id: string;
  naslov: string;
  opis: string | null;
  akcija_label: string;
  akcija_payload: Record<string, unknown>;
  sekundarna_label: string | null;
  sekundarna_payload: Record<string, unknown> | null;
  status: PredlogStatus;
  poteče_at: string | null;
  obravnavan_at: string | null;
  created_at: string;
}

export type PonudbaStatus = 'osnutek' | 'pripravljena' | 'poslana' | 'sprejeta' | 'zavrnjena' | 'preklicana';

export interface PonudbaPostavka {
  id: string;
  ponudba_id: string;
  vrstni_red: number;
  naziv: string;
  opis: string | null;
  enota: string | null;
  kolicina: number;
  cena_na_enoto: number;
  skupaj: number;
  created_at: string;
}

export interface Ponudba {
  id: string;
  user_id: string;
  client_id: string;
  project_id: string | null;
  stevilka: string;
  naslov: string | null;
  opomba_zacetna: string | null;
  opomba_koncna: string | null;
  ddv_stopnja: number;
  popust_odstotek: number;
  skupaj_brez_ddv: number;
  ddv_znesek: number;
  skupaj_z_ddv: number;
  veljavna_do: string | null;
  status: PonudbaStatus;
  poslana_at: string | null;
  sprejeta_at: string | null;
  zavrnjena_at: string | null;
  pdf_path: string | null;
  pdf_generated_at: string | null;
  email_subject: string | null;
  email_body: string | null;
  email_sent_to: string | null;
  ai_session_id: string | null;
  ai_context: unknown;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  id: string;
  user_id: string;
  naziv: string | null;
  naslov_ulica: string | null;
  naslov_posta: string | null;
  drzava: string | null;
  davcna_stevilka: string | null;
  maticna_stevilka: string | null;
  telefon: string | null;
  email: string | null;
  spletna_stran: string | null;
  iban: string | null;
  bic_swift: string | null;
  banka: string | null;
  logo_path: string | null;
  privzeti_ddv: number;
  privzeta_veljavnost_dni: number;
  privzeta_opomba_zacetna: string | null;
  privzeta_opomba_koncna: string | null;
  gmail_connected_email: string | null;
  gmail_refresh_token_encrypted: string | null;
  gmail_access_token: string | null;
  gmail_token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}
