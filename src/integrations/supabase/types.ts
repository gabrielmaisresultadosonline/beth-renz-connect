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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          active: boolean | null
          created_at: string
          display_order: number | null
          id: string
          logo_url: string | null
          name: string
          website: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          display_order?: number | null
          id?: string
          logo_url?: string | null
          name: string
          website?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          display_order?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      clipping: {
        Row: {
          content: string | null
          created_at: string
          gallery_images: string[] | null
          id: string
          image_url: string | null
          link: string | null
          pdf_url: string | null
          published_at: string | null
          source: string | null
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          link?: string | null
          pdf_url?: string | null
          published_at?: string | null
          source?: string | null
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          link?: string | null
          pdf_url?: string | null
          published_at?: string | null
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      collaborators: {
        Row: {
          active: boolean | null
          bio: string
          created_at: string
          display_order: number | null
          id: string
          name: string
          photo_url: string | null
        }
        Insert: {
          active?: boolean | null
          bio: string
          created_at?: string
          display_order?: number | null
          id?: string
          name: string
          photo_url?: string | null
        }
        Update: {
          active?: boolean | null
          bio?: string
          created_at?: string
          display_order?: number | null
          id?: string
          name?: string
          photo_url?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          read: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          read?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          read?: boolean | null
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          display_order: number | null
          id: string
          section_key: string
          section_label: string
          updated_at: string
          visible: boolean | null
        }
        Insert: {
          display_order?: number | null
          id?: string
          section_key: string
          section_label: string
          updated_at?: string
          visible?: boolean | null
        }
        Update: {
          display_order?: number | null
          id?: string
          section_key?: string
          section_label?: string
          updated_at?: string
          visible?: boolean | null
        }
        Relationships: []
      }
      homepage_slides: {
        Row: {
          active: boolean | null
          created_at: string
          display_order: number | null
          id: string
          image_position: string | null
          image_url: string
          link: string | null
          title: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_position?: string | null
          image_url: string
          link?: string | null
          title?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_position?: string | null
          image_url?: string
          link?: string | null
          title?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          active: boolean | null
          created_at: string
          display_order: number | null
          id: string
          logo_url: string | null
          name: string
          website: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          display_order?: number | null
          id?: string
          logo_url?: string | null
          name: string
          website?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          display_order?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      press_releases: {
        Row: {
          content: string
          created_at: string
          display_order: number | null
          id: string
          image_position: string | null
          image_url: string | null
          pinned: boolean | null
          published: boolean | null
          published_at: string | null
          show_date: boolean | null
          slug: string | null
          summary: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_position?: string | null
          image_url?: string | null
          pinned?: boolean | null
          published?: boolean | null
          published_at?: string | null
          show_date?: boolean | null
          slug?: string | null
          summary?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_position?: string | null
          image_url?: string | null
          pinned?: boolean | null
          published?: boolean | null
          published_at?: string | null
          show_date?: boolean | null
          slug?: string | null
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_admin: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_admin?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sent_emails: {
        Row: {
          attachments: Json | null
          bcc_addresses: string[] | null
          body_html: string
          cc_addresses: string[] | null
          id: string
          sent_at: string
          sent_by: string | null
          subject: string
          to_addresses: string[]
        }
        Insert: {
          attachments?: Json | null
          bcc_addresses?: string[] | null
          body_html: string
          cc_addresses?: string[] | null
          id?: string
          sent_at?: string
          sent_by?: string | null
          subject: string
          to_addresses: string[]
        }
        Update: {
          attachments?: Json | null
          bcc_addresses?: string[] | null
          body_html?: string
          cc_addresses?: string[] | null
          id?: string
          sent_at?: string
          sent_by?: string | null
          subject?: string
          to_addresses?: string[]
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean | null
          created_at: string
          description: string
          display_order: number | null
          features: string[] | null
          how_we_do: string | null
          icon: string | null
          id: string
          image_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description: string
          display_order?: number | null
          features?: string[] | null
          how_we_do?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string
          display_order?: number | null
          features?: string[] | null
          how_we_do?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          section: string
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          section: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          section?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          active: boolean | null
          bio: string
          created_at: string
          display_order: number | null
          id: string
          name: string
          photo_url: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          bio: string
          created_at?: string
          display_order?: number | null
          id?: string
          name: string
          photo_url?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          bio?: string
          created_at?: string
          display_order?: number | null
          id?: string
          name?: string
          photo_url?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tips: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          published: boolean | null
          slug: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean | null
          slug?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean | null
          slug?: string | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_first_admin: { Args: { p_email: string }; Returns: undefined }
      generate_slug: { Args: { title: string }; Returns: string }
      is_current_user_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
