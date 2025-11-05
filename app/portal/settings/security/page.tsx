'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Shield, Key, Smartphone, Trash2, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';

interface SecurityKey {
  id: string;
  deviceName: string;
  createdAt: string;
  lastUsed?: string;
}

export default function SecuritySettingsPage() {
  const { data: session } = useSession();
  const [devices, setDevices] = useState<SecurityKey[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock data - in production, fetch from API
  useEffect(() => {
    // This would be a real API call
    setDevices([
      {
        id: '1',
        deviceName: 'YubiKey 5 NFC',
        createdAt: '2024-10-15',
        lastUsed: '2024-11-04',
      },
    ]);
  }, []);

  const handleRegisterDevice = async () => {
    if (!deviceName.trim()) {
      setError('Please enter a device name');
      return;
    }

    setIsRegistering(true);
    setError('');
    setSuccess('');

    try {
      // Get registration options from server
      const optionsResponse = await fetch('/api/webauthn/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options');
      }

      const options: PublicKeyCredentialCreationOptionsJSON = await optionsResponse.json();

      // Start WebAuthn registration with the browser
      const credential = await startRegistration(options);

      // Verify registration with server
      const verifyResponse = await fetch('/api/webauthn/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential,
          deviceName: deviceName.trim(),
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify registration');
      }

      const result = await verifyResponse.json();

      if (result.verified) {
        setSuccess('Security key registered successfully!');
        setDeviceName('');
        setShowAddDevice(false);

        // Refresh devices list (in production, fetch from API)
        setDevices([
          ...devices,
          {
            id: Date.now().toString(),
            deviceName: deviceName.trim(),
            createdAt: new Date().toISOString().split('T')[0],
          },
        ]);
      }
    } catch (err: any) {
      console.error('Registration error:', err);

      if (err.name === 'NotAllowedError') {
        setError('Registration was cancelled or timed out');
      } else if (err.name === 'NotSupportedError') {
        setError('WebAuthn is not supported by your browser');
      } else {
        setError(err.message || 'Failed to register security key');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to remove this security key?')) {
      return;
    }

    // In production, make API call to remove device
    setDevices(devices.filter((d) => d.id !== deviceId));
    setSuccess('Security key removed');
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Security Settings</h1>
        <p className="text-muted">
          Manage your authentication methods and security keys
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/50 flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-500">{success}</p>
          </div>
        </div>
      )}

      {/* Hardware Security Keys Section */}
      <div className="mb-8 p-6 rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Hardware Security Keys</h2>
              <p className="text-sm text-muted">
                YubiKey, Titan Security Key, or other FIDO2 devices
              </p>
            </div>
          </div>
          {!showAddDevice && (
            <button
              onClick={() => setShowAddDevice(true)}
              className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Device</span>
            </button>
          )}
        </div>

        {/* Add Device Form */}
        {showAddDevice && (
          <div className="mb-6 p-4 rounded-lg bg-background border border-accent/50">
            <h3 className="font-semibold mb-4">Register New Security Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Device Name
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g., YubiKey 5 NFC, Titan Security Key"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={isRegistering}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleRegisterDevice}
                  disabled={isRegistering}
                  className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegistering ? 'Waiting for device...' : 'Register Device'}
                </button>
                <button
                  onClick={() => {
                    setShowAddDevice(false);
                    setDeviceName('');
                    setError('');
                  }}
                  disabled={isRegistering}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-surface transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
              {isRegistering && (
                <p className="text-sm text-muted">
                  Please tap your security key when prompted...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Registered Devices List */}
        <div className="space-y-3">
          {devices.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No security keys registered</p>
              <p className="text-sm">Add a hardware security key for enhanced protection</p>
            </div>
          ) : (
            devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{device.deviceName}</h3>
                    <p className="text-sm text-muted">
                      Added {device.createdAt}
                      {device.lastUsed && ` • Last used ${device.lastUsed}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDevice(device.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors"
                  title="Remove device"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Password Section */}
      <div className="p-6 rounded-lg border border-border bg-surface">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Password</h2>
            <p className="text-sm text-muted">
              Change your account password
            </p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-lg border border-border hover:border-accent transition-colors">
          Change Password
        </button>
      </div>

      {/* Security Recommendations */}
      <div className="mt-8 p-6 rounded-lg bg-accent/5 border border-accent/20">
        <h3 className="font-semibold mb-3 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-accent" />
          <span>Security Recommendations</span>
        </h3>
        <ul className="space-y-2 text-sm text-muted">
          <li>• Register at least two security keys in case one is lost</li>
          <li>• Hardware security keys provide the strongest protection against phishing</li>
          <li>• Store backup keys in a secure location separate from your primary key</li>
          <li>• YubiKey 5 Series and Google Titan Security Keys are recommended</li>
        </ul>
      </div>
    </div>
  );
}
