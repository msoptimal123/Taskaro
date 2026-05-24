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
