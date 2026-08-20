export type MissionType = "daily" | "weekly";
export type MissionDifficulty = "easy" | "medium" | "hard";
export type OpportunityRequestStatus = "pending" | "contacted" | "done";

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
          last_activity_date: string | null;
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
          last_activity_date?: string | null;
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
