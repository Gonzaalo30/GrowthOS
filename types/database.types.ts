export type MissionType = "daily" | "weekly";
export type MissionDifficulty = "easy" | "medium" | "hard";
export type OpportunityRequestStatus = "pending" | "contacted" | "done";
export type DailyChestReward = "xp" | "bonus_mission";
export type BusinessPlan = "starter" | "growth" | "autopilot";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          created_at?: string;
        };
        Update: Partial<{
          name: string;
          email: string;
        }>;
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          domain: string;
          business_type: string;
          city: string | null;
          company_size: string | null;
          growth_score: number;
          growth_potential: string | null;
          xp: number;
          streak_count: number;
          longest_streak: number;
          last_activity_date: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string;
          plan: BusinessPlan;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          domain: string;
          business_type: string;
          city?: string | null;
          company_size?: string | null;
          growth_score?: number;
          growth_potential?: string | null;
          xp?: number;
          streak_count?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string;
          plan?: BusinessPlan;
          created_at?: string;
        };
        Update: Partial<{
          domain: string;
          business_type: string;
          city: string | null;
          company_size: string | null;
          growth_score: number;
          growth_potential: string | null;
          xp: number;
          streak_count: number;
          last_activity_date: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string;
          plan: BusinessPlan;
        }>;
        Relationships: [];
      };
      missions: {
        Row: {
          id: string;
          business_id: string;
          type: MissionType;
          title: string;
          description: string;
          difficulty: MissionDifficulty;
          time_estimate_minutes: number;
          xp_reward: number;
          expected_impact: string | null;
          price_cents: number | null;
          template_id: string | null;
          sequence_number: number | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          type: MissionType;
          title: string;
          description: string;
          difficulty?: MissionDifficulty;
          time_estimate_minutes: number;
          xp_reward: number;
          expected_impact?: string | null;
          price_cents?: number | null;
          template_id?: string | null;
          sequence_number?: number | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          completed_at: string | null;
        }>;
        Relationships: [];
      };
      opportunity_requests: {
        Row: {
          id: string;
          business_id: string;
          opportunity_id: string;
          title: string;
          price_cents: number;
          status: OpportunityRequestStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          opportunity_id: string;
          title: string;
          price_cents: number;
          status?: OpportunityRequestStatus;
          created_at?: string;
        };
        Update: Partial<{
          status: OpportunityRequestStatus;
        }>;
        Relationships: [];
      };
      growth_score_history: {
        Row: {
          id: string;
          business_id: string;
          score: number;
          checks: unknown;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          score: number;
          checks?: unknown;
          recorded_at?: string;
        };
        Update: Partial<{
          score: number;
        }>;
        Relationships: [];
      };
      daily_chests: {
        Row: {
          id: string;
          business_id: string;
          opened_date: string;
          reward_type: DailyChestReward;
          xp_awarded: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          opened_date: string;
          reward_type: DailyChestReward;
          xp_awarded?: number | null;
          created_at?: string;
        };
        Update: Partial<{
          reward_type: DailyChestReward;
          xp_awarded: number | null;
        }>;
        Relationships: [];
      };
      case_studies: {
        Row: {
          id: string;
          opportunity_id: string;
          business_type: string | null;
          title: string;
          what_changed: string;
          time_to_notice: string;
          why_good_practice: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          business_type?: string | null;
          title: string;
          what_changed: string;
          time_to_notice: string;
          why_good_practice: string;
          created_at?: string;
        };
        Update: Partial<{
          title: string;
          what_changed: string;
          time_to_notice: string;
          why_good_practice: string;
        }>;
        Relationships: [];
      };
      feature_flags: {
        Row: {
          key: string;
          enabled: boolean;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          enabled?: boolean;
          description?: string | null;
          updated_at?: string;
        };
        Update: Partial<{
          enabled: boolean;
          description: string | null;
        }>;
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: string;
          business_id: string | null;
          event_name: string;
          properties: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          event_name: string;
          properties?: unknown;
          created_at?: string;
        };
        Update: Partial<{ event_name: string; properties: unknown }>;
        Relationships: [];
      };
      custom_plan_requests: {
        Row: {
          id: string;
          business_id: string;
          details: string;
          contact_email: string;
          status: OpportunityRequestStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          details: string;
          contact_email: string;
          status?: OpportunityRequestStatus;
          created_at?: string;
        };
        Update: Partial<{ status: OpportunityRequestStatus }>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          business_id: string;
          message: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          message: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<{ read_at: string | null }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_business_xp: {
        Args: { p_business_id: string; p_amount: number };
        Returns: undefined;
      };
      register_business_activity: {
        Args: { p_business_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
