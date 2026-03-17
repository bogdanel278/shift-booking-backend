export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            audit_logs: {
                Row: {
                    id: string
                    user_id: string | null
                    action: string
                    table_name: string
                    record_id: string | null
                    old_data: Json | null
                    new_data: Json | null
                    ip_address: unknown | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    action: string
                    table_name: string
                    record_id?: string | null
                    old_data?: Json | null
                    new_data?: Json | null
                    ip_address?: unknown | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    action?: string
                    table_name?: string
                    record_id?: string | null
                    old_data?: Json | null
                    new_data?: Json | null
                    ip_address?: unknown | null
                    created_at?: string | null
                }
                Relationships: []
            }
            bookings: {
                Row: {
                    id: string
                    shift_id: string
                    worker_id: string
                    status: string | null
                    created_at: string | null
                    updated_at: string | null
                    confirmed_at: string | null
                    cancelled_at: string | null
                    cancellation_reason: string | null
                    notes: string | null
                    deleted_at: string | null
                }
                Insert: {
                    id?: string
                    shift_id: string
                    worker_id: string
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    confirmed_at?: string | null
                    cancelled_at?: string | null
                    cancellation_reason?: string | null
                    notes?: string | null
                    deleted_at?: string | null
                }
                Update: {
                    id?: string
                    shift_id?: string
                    worker_id?: string
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    confirmed_at?: string | null
                    cancelled_at?: string | null
                    cancellation_reason?: string | null
                    notes?: string | null
                    deleted_at?: string | null
                }
                Relationships: []
            }
            business_profiles: {
                Row: {
                    id: string
                    user_id: string
                    company_name: string
                    business_type: string | null
                    tax_id: string | null
                    description: string | null
                    website_url: string | null
                    logo_url: string | null
                    is_verified: boolean | null
                    rating: number | null
                    total_reviews: number | null
                    total_shifts_posted: number | null
                    created_at: string | null
                    updated_at: string | null
                    deleted_at: string | null
                    // Verification fields
                    v_status: 'unverified' | 'pending' | 'verified' | 'rejected' | null
                    company_number: string | null
                    vat_number: string | null
                    insurance_doc_url: string | null
                    business_address: string | null
                    trading_name: string | null
                    // Shift preferences defaults
                    default_uniform_instructions: string | null
                    default_min_experience: 'entry' | 'pro' | 'expert' | null
                    default_ppe_required: boolean | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    company_name: string
                    business_type?: string | null
                    tax_id?: string | null
                    description?: string | null
                    website_url?: string | null
                    logo_url?: string | null
                    is_verified?: boolean | null
                    rating?: number | null
                    total_reviews?: number | null
                    total_shifts_posted?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                    // Verification fields
                    v_status?: 'unverified' | 'pending' | 'verified' | 'rejected' | null
                    company_number?: string | null
                    vat_number?: string | null
                    insurance_doc_url?: string | null
                    business_address?: string | null
                    trading_name?: string | null
                    // Shift preferences defaults
                    default_uniform_instructions?: string | null
                    default_min_experience?: 'entry' | 'pro' | 'expert' | null
                    default_ppe_required?: boolean | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    company_name?: string
                    business_type?: string | null
                    tax_id?: string | null
                    description?: string | null
                    website_url?: string | null
                    logo_url?: string | null
                    is_verified?: boolean | null
                    rating?: number | null
                    total_reviews?: number | null
                    total_shifts_posted?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                    // Verification fields
                    v_status?: 'unverified' | 'pending' | 'verified' | 'rejected' | null
                    company_number?: string | null
                    vat_number?: string | null
                    insurance_doc_url?: string | null
                    business_address?: string | null
                    trading_name?: string | null
                    // Shift preferences defaults
                    default_uniform_instructions?: string | null
                    default_min_experience?: 'entry' | 'pro' | 'expert' | null
                    default_ppe_required?: boolean | null
                }
                Relationships: []
            }
            documents: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    name: string
                    file_url: string
                    file_size_bytes: number | null
                    mime_type: string | null
                    status: string | null
                    expiration_date: string | null
                    verified_by: string | null
                    verified_at: string | null
                    rejection_reason: string | null
                    created_at: string | null
                    updated_at: string | null
                    deleted_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    name: string
                    file_url: string
                    file_size_bytes?: number | null
                    mime_type?: string | null
                    status?: string | null
                    expiration_date?: string | null
                    verified_by?: string | null
                    verified_at?: string | null
                    rejection_reason?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: string
                    name?: string
                    file_url?: string
                    file_size_bytes?: number | null
                    mime_type?: string | null
                    status?: string | null
                    expiration_date?: string | null
                    verified_by?: string | null
                    verified_at?: string | null
                    rejection_reason?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                }
                Relationships: []
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    title: string
                    message: string
                    related_id: string | null
                    related_type: string | null
                    is_read: boolean | null
                    read_at: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    title: string
                    message: string
                    related_id?: string | null
                    related_type?: string | null
                    is_read?: boolean | null
                    read_at?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: string
                    title?: string
                    message?: string
                    related_id?: string | null
                    related_type?: string | null
                    is_read?: boolean | null
                    read_at?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            payouts: {
                Row: {
                    id: string
                    worker_id: string
                    timesheet_id: string | null
                    amount: number
                    currency: string | null
                    status: string | null
                    payment_method: string
                    transaction_id: string | null
                    payment_date: string | null
                    notes: string | null
                    created_at: string | null
                    updated_at: string | null
                    deleted_at: string | null
                }
                Insert: {
                    id?: string
                    worker_id: string
                    timesheet_id?: string | null
                    amount: number
                    currency?: string | null
                    status?: string | null
                    payment_method: string
                    transaction_id?: string | null
                    payment_date?: string | null
                    notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                }
                Update: {
                    id?: string
                    worker_id?: string
                    timesheet_id?: string | null
                    amount?: number
                    currency?: string | null
                    status?: string | null
                    payment_method?: string
                    transaction_id?: string | null
                    payment_date?: string | null
                    notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                }
                Relationships: []
            }
            reviews: {
                Row: {
                    id: string
                    reviewer_id: string
                    reviewee_id: string
                    shift_id: string | null
                    booking_id: string | null
                    review_type: string
                    rating: number
                    title: string | null
                    comment: string | null
                    is_public: boolean | null
                    created_at: string | null
                    updated_at: string | null
                    deleted_at: string | null
                }
                Insert: {
                    id?: string
                    reviewer_id: string
                    reviewee_id: string
                    shift_id?: string | null
                    booking_id?: string | null
                    review_type: string
                    rating: number
                    title?: string | null
                    comment?: string | null
                    is_public?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                }
                Update: {
                    id?: string
                    reviewer_id?: string
                    reviewee_id?: string
                    shift_id?: string | null
                    booking_id?: string | null
                    review_type?: string
                    rating?: number
                    title?: string | null
                    comment?: string | null
                    is_public?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                }
                Relationships: []
            }
            right_to_work_verifications: {
                Row: {
                    id: string
                    worker_user_id: string
                    verification_method: string
                    status: string | null
                    provider_name: string | null
                    provider_reference: string | null
                    share_code: string | null
                    passport_number: string | null
                    passport_country: string | null
                    passport_expiry_date: string | null
                    visa_type: string | null
                    visa_expiry_date: string | null
                    visa_reference: string | null
                    document_file_url: string | null
                    submitted_at: string | null
                    checked_at: string | null
                    checked_by_user_id: string | null
                    notes: string | null
                    raw_provider_response_json: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    worker_user_id: string
                    verification_method: string
                    status?: string | null
                    provider_name?: string | null
                    provider_reference?: string | null
                    share_code?: string | null
                    passport_number?: string | null
                    passport_country?: string | null
                    passport_expiry_date?: string | null
                    visa_type?: string | null
                    visa_expiry_date?: string | null
                    visa_reference?: string | null
                    document_file_url?: string | null
                    submitted_at?: string | null
                    checked_at?: string | null
                    checked_by_user_id?: string | null
                    notes?: string | null
                    raw_provider_response_json?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    worker_user_id?: string
                    verification_method?: string
                    status?: string | null
                    provider_name?: string | null
                    provider_reference?: string | null
                    share_code?: string | null
                    passport_number?: string | null
                    passport_country?: string | null
                    passport_expiry_date?: string | null
                    visa_type?: string | null
                    visa_expiry_date?: string | null
                    visa_reference?: string | null
                    document_file_url?: string | null
                    submitted_at?: string | null
                    checked_at?: string | null
                    checked_by_user_id?: string | null
                    notes?: string | null
                    raw_provider_response_json?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            shifts: {
                Row: {
                    id: string
                    business_id: string
                    title: string
                    location: string
                    start_time: string
                    end_time: string
                    pay_rate: number
                    created_at: string | null
                    description: string | null
                    requirements: string | null
                    max_workers: number | null
                    category: string | null
                    status: string | null
                    updated_at: string | null
                    deleted_at: string | null
                    search_vector: unknown | null
                    // Experience and uniform fields
                    min_experience_level: 'entry' | 'pro' | 'expert' | null
                    uniform_instructions: string | null
                    ppe_required: boolean | null
                }
                Insert: {
                    id?: string
                    business_id: string
                    title: string
                    location: string
                    start_time: string
                    end_time: string
                    pay_rate: number
                    created_at?: string | null
                    description?: string | null
                    requirements?: string | null
                    max_workers?: number | null
                    category?: string | null
                    status?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                    search_vector?: unknown | null
                    // Experience and uniform fields
                    min_experience_level?: 'entry' | 'pro' | 'expert' | null
                    uniform_instructions?: string | null
                    ppe_required?: boolean | null
                }
                Update: {
                    id?: string
                    business_id?: string
                    title?: string
                    location?: string
                    start_time?: string
                    end_time?: string
                    pay_rate?: number
                    created_at?: string | null
                    description?: string | null
                    requirements?: string | null
                    max_workers?: number | null
                    category?: string | null
                    status?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                    search_vector?: unknown | null
                    // Experience and uniform fields
                    min_experience_level?: 'entry' | 'pro' | 'expert' | null
                    uniform_instructions?: string | null
                    ppe_required?: boolean | null
                }
                Relationships: []
            }
            timesheets: {
                Row: {
                    id: string
                    booking_id: string
                    worker_id: string
                    shift_id: string
                    clock_in_time: string
                    clock_out_time: string | null
                    break_duration_minutes: number | null
                    total_hours: number | null
                    hourly_rate: number
                    total_amount: number | null
                    status: string | null
                    notes: string | null
                    approved_by: string | null
                    approved_at: string | null
                    rejection_reason: string | null
                    created_at: string | null
                    updated_at: string | null
                    deleted_at: string | null
                }
                Insert: {
                    id?: string
                    booking_id: string
                    worker_id: string
                    shift_id: string
                    clock_in_time: string
                    clock_out_time?: string | null
                    break_duration_minutes?: number | null
                    total_hours?: number | null
                    hourly_rate: number
                    total_amount?: number | null
                    status?: string | null
                    notes?: string | null
                    approved_by?: string | null
                    approved_at?: string | null
                    rejection_reason?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                }
                Update: {
                    id?: string
                    booking_id?: string
                    worker_id?: string
                    shift_id?: string
                    clock_in_time?: string
                    clock_out_time?: string | null
                    break_duration_minutes?: number | null
                    total_hours?: number | null
                    hourly_rate?: number
                    total_amount?: number | null
                    status?: string | null
                    notes?: string | null
                    approved_by?: string | null
                    approved_at?: string | null
                    rejection_reason?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                }
                Relationships: []
            }
            users: {
                Row: {
                    id: string
                    name: string
                    email: string
                    role: string
                    created_at: string | null
                    phone: string | null
                    password_hash: string | null
                    is_verified: boolean | null
                    is_active: boolean | null
                    updated_at: string | null
                    last_login_at: string | null
                    profile_picture_url: string | null
                    timezone: string | null
                    deleted_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    email: string
                    role: string
                    created_at?: string | null
                    phone?: string | null
                    password_hash?: string | null
                    is_verified?: boolean | null
                    is_active?: boolean | null
                    updated_at?: string | null
                    last_login_at?: string | null
                    profile_picture_url?: string | null
                    timezone?: string | null
                    deleted_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    role?: string
                    created_at?: string | null
                    phone?: string | null
                    password_hash?: string | null
                    is_verified?: boolean | null
                    is_active?: boolean | null
                    updated_at?: string | null
                    last_login_at?: string | null
                    profile_picture_url?: string | null
                    timezone?: string | null
                    deleted_at?: string | null
                }
                Relationships: []
            }
            worker_profiles: {
                Row: {
                    id: string
                    user_id: string
                    bio: string | null
                    skills: unknown | null
                    hourly_rate_min: number | null
                    hourly_rate_max: number | null
                    availability_notes: string | null
                    years_experience: number | null
                    certifications: unknown | null
                    is_verified: boolean | null
                    rating: number | null
                    total_reviews: number | null
                    total_shifts_worked: number | null
                    created_at: string | null
                    updated_at: string | null
                    deleted_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    bio?: string | null
                    skills?: unknown | null
                    hourly_rate_min?: number | null
                    hourly_rate_max?: number | null
                    availability_notes?: string | null
                    years_experience?: number | null
                    certifications?: unknown | null
                    is_verified?: boolean | null
                    rating?: number | null
                    total_reviews?: number | null
                    total_shifts_worked?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    bio?: string | null
                    skills?: unknown | null
                    hourly_rate_min?: number | null
                    hourly_rate_max?: number | null
                    availability_notes?: string | null
                    years_experience?: number | null
                    certifications?: unknown | null
                    is_verified?: boolean | null
                    rating?: number | null
                    total_reviews?: number | null
                    total_shifts_worked?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                    deleted_at?: string | null
                }
                Relationships: []
            }
        }
        Views: {}
        Functions: {}
        Enums: {}
        CompositeTypes: {}
    }
}

// Helper types for easier access
export type Shift = Database['public']['Tables']['shifts']['Row']
export type ShiftInsert = Database['public']['Tables']['shifts']['Insert']
export type ShiftUpdate = Database['public']['Tables']['shifts']['Update']
