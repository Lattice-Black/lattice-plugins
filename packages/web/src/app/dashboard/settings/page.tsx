'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

interface ApiKeyInfo {
  id: string;
  name: string | null;
  createdAt: string;
  lastUsed: string | null;
  hasKey: boolean;
  message?: string;
}

interface RegenerateResponse {
  apiKey: string;
  maskedKey: string;
  id: string;
  name: string | null;
  createdAt: string;
  message: string;
}

export default function SettingsPage() {
  const [apiKeyInfo, setApiKeyInfo] = useState<ApiKeyInfo | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const supabase = createClient();

  // Fetch current API key info
  useEffect(() => {
    const fetchApiKeyInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError('Not authenticated');
          setIsLoading(false);
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
        const response = await fetch(`${apiUrl}/api-keys`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json() as ApiKeyInfo;
          setApiKeyInfo(data);
        } else if (response.status === 404) {
          // No API key exists yet
          setApiKeyInfo({
            id: '',
            name: null,
            createdAt: '',
            lastUsed: null,
            hasKey: false,
            message: 'No API key found. Please generate one.',
          });
        } else {
          const errorData = await response.json() as { message?: string };
          setError(errorData.message || 'Failed to fetch API key info');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch API key info');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchApiKeyInfo();
  }, [supabase]);

  const handleRegenerateConfirm = async () => {
    try {
      setIsRegenerating(true);
      setError(null);
      setShowConfirmModal(false);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiUrl}/api-keys/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || 'Failed to regenerate API key');
      }

      const data = await response.json() as RegenerateResponse;

      // Set the new API key to display it once
      setNewApiKey(data.apiKey);

      // Update the info
      setApiKeyInfo({
        id: data.id,
        name: data.name,
        createdAt: data.createdAt,
        lastUsed: null,
        hasKey: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate API key');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyKey = async () => {
    if (newApiKey) {
      await navigator.clipboard.writeText(newApiKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleCloseNewKey = () => {
    setNewApiKey(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-800 pb-8">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Settings
        </h1>
        <p className="text-gray-500 font-mono text-sm">
          Manage your API keys and account settings
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border border-red-900 bg-red-950/20 p-4">
          <p className="font-mono text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* New API Key Display (one-time) */}
      {newApiKey && (
        <div className="border border-green-900 bg-green-950/20 p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-mono text-sm uppercase tracking-wider text-green-400 mb-2">
                New API Key Generated
              </h3>
              <p className="font-mono text-xs text-gray-400 mb-4">
                Copy this key now - you won&apos;t be able to see it again!
              </p>
            </div>
            <button
              onClick={handleCloseNewKey}
              className="text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 border border-gray-800 bg-black p-3 font-mono text-sm text-white break-all">
              {newApiKey}
            </div>
            <Button
              onClick={() => void handleCopyKey()}
              variant="primary"
              size="md"
            >
              {copySuccess ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      )}

      {/* API Key Section */}
      <div className="border border-gray-800 bg-black/50">
        <div className="border-b border-gray-800 p-6">
          <h2 className="font-mono text-lg uppercase tracking-wider text-white">
            API Key
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="font-mono text-sm text-gray-500">Loading...</p>
            </div>
          ) : apiKeyInfo?.hasKey ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-gray-500 block mb-2">
                    Current API Key
                  </label>
                  <div className="border border-gray-800 bg-black p-3 font-mono text-sm text-gray-400">
                    ltc_****...****
                  </div>
                  <p className="font-mono text-xs text-gray-600 mt-2">
                    API keys are hashed and cannot be retrieved. Generate a new one to get a visible key.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-gray-500 block mb-2">
                      Created
                    </label>
                    <p className="font-mono text-sm text-white">
                      {formatDate(apiKeyInfo.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-gray-500 block mb-2">
                      Last Used
                    </label>
                    <p className="font-mono text-sm text-white">
                      {formatDate(apiKeyInfo.lastUsed || '')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => setShowConfirmModal(true)}
                  variant="ghost"
                  size="md"
                  isLoading={isRegenerating}
                >
                  Regenerate API Key
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <p className="font-mono text-sm text-gray-500">
                No API key found. Generate one to get started.
              </p>
              <Button
                onClick={() => setShowConfirmModal(true)}
                variant="primary"
                size="md"
                isLoading={isRegenerating}
              >
                Generate API Key
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-black border border-gray-800 max-w-md w-full p-6 space-y-4">
            <h3 className="font-mono text-lg uppercase tracking-wider text-white">
              {apiKeyInfo?.hasKey ? 'Regenerate API Key?' : 'Generate API Key?'}
            </h3>

            {apiKeyInfo?.hasKey && (
              <div className="border-l-2 border-yellow-500 pl-4">
                <p className="font-mono text-sm text-yellow-500">
                  Warning: This will invalidate your current API key immediately.
                </p>
                <p className="font-mono text-xs text-gray-400 mt-2">
                  Any applications using the old key will stop working.
                </p>
              </div>
            )}

            <p className="font-mono text-sm text-gray-400">
              {apiKeyInfo?.hasKey
                ? 'A new API key will be generated and the old one will be revoked.'
                : 'A new API key will be generated for your account.'}
            </p>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => void handleRegenerateConfirm()}
                variant="primary"
                size="md"
                isLoading={isRegenerating}
                className="flex-1"
              >
                {apiKeyInfo?.hasKey ? 'Regenerate' : 'Generate'}
              </Button>
              <Button
                onClick={() => setShowConfirmModal(false)}
                variant="ghost"
                size="md"
                disabled={isRegenerating}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
