import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface ApiKeys {
  google_api_key: string
  google_genai_use_vertexai: boolean
}

let cachedKeys: ApiKeys | null = null

export const getApiKeys = async (): Promise<ApiKeys | null> => {
  // Return cached keys if available
  if (cachedKeys) return cachedKeys

  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('google_api_key, google_genai_use_vertexai')
      .single()
    
    if (error) {
      console.warn('Could not fetch from Supabase, falling back to env vars:', error.message)
      // Fallback to environment variables for compatibility with existing agents
      cachedKeys = {
        google_api_key: process.env.REACT_APP_GOOGLE_API_KEY || '',
        google_genai_use_vertexai: process.env.REACT_APP_GOOGLE_GENAI_USE_VERTEXAI === 'TRUE'
      }
    } else {
      cachedKeys = data
    }
    
    return cachedKeys
  } catch (error) {
    console.error('Error fetching API keys:', error)
    // Fallback to environment variables
    cachedKeys = {
      google_api_key: process.env.REACT_APP_GOOGLE_API_KEY || '',
      google_genai_use_vertexai: process.env.REACT_APP_GOOGLE_GENAI_USE_VERTEXAI === 'TRUE'
    }
    return cachedKeys
  }
}

// Helper function to get Google API key for agent compatibility
export const getGoogleApiKey = async (): Promise<string> => {
  const keys = await getApiKeys()
  return keys?.google_api_key || ''
}

// Helper function to check if using Vertex AI
export const useVertexAI = async (): Promise<boolean> => {
  const keys = await getApiKeys()
  return keys?.google_genai_use_vertexai || false
}