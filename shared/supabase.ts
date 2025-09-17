import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Client for browser/anonymous access
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for server-side/admin operations
export const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabase;

// Types for database operations
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          profile_image_url: string | null;
          full_name: string | null;
          phone: string | null;
          profession: string | null;
          course_type: string | null;
          stream: string | null;
          field_of_work: string | null;
          designation: string | null;
          organization: string | null;
          date_of_birth: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          profile_image_url?: string | null;
          full_name?: string | null;
          phone?: string | null;
          profession?: string | null;
          course_type?: string | null;
          stream?: string | null;
          field_of_work?: string | null;
          designation?: string | null;
          organization?: string | null;
          date_of_birth?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          profile_image_url?: string | null;
          full_name?: string | null;
          phone?: string | null;
          profession?: string | null;
          course_type?: string | null;
          stream?: string | null;
          field_of_work?: string | null;
          designation?: string | null;
          organization?: string | null;
          date_of_birth?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          day_id: number;
          completed_sections: string[];
          completed_slides: string[];
          quiz_scores: Record<string, number>;
          current_slide: number;
          is_completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_id: number;
          completed_sections?: string[];
          completed_slides?: string[];
          quiz_scores?: Record<string, number>;
          current_slide?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          day_id?: number;
          completed_sections?: string[];
          completed_slides?: string[];
          quiz_scores?: Record<string, number>;
          current_slide?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          badge_data: {
            dayId?: number;
            title: string;
            description: string;
            iconName: string;
            color: string;
          };
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_type: string;
          badge_data: {
            dayId?: number;
            title: string;
            description: string;
            iconName: string;
            color: string;
          };
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_type?: string;
          badge_data?: {
            dayId?: number;
            title: string;
            description: string;
            iconName: string;
            color: string;
          };
          earned_at?: string;
        };
      };
      user_certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          certificate_data: {
            userName: string;
            courseName: string;
            completionDate: string;
            overallScore: number;
            totalDays: number;
          };
          issued_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          certificate_data: {
            userName: string;
            courseName: string;
            completionDate: string;
            overallScore: number;
            totalDays: number;
          };
          issued_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          certificate_data?: {
            userName: string;
            courseName: string;
            completionDate: string;
            overallScore: number;
            totalDays: number;
          };
          issued_at?: string;
        };
      };
    };
  };
};

// Helper functions for database operations
export const db = {
  // User operations
  async getUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async upsertUser(userData: {
    id?: string;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    profile_image_url?: string | null;
  }) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(userId: string, userData: {
    full_name?: string | null;
    phone?: string | null;
    profession?: string | null;
    course_type?: string | null;
    stream?: string | null;
    field_of_work?: string | null;
    designation?: string | null;
    organization?: string | null;
    date_of_birth?: string | null;
  }) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Progress operations
  async getUserProgress(userId: string, dayId: number) {
    const { data, error } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('day_id', dayId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  async createUserProgress(progressData: {
    user_id: string;
    day_id: number;
    completed_sections?: string[];
    completed_slides?: string[];
    quiz_scores?: Record<string, number>;
    current_slide?: number;
    is_completed?: boolean;
  }) {
    const { data, error } = await supabaseAdmin
      .from('user_progress')
      .insert(progressData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProgress(userId: string, dayId: number, updates: {
    completed_sections?: string[];
    completed_slides?: string[];
    quiz_scores?: Record<string, number>;
    current_slide?: number;
    is_completed?: boolean;
    completed_at?: string | null;
  }) {
    const { data, error } = await supabaseAdmin
      .from('user_progress')
      .update(updates)
      .eq('user_id', userId)
      .eq('day_id', dayId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllUserProgress(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('day_id');

    if (error) throw error;
    return data || [];
  },

  // Badge operations
  async getUserBadges(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createUserBadge(badgeData: {
    user_id: string;
    badge_type: string;
    badge_data: {
      dayId?: number;
      title: string;
      description: string;
      iconName: string;
      color: string;
    };
  }) {
    const { data, error } = await supabaseAdmin
      .from('user_badges')
      .insert(badgeData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async hasBadge(userId: string, badgeType: string) {
    const { data, error } = await supabaseAdmin
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_type', badgeType)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  // Certificate operations
  async getUserCertificates(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('user_certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createUserCertificate(certificateData: {
    user_id: string;
    course_id: string;
    certificate_data: {
      userName: string;
      courseName: string;
      completionDate: string;
      overallScore: number;
      totalDays: number;
    };
  }) {
    const { data, error } = await supabaseAdmin
      .from('user_certificates')
      .insert(certificateData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async hasCertificate(userId: string, courseId: string) {
    const { data, error } = await supabaseAdmin
      .from('user_certificates')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};