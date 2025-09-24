// Database entity types matching the new schema
// These interfaces represent the exact database structure

export interface DatabaseUser {
  id: string;
  email: string;
  fullname?: string;
  phone?: string;
  profession?: 'student' | 'working';
  organization?: string;
  date_of_birth?: string;
  profile_locked?: boolean;
  is_profile_complete?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserProgress {
  id: string;
  user_id: string;
  day_id: number;
  current_slide: number;
  completed_sections: string[];
  completed_slides: string[];
  quiz_scores: Record<string, number>;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_description?: string;
  badge_icon?: string;
  earned_at: string;
  created_at: string;
}

export interface DatabaseUserCertificate {
  id: string;
  user_id: string;
  certificate_id: string;
  certificate_name: string;
  issued_at: string;
  certificate_url?: string;
  created_at: string;
}

export interface DatabaseSession {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
}

// API request/response types
export interface CreateUserRequest {
  email: string;
  fullname?: string;
  phone?: string;
  profession?: 'student' | 'working';
  organization?: string;
  date_of_birth?: string;
}

export interface UpdateUserRequest {
  fullname?: string;
  phone?: string;
  profession?: 'student' | 'working';
  organization?: string;
  date_of_birth?: string;
}

export interface CreateProgressRequest {
  user_id: string;
  day_id: number;
  current_slide?: number;
  completed_sections?: string[];
  completed_slides?: string[];
  quiz_scores?: Record<string, number>;
  is_completed?: boolean;
}

export interface UpdateProgressRequest {
  current_slide?: number;
  completed_sections?: string[];
  completed_slides?: string[];
  quiz_scores?: Record<string, number>;
  is_completed?: boolean;
}

export interface CreateBadgeRequest {
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_description?: string;
  badge_icon?: string;
}

// Type guards for validation
export function isDatabaseUser(obj: any): obj is DatabaseUser {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
}

export function isDatabaseUserProgress(obj: any): obj is DatabaseUserProgress {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.day_id === 'number' &&
    typeof obj.current_slide === 'number' &&
    Array.isArray(obj.completed_sections) &&
    Array.isArray(obj.completed_slides) &&
    typeof obj.quiz_scores === 'object' &&
    typeof obj.is_completed === 'boolean' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
}

export function isDatabaseUserBadge(obj: any): obj is DatabaseUserBadge {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.badge_id === 'string' &&
    typeof obj.badge_name === 'string' &&
    typeof obj.earned_at === 'string' &&
    typeof obj.created_at === 'string'
  );
}

// Utility functions for data transformation
export function transformDatabaseUserToApi(user: DatabaseUser) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullname,
    phone: user.phone,
    profession: user.profession,
    organization: user.organization,
    dateOfBirth: user.date_of_birth,
    profileLocked: user.profile_locked,
    isProfileComplete: user.is_profile_complete,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export function transformApiToDatabaseUser(user: Partial<CreateUserRequest> & { id?: string }) {
  return {
    id: user.id,
    email: user.email,
    fullname: user.fullName || user.fullname,
    phone: user.phone,
    profession: user.profession,
    organization: user.organization,
    date_of_birth: user.dateOfBirth || user.date_of_birth,
  };
}

export function transformDatabaseProgressToApi(progress: DatabaseUserProgress) {
  return {
    id: progress.id,
    userId: progress.user_id,
    dayId: progress.day_id,
    currentSlide: progress.current_slide,
    completedSections: progress.completed_sections,
    completedSlides: progress.completed_slides,
    quizScores: progress.quiz_scores,
    isCompleted: progress.is_completed,
    completedAt: progress.completed_at,
    createdAt: progress.created_at,
    updatedAt: progress.updated_at,
  };
}

export function transformApiToDatabaseProgress(progress: Partial<CreateProgressRequest>) {
  return {
    user_id: progress.user_id,
    day_id: progress.day_id,
    current_slide: progress.current_slide,
    completed_sections: progress.completed_sections,
    completed_slides: progress.completed_slides,
    quiz_scores: progress.quiz_scores,
    is_completed: progress.is_completed,
  };
}

// Error types
export interface DatabaseError {
  message: string;
  code: string;
  details?: any;
  hint?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: string;
  code?: string;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}