import type { Filter, FilterId, FilterSettings } from '../types/filters';
import type { StorageData } from '../types/storage';
import type { ContentMessage } from '../types/messages';

export const FILTERS: Filter[] = [
  {
    id: 'rose-tint',
    name: 'Rose Tint',
    description: 'A warm rose-colored overlay',
    defaultSettings: {
      intensity: 40,
    },
    availableSettings: [
      {
        key: 'intensity',
        label: 'Intensity',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 40,
      },
    ],
  },
  {
    id: 'sunny-brown',
    name: 'Sunny Brown',
    description: 'A warm sepia-toned overlay',
    defaultSettings: {
      intensity: 45,
    },
    availableSettings: [
      {
        key: 'intensity',
        label: 'Intensity',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 45,
      },
    ],
  },
  {
    id: 'classic-gray',
    name: 'Classic Gray',
    description: 'A neutral gray overlay',
    defaultSettings: {
      intensity: 60,
    },
    availableSettings: [
      {
        key: 'intensity',
        label: 'Intensity',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 60,
      },
    ],
  },
  {
    id: 'emerald-green',
    name: 'Emerald Green',
    description: 'A cool emerald-tinted overlay',
    defaultSettings: {
      intensity: 35,
    },
    availableSettings: [
      {
        key: 'intensity',
        label: 'Intensity',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 35,
      },
    ],
  },
  {
    id: 'amber-vision',
    name: 'Amber Vision',
    description: 'A warm amber-toned overlay',
    defaultSettings: {
      intensity: 40,
    },
    availableSettings: [
      {
        key: 'intensity',
        label: 'Intensity',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 40,
      },
    ],
  },
  {
    id: 'solar-eclipse',
    name: 'Solar Eclipse',
    description: 'Inverts all colors',
    defaultSettings: {
      intensity: 100,
      excludeImages: true,
    },
    availableSettings: [
      {
        key: 'intensity',
        label: 'Intensity',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 100,
      },
      {
        key: 'excludeImages',
        label: 'Exclude images and media',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },
];

export const getFilterById = (id: FilterId): Filter | undefined => {
  return FILTERS.find((filter) => filter.id === id);
};

export const generateFilterCSS = (
  filterId: FilterId,
  settings: FilterSettings
): string => {
  const intensity = settings.intensity / 100;
  const eclipseColor = 255 - Math.round((100 - settings.intensity)/2);

  // All filters use background-color with mix-blend-mode to affect underlying content
  // Intensity controls the color strength, opacity controls overall filter visibility
  const filterStyles: Record<string, string> = {
    'rose-tint': `
      background-color: rgba(255, 100, 150, ${intensity * 0.8});
      mix-blend-mode: multiply;
    `,
    'sunny-brown': `
      background-color: rgba(180, 140, 80, ${intensity * 0.7});
      mix-blend-mode: multiply;
    `,
    'classic-gray': `
      background-color: rgba(116, 116, 116, ${intensity * 0.8});
      mix-blend-mode: multiply;
    `,
    'emerald-green': `
      background-color: rgba(80, 180, 120, ${intensity * 0.6});
      mix-blend-mode: multiply;
    `,
    'amber-vision': `
      background-color: rgba(255, 180, 50, ${intensity * 0.8});
      mix-blend-mode: multiply;
    `,
    'solar-eclipse': `
      background-color: rgba(${eclipseColor}, ${eclipseColor}, ${eclipseColor}, 1);
      mix-blend-mode: difference;
    `,
  };

  return filterStyles[filterId] || '';
};

const getEffectiveSettings = (
  filterId: FilterId,
  filterSettings: StorageData['filterSettings']
): FilterSettings => {
  return (
    filterSettings[filterId] ||
    getFilterById(filterId)?.defaultSettings || { intensity: 50 }
  );
};

/**
 * Work out what the content script for `domain` should show, given the
 * stored data. A site-specific filter wins; an explicit 'none' blocks the
 * default filter; otherwise the default filter (if any) applies.
 */
export const resolveFilterMessage = (
  data: StorageData,
  domain: string
): ContentMessage => {
  if (data.extensionDisabled) return { action: 'removeFilter' };

  const filterId = data.websiteFilters[domain]?.filterId ?? data.defaultFilter;
  if (!filterId || filterId === 'none') return { action: 'removeFilter' };

  const settings = getEffectiveSettings(filterId, data.filterSettings);
  return {
    action: 'applyFilter',
    css: generateFilterCSS(filterId, settings),
    filterId,
    settings,
  };
};
