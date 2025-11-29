export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          template_structure: Json;
          seo_defaults: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          template_structure: Json;
          seo_defaults?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          template_structure?: Json;
          seo_defaults?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          featured_image: string | null;
          category_id: string | null;
          status: 'draft' | 'published' | 'archived';
          post_type: 'ai_assisted' | 'guest_post' | 'manual';
          seo_score: number;
          view_count: number;
          is_featured: boolean;
          author_name: string | null;
          author_email: string | null;
          original_source: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          featured_image?: string | null;
          category_id?: string | null;
          status?: 'draft' | 'published' | 'archived';
          post_type?: 'ai_assisted' | 'guest_post' | 'manual';
          seo_score?: number;
          view_count?: number;
          is_featured?: boolean;
          author_name?: string | null;
          author_email?: string | null;
          original_source?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          featured_image?: string | null;
          category_id?: string | null;
          status?: 'draft' | 'published' | 'archived';
          post_type?: 'ai_assisted' | 'guest_post' | 'manual';
          seo_score?: number;
          view_count?: number;
          is_featured?: boolean;
          author_name?: string | null;
          author_email?: string | null;
          original_source?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      seo_metadata: {
        Row: {
          id: string;
          post_id: string;
          meta_title: string | null;
          meta_description: string | null;
          keywords: string[] | null;
          schema_markup: Json | null;
          canonical_url: string | null;
          og_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          meta_title?: string | null;
          meta_description?: string | null;
          keywords?: string[] | null;
          schema_markup?: Json | null;
          canonical_url?: string | null;
          og_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          keywords?: string[] | null;
          schema_markup?: Json | null;
          canonical_url?: string | null;
          og_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      guest_submissions: {
        Row: {
          id: string;
          agency_name: string | null;
          contact_email: string;
          title: string;
          content: string;
          target_keywords: string[] | null;
          backlinks: Json | null;
          status: 'pending' | 'approved' | 'rejected' | 'published';
          payment_status: 'unpaid' | 'paid' | 'refunded';
          amount: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_name?: string | null;
          contact_email: string;
          title: string;
          content: string;
          target_keywords?: string[] | null;
          backlinks?: Json | null;
          status?: 'pending' | 'approved' | 'rejected' | 'published';
          payment_status?: 'unpaid' | 'paid' | 'refunded';
          amount?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_name?: string | null;
          contact_email?: string;
          title?: string;
          content?: string;
          target_keywords?: string[] | null;
          backlinks?: Json | null;
          status?: 'pending' | 'approved' | 'rejected' | 'published';
          payment_status?: 'unpaid' | 'paid' | 'refunded';
          amount?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      archive_imports: {
        Row: {
          id: string;
          archive_url: string;
          original_url: string;
          import_status: 'pending' | 'processing' | 'completed' | 'failed';
          post_id: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          archive_url: string;
          original_url: string;
          import_status?: 'pending' | 'processing' | 'completed' | 'failed';
          post_id?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          archive_url?: string;
          original_url?: string;
          import_status?: 'pending' | 'processing' | 'completed' | 'failed';
          post_id?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
      };
      agencies: {
        Row: {
          id: string;
          name: string;
          email: string;
          contact_person: string | null;
          website: string | null;
          status: 'active' | 'inactive' | 'blacklisted';
          total_posts: number;
          last_contact: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          contact_person?: string | null;
          website?: string | null;
          status?: 'active' | 'inactive' | 'blacklisted';
          total_posts?: number;
          last_contact?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          contact_person?: string | null;
          website?: string | null;
          status?: 'active' | 'inactive' | 'blacklisted';
          total_posts?: number;
          last_contact?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Helper types
export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

export type Category = Database['public']['Tables']['categories']['Row'];
export type SeoMetadata = Database['public']['Tables']['seo_metadata']['Row'];
export type GuestSubmission = Database['public']['Tables']['guest_submissions']['Row'];
export type ArchiveImport = Database['public']['Tables']['archive_imports']['Row'];
export type Agency = Database['public']['Tables']['agencies']['Row'];

// Template structure types
export interface TemplateSection {
  type: 'intro' | 'section' | 'flexible';
  title?: string | null;
  word_count?: string;
  requirements?: string[];
  min_sections?: number;
  max_sections?: number;
}

export interface TemplateStructure {
  sections: TemplateSection[];
  title_template: string;
  slug_template: string;
  nlp_terms: string[];
}

export interface SeoDefaults {
  meta_title_template: string;
  meta_description_template: string;
  schema_type: string[];
}

// AI Response types
export interface AIFormattedContent {
  title: string;
  meta_title: string;
  meta_description: string;
  slug: string;
  content: string;
  excerpt: string;
  keywords: string[];
  featured_image_suggestion: string;
  schema_markup: object;
  seo_score: number;
  seo_suggestions: string[];
}
