export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["attachment_entity"]
          filename: string
          id: string
          mime_type: string
          size_bytes: number
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["attachment_entity"]
          filename: string
          id?: string
          mime_type: string
          size_bytes: number
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["attachment_entity"]
          filename?: string
          id?: string
          mime_type?: string
          size_bytes?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          created_at: string
          id: string
          source_transcript: string | null
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          source_transcript?: string | null
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          source_transcript?: string | null
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_id: string | null
          closed_at: string | null
          color: string | null
          converted_from_task_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          obseg: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          closed_at?: string | null
          color?: string | null
          converted_from_task_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          obseg?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          closed_at?: string | null
          color?: string | null
          converted_from_task_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          obseg?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          due_time: string | null
          end_date: string | null
          id: string
          location: string | null
          project_id: string | null
          reminded: boolean
          reminder_at: string | null
          source_transcript: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          type: Database["public"]["Enums"]["task_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          project_id?: string | null
          reminded?: boolean
          reminder_at?: string | null
          source_transcript?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          type?: Database["public"]["Enums"]["task_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          project_id?: string | null
          reminded?: boolean
          reminder_at?: string | null
          source_transcript?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          type?: Database["public"]["Enums"]["task_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_sessions: {
        Row: {
          id: string
          user_id: string
          transcript: string | null
          attachments_count: number
          context: unknown
          intents: unknown
          vision_results: unknown
          follow_up_questions: unknown
          status: "processing" | "awaiting_confirmation" | "completed" | "cancelled" | "failed"
          created_entities: unknown
          correlation_id: string
          tokens_input: number
          tokens_output: number
          api_cost_cents: number
          duration_ms: number | null
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          transcript?: string | null
          attachments_count?: number
          context?: unknown
          intents?: unknown
          vision_results?: unknown
          follow_up_questions?: unknown
          status?: "processing" | "awaiting_confirmation" | "completed" | "cancelled" | "failed"
          created_entities?: unknown
          correlation_id?: string
          tokens_input?: number
          tokens_output?: number
          api_cost_cents?: number
          duration_ms?: number | null
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          transcript?: string | null
          status?: "processing" | "awaiting_confirmation" | "completed" | "cancelled" | "failed"
          created_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      predlogi: {
        Row: {
          id: string
          user_id: string
          vir: "voice" | "system"
          ai_session_id: string | null
          kategorija: string
          prioriteta: number
          entity_type: string
          entity_id: string
          naslov: string
          opis: string | null
          akcija_label: string
          akcija_payload: unknown
          sekundarna_label: string | null
          sekundarna_payload: unknown
          status: "aktiven" | "sprejet" | "zavrnjen" | "zastarel"
          poteče_at: string | null
          obravnavan_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vir: "voice" | "system"
          ai_session_id?: string | null
          kategorija: string
          prioriteta?: number
          entity_type: string
          entity_id: string
          naslov: string
          opis?: string | null
          akcija_label: string
          akcija_payload: unknown
          sekundarna_label?: string | null
          sekundarna_payload?: unknown
          status?: "aktiven" | "sprejet" | "zavrnjen" | "zastarel"
          poteče_at?: string | null
          obravnavan_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          status?: "aktiven" | "sprejet" | "zavrnjen" | "zastarel"
          obravnavan_at?: string | null
        }
        Relationships: []
      }
      ponudbe: {
        Row: {
          id: string
          user_id: string
          client_id: string
          project_id: string | null
          stevilka: string
          naslov: string | null
          opomba_zacetna: string | null
          opomba_koncna: string | null
          ddv_stopnja: number
          popust_odstotek: number
          skupaj_brez_ddv: number
          ddv_znesek: number
          skupaj_z_ddv: number
          veljavna_do: string | null
          status: "osnutek" | "pripravljena" | "poslana" | "sprejeta" | "zavrnjena" | "preklicana"
          poslana_at: string | null
          sprejeta_at: string | null
          zavrnjena_at: string | null
          pdf_path: string | null
          pdf_generated_at: string | null
          email_subject: string | null
          email_body: string | null
          email_sent_to: string | null
          ai_session_id: string | null
          ai_context: unknown
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          project_id?: string | null
          stevilka: string
          naslov?: string | null
          opomba_zacetna?: string | null
          opomba_koncna?: string | null
          ddv_stopnja?: number
          popust_odstotek?: number
          skupaj_brez_ddv?: number
          ddv_znesek?: number
          skupaj_z_ddv?: number
          veljavna_do?: string | null
          status?: "osnutek" | "pripravljena" | "poslana" | "sprejeta" | "zavrnjena" | "preklicana"
          poslana_at?: string | null
          sprejeta_at?: string | null
          zavrnjena_at?: string | null
          pdf_path?: string | null
          email_subject?: string | null
          email_body?: string | null
          email_sent_to?: string | null
          ai_session_id?: string | null
          ai_context?: unknown
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          status?: "osnutek" | "pripravljena" | "poslana" | "sprejeta" | "zavrnjena" | "preklicana"
          naslov?: string | null
          opomba_zacetna?: string | null
          opomba_koncna?: string | null
          ddv_stopnja?: number
          veljavna_do?: string | null
          skupaj_brez_ddv?: number
          ddv_znesek?: number
          skupaj_z_ddv?: number
          pdf_path?: string | null
          pdf_generated_at?: string | null
          email_subject?: string | null
          email_body?: string | null
          email_sent_to?: string | null
          poslana_at?: string | null
          sprejeta_at?: string | null
          zavrnjena_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ponudba_postavke: {
        Row: {
          id: string
          ponudba_id: string
          vrstni_red: number
          naziv: string
          opis: string | null
          enota: string | null
          kolicina: number
          cena_na_enoto: number
          skupaj: number
          created_at: string
        }
        Insert: {
          id?: string
          ponudba_id: string
          vrstni_red: number
          naziv: string
          opis?: string | null
          enota?: string | null
          kolicina: number
          cena_na_enoto: number
          skupaj: number
          created_at?: string
        }
        Update: {
          id?: string
          naziv?: string
          opis?: string | null
          enota?: string | null
          kolicina?: number
          cena_na_enoto?: number
          skupaj?: number
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          id: string
          user_id: string
          naziv: string | null
          naslov_ulica: string | null
          naslov_posta: string | null
          drzava: string | null
          davcna_stevilka: string | null
          maticna_stevilka: string | null
          telefon: string | null
          email: string | null
          spletna_stran: string | null
          iban: string | null
          bic_swift: string | null
          banka: string | null
          logo_path: string | null
          privzeti_ddv: number
          privzeta_veljavnost_dni: number
          privzeta_opomba_zacetna: string | null
          privzeta_opomba_koncna: string | null
          gmail_connected_email: string | null
          gmail_refresh_token_encrypted: string | null
          gmail_access_token: string | null
          gmail_token_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          naziv?: string | null
          naslov_ulica?: string | null
          naslov_posta?: string | null
          drzava?: string | null
          davcna_stevilka?: string | null
          maticna_stevilka?: string | null
          telefon?: string | null
          email?: string | null
          spletna_stran?: string | null
          iban?: string | null
          bic_swift?: string | null
          banka?: string | null
          logo_path?: string | null
          privzeti_ddv?: number
          privzeta_veljavnost_dni?: number
          privzeta_opomba_zacetna?: string | null
          privzeta_opomba_koncna?: string | null
          gmail_connected_email?: string | null
          gmail_refresh_token_encrypted?: string | null
          gmail_access_token?: string | null
          gmail_token_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          naziv?: string | null
          naslov_ulica?: string | null
          naslov_posta?: string | null
          davcna_stevilka?: string | null
          maticna_stevilka?: string | null
          telefon?: string | null
          email?: string | null
          spletna_stran?: string | null
          iban?: string | null
          bic_swift?: string | null
          banka?: string | null
          logo_path?: string | null
          privzeti_ddv?: number
          privzeta_veljavnost_dni?: number
          privzeta_opomba_zacetna?: string | null
          privzeta_opomba_koncna?: string | null
          gmail_connected_email?: string | null
          gmail_refresh_token_encrypted?: string | null
          gmail_access_token?: string | null
          gmail_token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
          id: string
          user_id: string
          ponudba_id: string | null
          client_id: string | null
          to_email: string
          subject: string
          body: string
          attachments_paths: string[] | null
          status: "sent" | "failed" | "bounced"
          gmail_message_id: string | null
          gmail_thread_id: string | null
          error_message: string | null
          ai_session_id: string | null
          sent_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ponudba_id?: string | null
          client_id?: string | null
          to_email: string
          subject: string
          body: string
          attachments_paths?: string[] | null
          status: "sent" | "failed" | "bounced"
          gmail_message_id?: string | null
          gmail_thread_id?: string | null
          error_message?: string | null
          ai_session_id?: string | null
          sent_at?: string
        }
        Update: {
          id?: string
          status?: "sent" | "failed" | "bounced"
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_ponudba_stevilka: {
        Args: { p_user_id: string }
        Returns: string
      }
    }
    Enums: {
      attachment_entity: "task" | "project" | "ponudba" | "ai_session"
      project_status: "reserved" | "active" | "done"
      task_status: "open" | "in_progress" | "done"
      task_type: "task" | "deadline" | "rezervacija"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attachment_entity: ["task", "project"],
      project_status: ["reserved", "active", "done"],
      task_status: ["open", "in_progress", "done"],
      task_type: ["task", "deadline", "rezervacija"],
    },
  },
} as const
