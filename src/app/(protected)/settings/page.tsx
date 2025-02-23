'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { KeyIcon, PlusIcon, ClipboardIcon, TrashIcon, CheckIcon, ShieldCheckIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';

interface ApiKey {
  id: string;
  name: string;
  created_at: string;
  last_used?: string;
  prefix: string;
  status: 'active' | 'inactive';
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('access-tokens');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/auth/apikey');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch keys');
      }
      const data = await response.json();
      setApiKeys(data.api_keys || []);
    } catch (error) {
      console.error('Error in fetchApiKeys:', error);
      toast.error(error instanceof Error ? error.message : 'Error loading API keys');
    }
  };

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/auth/apikey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create key');
      }
      
      setNewKey(data.key);
      await fetchApiKeys();
      setNewKeyName('');
      setShowCreateForm(false);
      toast.success('API key created! Copy it now - it won\'t be shown again');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error creating API key');
    } finally {
      setIsCreating(false);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/auth/apikey/${keyId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to revoke key');
      }
      
      setApiKeys(keys => keys.filter(k => k.id !== keyId));
      toast.success('API key revoked successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error revoking API key');
    }
  };

  return (
    <PageContainer maxWidth="3xl">
      <PageHeader
        title="Settings"
        description="Manage your account and API keys"
      />

      <Section title="Access Tokens">
        <div className="space-y-6">
          {/* API Key Information */}
          <div className="bg-surface rounded-lg p-4 mb-8 border border-border">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium text-text-primary mb-2">About API Keys</h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• API keys grant programmatic access to your data</li>
                  <li>• Each key should be used for a specific purpose or integration</li>
                  <li>• Keys are shown only once upon creation - store them securely</li>
                  <li>• Revoke keys immediately if they are compromised</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Create New Key Form */}
          {showCreateForm ? (
            <form onSubmit={createApiKey} className="mb-8 bg-surface rounded-lg p-4 border border-border">
              <h3 className="font-medium text-text-primary mb-4">Create New API Key</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="keyName" className="block text-sm font-medium text-text-secondary mb-1">
                    Key Name
                  </label>
                  <input
                    id="keyName"
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API, Development Key"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    disabled={isCreating}
                  />
                  <p className="mt-1 text-xs text-text-secondary">
                    Choose a descriptive name to help you identify this key later
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Key'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mb-8 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create New API Key</span>
            </button>
          )}

          {/* Newly Created Key */}
          {newKey && (
            <div className="mb-8 p-4 bg-surface rounded-lg border border-warning">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircleIcon className="w-5 h-5 text-warning mt-1" />
                <div>
                  <h3 className="font-medium text-warning">Save Your API Key</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Copy this key now. For security reasons, it won't be shown again.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-background p-3 rounded-lg">
                <code className="font-mono text-sm flex-1 break-all">
                  {newKey}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newKey);
                    toast.success('API key copied to clipboard');
                  }}
                  className="p-2 hover:bg-surface rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <ClipboardIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* API Keys List */}
          <div className="space-y-4">
            <h3 className="font-medium text-text-primary">Your API Keys</h3>
            {apiKeys.length === 0 ? (
              <p className="text-text-secondary text-sm">
                You haven't created any API keys yet.
              </p>
            ) : (
              apiKeys.map(key => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <KeyIcon className="w-4 h-4 text-primary" />
                      <h4 className="font-medium text-text-primary">{key.name}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span className="font-mono">{key.prefix}•••••••</span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        Created {new Date(key.created_at).toLocaleDateString()}
                      </span>
                      {key.last_used && (
                        <span className="flex items-center gap-1">
                          <CheckIcon className="w-3 h-3" />
                          Last used {new Date(key.last_used).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => revokeApiKey(key.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Revoke API key"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Section>
    </PageContainer>
  );
} 