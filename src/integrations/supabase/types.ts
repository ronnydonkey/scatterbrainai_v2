export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      content_performance: {
        Row: {
          click_through_rate: number | null
          comments: number | null
          content_suggestion_id: string | null
          created_at: string
          engagement_rate: number | null
          id: string
          last_updated: string | null
          likes: number | null
          organization_id: string
          platform: string
          platform_content_id: string | null
          published_at: string | null
          revenue_attributed: number | null
          shares: number | null
          views: number | null
        }
        Insert: {
          click_through_rate?: number | null
          comments?: number | null
          content_suggestion_id?: string | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          last_updated?: string | null
          likes?: number | null
          organization_id: string
          platform: string
          platform_content_id?: string | null
          published_at?: string | null
          revenue_attributed?: number | null
          shares?: number | null
          views?: number | null
        }
        Update: {
          click_through_rate?: number | null
          comments?: number | null
          content_suggestion_id?: string | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          last_updated?: string | null
          likes?: number | null
          organization_id?: string
          platform?: string
          platform_content_id?: string | null
          published_at?: string | null
          revenue_attributed?: number | null
          shares?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_performance_content_suggestion_id_fkey"
            columns: ["content_suggestion_id"]
            isOneToOne: false
            referencedRelation: "content_suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_performance_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      content_schedule: {
        Row: {
          content_suggestion_id: string | null
          created_at: string
          error_message: string | null
          id: string
          is_recurring: boolean | null
          organization_id: string
          platform: string
          platform_content: string | null
          platform_settings: Json | null
          published_at: string | null
          recurrence_pattern: Json | null
          scheduled_for: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_suggestion_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          is_recurring?: boolean | null
          organization_id: string
          platform: string
          platform_content?: string | null
          platform_settings?: Json | null
          published_at?: string | null
          recurrence_pattern?: Json | null
          scheduled_for: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_suggestion_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          is_recurring?: boolean | null
          organization_id?: string
          platform?: string
          platform_content?: string | null
          platform_settings?: Json | null
          published_at?: string | null
          recurrence_pattern?: Json | null
          scheduled_for?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_schedule_content_suggestion_id_fkey"
            columns: ["content_suggestion_id"]
            isOneToOne: false
            referencedRelation: "content_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_suggestions: {
        Row: {
          ai_generated_content: string | null
          content_outline: Json | null
          content_type: string
          created_at: string
          description: string | null
          engagement_prediction: number | null
          estimated_word_count: number | null
          id: string
          is_used: boolean | null
          organization_id: string
          performance_data: Json | null
          suggested_tone: string | null
          target_keywords: string[] | null
          thought_id: string | null
          title: string
          trending_topic_id: string | null
          updated_at: string
          used_at: string | null
          user_id: string
          voice_authenticity_score: number | null
        }
        Insert: {
          ai_generated_content?: string | null
          content_outline?: Json | null
          content_type: string
          created_at?: string
          description?: string | null
          engagement_prediction?: number | null
          estimated_word_count?: number | null
          id?: string
          is_used?: boolean | null
          organization_id: string
          performance_data?: Json | null
          suggested_tone?: string | null
          target_keywords?: string[] | null
          thought_id?: string | null
          title: string
          trending_topic_id?: string | null
          updated_at?: string
          used_at?: string | null
          user_id: string
          voice_authenticity_score?: number | null
        }
        Update: {
          ai_generated_content?: string | null
          content_outline?: Json | null
          content_type?: string
          created_at?: string
          description?: string | null
          engagement_prediction?: number | null
          estimated_word_count?: number | null
          id?: string
          is_used?: boolean | null
          organization_id?: string
          performance_data?: Json | null
          suggested_tone?: string | null
          target_keywords?: string[] | null
          thought_id?: string | null
          title?: string
          trending_topic_id?: string | null
          updated_at?: string
          used_at?: string | null
          user_id?: string
          voice_authenticity_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_suggestions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_suggestions_thought_id_fkey"
            columns: ["thought_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_suggestions_trending_topic_id_fkey"
            columns: ["trending_topic_id"]
            isOneToOne: false
            referencedRelation: "trending_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      niche_templates: {
        Row: {
          content_types: Json
          created_at: string
          data_sources: Json
          default_keywords: Json
          description: string | null
          id: string
          monetization_options: Json
          name: string
          niche: Database["public"]["Enums"]["niche_type"]
          sample_voice_characteristics: Json | null
        }
        Insert: {
          content_types?: Json
          created_at?: string
          data_sources?: Json
          default_keywords?: Json
          description?: string | null
          id?: string
          monetization_options?: Json
          name: string
          niche: Database["public"]["Enums"]["niche_type"]
          sample_voice_characteristics?: Json | null
        }
        Update: {
          content_types?: Json
          created_at?: string
          data_sources?: Json
          default_keywords?: Json
          description?: string | null
          id?: string
          monetization_options?: Json
          name?: string
          niche?: Database["public"]["Enums"]["niche_type"]
          sample_voice_characteristics?: Json | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          branding_config: Json | null
          created_at: string
          domain: string | null
          id: string
          is_active: boolean | null
          max_content_generations: number | null
          max_users: number | null
          name: string
          niche: Database["public"]["Enums"]["niche_type"]
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          branding_config?: Json | null
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean | null
          max_content_generations?: number | null
          max_users?: number | null
          name: string
          niche: Database["public"]["Enums"]["niche_type"]
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          branding_config?: Json | null
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean | null
          max_content_generations?: number | null
          max_users?: number | null
          name?: string
          niche?: Database["public"]["Enums"]["niche_type"]
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          automations_used: number | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean | null
          max_automations: number | null
          organization_id: string | null
          preferences: Json | null
          reddit_username: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
          voice_profile_config: Json | null
        }
        Insert: {
          automations_used?: number | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          max_automations?: number | null
          organization_id?: string | null
          preferences?: Json | null
          reddit_username?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
          voice_profile_config?: Json | null
        }
        Update: {
          automations_used?: number | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          max_automations?: number | null
          organization_id?: string | null
          preferences?: Json | null
          reddit_username?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
          voice_profile_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      thoughts: {
        Row: {
          attachments: Json | null
          content: string
          context: string | null
          created_at: string
          id: string
          is_processed: boolean | null
          mood: string | null
          organization_id: string
          processed_at: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          context?: string | null
          created_at?: string
          id?: string
          is_processed?: boolean | null
          mood?: string | null
          organization_id: string
          processed_at?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          context?: string | null
          created_at?: string
          id?: string
          is_processed?: boolean | null
          mood?: string | null
          organization_id?: string
          processed_at?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trending_topics: {
        Row: {
          created_at: string
          description: string | null
          engagement_metrics: Json | null
          expires_at: string | null
          id: string
          is_validated: boolean | null
          keywords: string[] | null
          organization_id: string
          score: number
          sentiment: number | null
          source: string
          source_data: Json | null
          source_url: string | null
          title: string | null
          topic: string
          validation_data: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          engagement_metrics?: Json | null
          expires_at?: string | null
          id?: string
          is_validated?: boolean | null
          keywords?: string[] | null
          organization_id: string
          score?: number
          sentiment?: number | null
          source: string
          source_data?: Json | null
          source_url?: string | null
          title?: string | null
          topic: string
          validation_data?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          engagement_metrics?: Json | null
          expires_at?: string | null
          id?: string
          is_validated?: boolean | null
          keywords?: string[] | null
          organization_id?: string
          score?: number
          sentiment?: number | null
          source?: string
          source_data?: Json | null
          source_url?: string | null
          title?: string | null
          topic?: string
          validation_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "trending_topics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_trends: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      niche_type:
        | "astrology"
        | "fitness"
        | "productivity"
        | "business"
        | "wellness"
        | "finance"
        | "technology"
        | "lifestyle"
      user_role: "owner" | "admin" | "creator" | "viewer"
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
      niche_type: [
        "astrology",
        "fitness",
        "productivity",
        "business",
        "wellness",
        "finance",
        "technology",
        "lifestyle",
      ],
      user_role: ["owner", "admin", "creator", "viewer"],
    },
  },
} as const
