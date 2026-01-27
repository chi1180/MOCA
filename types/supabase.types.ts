export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      demand_predictions: {
        Row: {
          id: string;
          predicted_at: string | null;
          prediction_data: Json;
          prediction_date: string;
        };
        Insert: {
          id?: string;
          predicted_at?: string | null;
          prediction_data: Json;
          prediction_date: string;
        };
        Update: {
          id?: string;
          predicted_at?: string | null;
          prediction_data?: Json;
          prediction_date?: string;
        };
        Relationships: [];
      };
      reservations: {
        Row: {
          assigned_route_id: string | null;
          created_at: string | null;
          dropoff_stop_id: string | null;
          id: string;
          notes: string | null;
          passenger_count: number | null;
          passenger_name: string;
          passenger_phone: string;
          pickup_stop_id: string | null;
          requested_pickup_time: string;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          assigned_route_id?: string | null;
          created_at?: string | null;
          dropoff_stop_id?: string | null;
          id?: string;
          notes?: string | null;
          passenger_count?: number | null;
          passenger_name: string;
          passenger_phone: string;
          pickup_stop_id?: string | null;
          requested_pickup_time: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          assigned_route_id?: string | null;
          created_at?: string | null;
          dropoff_stop_id?: string | null;
          id?: string;
          notes?: string | null;
          passenger_count?: number | null;
          passenger_name?: string;
          passenger_phone?: string;
          pickup_stop_id?: string | null;
          requested_pickup_time?: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reservations_assigned_route_id_fkey";
            columns: ["assigned_route_id"];
            isOneToOne: false;
            referencedRelation: "routes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reservations_dropoff_stop_id_fkey";
            columns: ["dropoff_stop_id"];
            isOneToOne: false;
            referencedRelation: "stops";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reservations_pickup_stop_id_fkey";
            columns: ["pickup_stop_id"];
            isOneToOne: false;
            referencedRelation: "stops";
            referencedColumns: ["id"];
          },
        ];
      };
      routes: {
        Row: {
          created_at: string | null;
          id: string;
          route_data: Json;
          route_date: string;
          status: string | null;
          updated_at: string | null;
          vehicle_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          route_data: Json;
          route_date: string;
          status?: string | null;
          updated_at?: string | null;
          vehicle_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          route_data?: Json;
          route_date?: string;
          status?: string | null;
          updated_at?: string | null;
          vehicle_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "routes_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      stops: {
        Row: {
          address: string | null;
          created_at: string | null;
          id: string;
          is_base_point: boolean | null;
          latitude: number;
          longitude: number;
          name: string;
          stop_type: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string | null;
          id?: string;
          is_base_point?: boolean | null;
          latitude: number;
          longitude: number;
          name: string;
          stop_type?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string | null;
          id?: string;
          is_base_point?: boolean | null;
          latitude?: number;
          longitude?: number;
          name?: string;
          stop_type?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          capacity: number;
          created_at: string | null;
          id: string;
          status: string | null;
          vehicle_number: string;
          vehicle_type: string;
        };
        Insert: {
          capacity: number;
          created_at?: string | null;
          id?: string;
          status?: string | null;
          vehicle_number: string;
          vehicle_type: string;
        };
        Update: {
          capacity?: number;
          created_at?: string | null;
          id?: string;
          status?: string | null;
          vehicle_number?: string;
          vehicle_type?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
