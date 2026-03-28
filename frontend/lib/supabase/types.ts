/**
 * Supabase Database型定義
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          email: string;
          nickname: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email: string;
          nickname: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string;
          nickname?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};
