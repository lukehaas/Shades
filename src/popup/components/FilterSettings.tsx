import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { getFilterById, generateFilterCSS } from '../../utils/filters';
import { FilterId, FilterSettings as FilterSettingsType } from '../../types/filters';

interface FilterSettingsProps {
  filterId: FilterId;
  onCancel: () => void;
  onApply: () => void;
}

const FilterSettings = ({
  filterId,
  onCancel,
  onApply,
}: FilterSettingsProps) => {
  const { currentFilter, applyFilter, defaultFilter, setAsDefault, removeDefault } = useApp();
  const filter = getFilterById(filterId);
  const isCurrentDefault = defaultFilter?.filterId === filterId;

  const [settings, setSettings] = useState<FilterSettingsType>(
    filter?.defaultSettings || { intensity: 50 }
  );
  const [makeDefault, setMakeDefault] = useState(isCurrentDefault);

  // Send preview to content script
  const sendPreview = useCallback(
    async (previewSettings: FilterSettingsType) => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (!tab.id) return;

        const css = generateFilterCSS(filterId, previewSettings);
        await chrome.tabs.sendMessage(tab.id, {
          action: 'applyFilter',
          css,
          filterId,
          settings: previewSettings,
        });
      } catch (error) {
        console.error('Error sending preview:', error);
      }
    },
    [filterId]
  );

  useEffect(() => {
    if (currentFilter?.filterId === filterId && currentFilter.settings) {
      setSettings(currentFilter.settings);
    } else if (filter) {
      setSettings(filter.defaultSettings);
    }
  }, [currentFilter, filterId, filter]);

  // Send preview whenever settings change
  useEffect(() => {
    sendPreview(settings);
  }, [settings, sendPreview]);

  if (!filter) {
    return <div>Filter not found</div>;
  }

  const handleReset = () => {
    setSettings(filter.defaultSettings);
  };

  const handleCancel = async () => {
    // Revert to the saved filter state by re-applying what's in storage
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab.id) {
        if (currentFilter) {
          // Re-apply the saved filter
          const css = generateFilterCSS(currentFilter.filterId, currentFilter.settings);
          await chrome.tabs.sendMessage(tab.id, {
            action: 'applyFilter',
            css,
            filterId: currentFilter.filterId,
            settings: currentFilter.settings,
          });
        } else {
          // No saved filter, remove the preview
          await chrome.tabs.sendMessage(tab.id, {
            action: 'removeFilter',
          });
        }
      }
    } catch (error) {
      console.error('Error reverting filter:', error);
    }
    onCancel();
  };

  const handleApply = async () => {
    await applyFilter(filter.id, settings);

    // Handle default filter setting
    if (makeDefault && !isCurrentDefault) {
      await setAsDefault(filter.id, settings);
    } else if (!makeDefault && isCurrentDefault) {
      await removeDefault();
    } else if (makeDefault && isCurrentDefault) {
      // Update default settings if already default
      await setAsDefault(filter.id, settings);
    }

    onApply();
  };

  const handleSettingChange = (key: string, value: number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <img
          src={`/icons/filters/${filter.id}.png`}
          alt={filter.name}
          className="w-32 h-auto mx-auto mb-2 drop-shadow-[0_10px_8px_rgba(0,0,0,0.3)]"
        />
        <h2 className="text-2xl font-bold text-slate-100">{filter.name}</h2>
      </div>

      <div className="space-y-4">
        {filter.availableSettings.map((setting) => (
          <div key={setting.key} className="space-y-2">
            {setting.type === 'slider' && (
              <>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-200">
                    {setting.label}
                  </label>
                  <span className="text-sm text-slate-400">
                    {settings[setting.key]}
                  </span>
                </div>
                <input
                  type="range"
                  min={setting.min}
                  max={setting.max}
                  step={setting.step}
                  value={settings[setting.key] as number}
                  onChange={(e) =>
                    handleSettingChange(setting.key, Number(e.target.value))
                  }
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </>
            )}

            {setting.type === 'checkbox' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[setting.key] as boolean}
                  onChange={(e) =>
                    handleSettingChange(setting.key, e.target.checked)
                  }
                  className="w-4 h-4 text-primary-500 bg-slate-600 border-slate-500 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-slate-200">
                  {setting.label}
                </span>
              </label>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-600 pt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={makeDefault}
            onChange={(e) => setMakeDefault(e.target.checked)}
            className="w-4 h-4 text-primary-500 bg-slate-600 border-slate-500 rounded focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-slate-200">
            Set as default
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          className="flex-1 px-4 py-2 text-slate-200 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 transition font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 text-slate-200 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 transition font-medium"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition font-medium"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterSettings;
