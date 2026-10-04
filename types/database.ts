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
      profiles: {
        Row: {
          id: string
          role: 'customer' | 'business_owner'
          first_name: string | null
          last_name: string | null
          /** GENERATED STORED column: TRIM(first_name || ' ' || last_name) */
          full_name: string | null
          /** Denormalised copy of auth.users.email, auto-filled by trigger */
          email: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'customer' | 'business_owner'
          first_name?: string | null
          last_name?: string | null
          // full_name is GENERATED — do not insert
          email?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'customer' | 'business_owner'
          first_name?: string | null
          last_name?: string | null
          // full_name is GENERATED — do not update directly
          email?: string | null
          avatar_url?: string | null
          phone?: string | null
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          logo_url?: string | null
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
        }
      }
      products: {
        Row: {
          id: string
          business_id: string
          category_id: string | null
          name: string
          description: string | null
          brand: string | null
          price: number
          original_price: number | null
          condition: 'new_with_tags' | 'like_new' | 'good' | 'fair'
          gender: string | null
          sizes: string[] | null
          colors: string[] | null
          stock_quantity: number
          sku: string | null
          status: 'draft' | 'published' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          category_id?: string | null
          name: string
          description?: string | null
          brand?: string | null
          price: number
          original_price?: number | null
          condition: 'new_with_tags' | 'like_new' | 'good' | 'fair'
          gender?: string | null
          sizes?: string[] | null
          colors?: string[] | null
          stock_quantity?: number
          sku?: string | null
          status?: 'draft' | 'published' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          name?: string
          description?: string | null
          brand?: string | null
          price?: number
          original_price?: number | null
          condition?: 'new_with_tags' | 'like_new' | 'good' | 'fair'
          gender?: string | null
          sizes?: string[] | null
          colors?: string[] | null
          stock_quantity?: number
          sku?: string | null
          status?: 'draft' | 'published' | 'archived'
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          customer_id: string
          status: 'pending' | 'approved' | 'rejected'
          clothing_type: string
          condition: 'new_with_tags' | 'like_new' | 'good' | 'fair'
          description: string | null
          image_urls: string[] | null
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          reward_points: number | null
          rejection_reason: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          status?: 'pending' | 'approved' | 'rejected'
          clothing_type: string
          condition: 'new_with_tags' | 'like_new' | 'good' | 'fair'
          description?: string | null
          image_urls?: string[] | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reward_points?: number | null
          rejection_reason?: string | null
        }
        Update: {
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_at?: string | null
          reviewed_by?: string | null
          reward_points?: number | null
          rejection_reason?: string | null
        }
      }
      reward_transactions: {
        Row: {
          id: string
          customer_id: string
          donation_id: string | null
          type: 'earned' | 'redeemed'
          points: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          donation_id?: string | null
          type: 'earned' | 'redeemed'
          points: number
          description?: string | null
          created_at?: string
        }
        Update: {
          description?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string | null
          business_id: string | null
          total_amount: number
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          shipping_address_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          business_id?: string | null
          total_amount: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          shipping_address_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          shipping_address_id?: string | null
          updated_at?: string
        }
      }
    }
  }
}
