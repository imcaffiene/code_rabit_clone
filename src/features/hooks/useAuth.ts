'use client'

import { authClient } from '@/lib/auth-client'
import { useState } from 'react'

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authenticateWithGitHub = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await authClient.signIn.social({ 
        provider: 'github',
        callbackURL: '/dashboard'
      })
    } catch (err) {
      setError('Authentication failed. Please try again.')
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return { 
    authenticateWithGitHub, 
    isLoading, 
    error, 
    clearError 
  }
}
