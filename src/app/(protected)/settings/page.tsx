'use client';

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { getClientToken } from '@/lib/auth/client'

interface ApiKey {
  id: string
  name: string
  created_at: string
  last_used?: string
  prefix: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('access-tokens')
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKey, setNewKey] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      console.log('Making fetch request to /api/auth/apikey')
      const response = await fetch('/api/auth/apikey')
      console.log('Response status:', response.status)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch keys:', errorData)
        throw new Error('Failed to fetch keys')
      }
      const data = await response.json()
      console.log('Received API keys:', data)
      setApiKeys(data.api_keys || [])
    } catch (error) {
      console.error('Error in fetchApiKeys:', error)
      toast.error('Error loading API keys')
    }
  }

  const createApiKey = async () => {
    setIsCreating(true)
    try {
      console.log('Making POST request to /api/auth/apikey')
      const response = await fetch('/api/auth/apikey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: `Key ${apiKeys.length + 1}` }),
      })
      
      console.log('Response status:', response.status)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to create key:', errorData)
        throw new Error('Failed to create key')
      }
      
      const result = await response.json()
      console.log('Created API key:', result)
      setNewKey(result.key)
      await fetchApiKeys()
      toast.success('API key created! Copy it now - it won\'t be shown again')
    } catch (error) {
      console.error('Error in createApiKey:', error)
      toast.error('Error creating API key')
    } finally {
      setIsCreating(false)
    }
  }

  const revokeApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/auth/apikey/${keyId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to revoke key')
      
      setApiKeys(keys => keys.filter(k => k.id !== keyId))
      toast.success('API key revoked')
    } catch (error) {
      toast.error('Error revoking API key')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-text-primary mb-8">Settings</h1>
      
      <div className="flex gap-4 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('access-tokens')}
          className={`pb-2 px-1 ${
            activeTab === 'access-tokens'
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Access Tokens
        </button>
        {/* Add more tabs here */}
      </div>

      {activeTab === 'access-tokens' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-text-primary">API Keys</h2>
            <button
              onClick={createApiKey}
              disabled={isCreating}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create New'}
            </button>
          </div>

          {newKey && (
            <div className="mb-6 p-4 bg-surface rounded-lg border border-border">
              <div className="flex items-center gap-4">
                <span className="font-mono bg-surface-hover px-3 py-2 rounded">
                  {newKey}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newKey)
                    toast.success('Copied to clipboard!')
                  }}
                  className="text-primary hover:text-primary-hover"
                >
                  Copy
                </button>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                Store this key securely - you won't be able to see it again
              </p>
            </div>
          )}

          <div className="space-y-4">
            {apiKeys.map(key => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border"
              >
                <div>
                  <h3 className="font-medium text-text-primary">{key.name}</h3>
                  <p className="text-sm text-text-secondary">
                    Created: {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used && ` • Last used: ${new Date(key.last_used).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() => revokeApiKey(key.id)}
                  className="text-red-600 hover:text-red-700 px-3 py-1 rounded-md"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 