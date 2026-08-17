export type MissionType = "daily" | "weekly";
export type MissionDifficulty = "easy" | "medium" | "hard";

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
          created_at?: string;
        };
        Update: Partial<{
          domain: string;
          business_type: string;
          city: string | null;
          company_size: string | null;
          growth_score: number;
          growth_potential: string | null;
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
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          completed_at: string | null;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
