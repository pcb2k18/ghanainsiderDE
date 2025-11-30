'use client';

import { useState, useEffect } from 'react';

interface ClaudeModel {
  id: string;
  name: string;
  description: string;
  costPer1M: string;
}

const CLAUDE_MODELS: ClaudeModel[] = [
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    description: 'Fast and cost-effective - Best for article formatting',
    costPer1M: '$0.80 input / $4.00 output',
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: 'Balanced performance and cost',
    costPer1M: '$3.00 input / $15.00 output',
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    description: 'Latest model with enhanced capabilities',
    costPer1M: '$3.00 input / $15.00 output',
  },
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    description: 'Most capable - Use for complex tasks only',
    costPer1M: '$15.00 input / $75.00 output',
  },
];

export default function SettingsPage() {
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCurrentModel();
  }, []);

  const fetchCurrentModel = async () => {
    try {
      const response = await fetch('/api/settings?key=ai_model');
      if (response.ok) {
        const data = await response.json();
        setSelectedModel(data.value);
      } else {
        // If setting doesn't exist, use default
        setSelectedModel('claude-3-5-haiku-20241022');
      }
    } catch (error) {
      console.error('Error fetching model:', error);
      setSelectedModel('claude-3-5-haiku-20241022');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'ai_model',
          value: selectedModel,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'AI model updated successfully!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update model' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-800 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-surface-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-surface-400">Configure your application settings</p>
      </div>

      <div className="card max-w-4xl">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">AI Model Configuration</h2>
          <p className="text-surface-400 mb-6">
            Select the Claude model to use for AI-powered article formatting. Haiku is recommended for
            cost-effectiveness.
          </p>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-4 mb-6">
            {CLAUDE_MODELS.map((model) => (
              <label
                key={model.id}
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedModel === model.id
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-surface-700 hover:border-surface-600'
                }`}
              >
                <input
                  type="radio"
                  name="model"
                  value={model.id}
                  checked={selectedModel === model.id}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="mt-1 mr-4"
                />
                <div className="flex-1">
                  <div className="font-semibold mb-1">{model.name}</div>
                  <div className="text-sm text-surface-400 mb-2">{model.description}</div>
                  <div className="text-xs text-surface-500">{model.costPer1M}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-700">
            <div className="text-sm text-surface-400">
              Changes will apply to all new AI formatting requests
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="card max-w-4xl mt-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <p className="text-surface-400 mb-4">
            You can also configure the default AI model via environment variable:
          </p>
          <div className="bg-surface-900 p-4 rounded-lg font-mono text-sm">
            <code className="text-primary-400">CLAUDE_MODEL</code>=claude-3-5-haiku-20241022
          </div>
          <p className="text-sm text-surface-500 mt-3">
            Priority: Database setting (above) → Environment variable → Default hardcoded value
          </p>
        </div>
      </div>
    </div>
  );
}
