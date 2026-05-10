import React, { useState, useContext, useEffect } from 'react';
import { X, Sliders, Globe, Radio } from 'lucide-react';
import { ToastContext } from '../notifications/ToastContext';
import apiService from '../../services/ApiService';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  theme: 'dark' | 'light' | 'auto';
  epgUrl: string | null;
  logo: string | null;
}

function AdminSettingsModal({ isOpen, onClose }: AdminSettingsModalProps) {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'StreamHub',
    siteDescription: 'IPTV Restream Platform',
    theme: 'dark',
    epgUrl: null,
    logo: null,
  });

  const [epgStatus, setEpgStatus] = useState<{
    isValid: boolean;
    url: string | null;
    message: string;
  }>({
    isValid: false,
    url: null,
    message: 'No EPG configured',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEPG, setIsLoadingEPG] = useState(false);
  const { addToast } = useContext(ToastContext);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      loadEPG();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const response = await apiService.request<{ success: boolean; settings: SiteSettings }>(
        '/admin/settings',
        'GET'
      );
      if (response.success) {
        setSettings(response.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadEPG = async () => {
    try {
      const response = await apiService.request<{
        success: boolean;
        epg: { url: string | null; format: string };
      }>('/admin/epg', 'GET');

      if (response.success && response.epg.url) {
        setEpgStatus({
          isValid: true,
          url: response.epg.url,
          message: `EPG active: ${response.epg.format}`,
        });
      }
    } catch (error) {
      console.error('Error loading EPG:', error);
    }
  };

  const handleSettingsChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.request<{ success: boolean; settings: SiteSettings }>(
        '/admin/settings',
        'POST',
        undefined,
        settings
      );

      if (response.success) {
        addToast({
          type: 'success',
          title: 'Settings saved successfully',
          duration: 3000,
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to save settings',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetEPG = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!settings.epgUrl || !settings.epgUrl.trim()) {
      addToast({
        type: 'error',
        title: 'EPG URL is required',
        duration: 3000,
      });
      return;
    }

    setIsLoadingEPG(true);

    try {
      const response = await apiService.request<{
        success: boolean;
        epg: { url: string; format: string };
      }>('/admin/epg', 'POST', undefined, {
        url: settings.epgUrl,
        format: 'xmltv',
      });

      if (response.success) {
        setEpgStatus({
          isValid: true,
          url: response.epg.url,
          message: 'EPG configured successfully',
        });

        addToast({
          type: 'success',
          title: 'EPG updated successfully',
          duration: 3000,
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to update EPG',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: 3000,
      });
    } finally {
      setIsLoadingEPG(false);
    }
  };

  const handleDeleteEPG = async () => {
    if (!window.confirm('Are you sure you want to remove the EPG?')) {
      return;
    }

    setIsLoadingEPG(true);

    try {
      const response = await apiService.request<{ success: boolean }>(
        '/admin/epg',
        'DELETE'
      );

      if (response.success) {
        setEpgStatus({
          isValid: false,
          url: null,
          message: 'No EPG configured',
        });

        setSettings((prev) => ({
          ...prev,
          epgUrl: null,
        }));

        addToast({
          type: 'success',
          title: 'EPG removed successfully',
          duration: 3000,
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to remove EPG',
        duration: 3000,
      });
    } finally {
      setIsLoadingEPG(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl border border-gray-700 my-8">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Site Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Site Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-400" />
              Site Information
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">Site Name</label>
              <input
                type="text"
                maxLength={100}
                value={settings.siteName}
                onChange={(e) => handleSettingsChange('siteName', e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., StreamHub"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                maxLength={500}
                value={settings.siteDescription}
                onChange={(e) => handleSettingsChange('siteDescription', e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="e.g., IPTV Restream Platform"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingsChange('theme', e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="w-full p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Site Settings'}
            </button>
          </div>

          {/* EPG Configuration */}
          <div className="border-t border-gray-700 pt-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Radio className="w-5 h-5 mr-2 text-blue-400" />
              Electronic Program Guide (EPG)
            </h3>

            {epgStatus.isValid && (
              <div className="flex items-center p-3 bg-green-500 bg-opacity-10 rounded-lg border border-green-500 border-opacity-30">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <div className="flex-1">
                  <p className="text-sm text-green-400 font-medium">EPG Configured</p>
                  <p className="text-xs text-green-300 mt-1 break-all">{epgStatus.url}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">EPG URL</label>
              <input
                type="url"
                value={settings.epgUrl || ''}
                onChange={(e) => handleSettingsChange('epgUrl', e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/epg.xml"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter the URL to your XMLTV EPG file. Supports HTTP and HTTPS.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSetEPG}
                disabled={isLoadingEPG}
                className="flex-1 p-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoadingEPG ? 'Updating...' : 'Update EPG'}
              </button>

              {epgStatus.isValid && (
                <button
                  onClick={handleDeleteEPG}
                  disabled={isLoadingEPG}
                  className="flex-1 p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isLoadingEPG ? 'Removing...' : 'Remove EPG'}
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400 p-3 bg-gray-700 rounded-lg">
              💡 <strong>Tip:</strong> Add EPG support to enhance your channels with program
              information. The EPG URL should point to a valid XMLTV file accessible via HTTP/HTTPS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettingsModal;
