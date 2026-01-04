import { Filter, FilterId, FilterSettings } from '../types/filters';

export const FILTERS: Filter[] = [
  {
    id: 'rose-tint',
    name: 'Rose Tint',
    icon: '🌹',
    description: 'A warm rose-colored overlay',
    defaultSettings: {
      intensity: 40,
      opacity: 100,
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
      {
        key: 'opacity',
        label: 'Opacity',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 100,
      },
    ],
  },
  {
    id: 'sunny-brown',
    name: 'Sunny Brown',
    icon: '☀️',
    description: 'A warm sepia-toned overlay',
    defaultSettings: {
      intensity: 45,
      opacity: 100,
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
      {
        key: 'opacity',
        label: 'Opacity',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 100,
      },
    ],
  },
  {
    id: 'classic-gray',
    name: 'Classic Gray',
    icon: '🎭',
    description: 'A classic grayscale filter',
    defaultSettings: {
      intensity: 50,
      opacity: 100,
    },
    availableSettings: [
      {
        key: 'intensity',
        label: 'Intensity',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 50,
      },
      {
        key: 'opacity',
        label: 'Opacity',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 100,
      },
    ],
  },
  {
    id: 'emerald-green',
    name: 'Emerald Green',
    icon: '💚',
    description: 'A cool emerald-tinted overlay',
    defaultSettings: {
      intensity: 35,
      opacity: 100,
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
      {
        key: 'opacity',
        label: 'Opacity',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 100,
      },
    ],
  },
  {
    id: 'amber-vision',
    name: 'Amber Vision',
    icon: '🟡',
    description: 'A warm amber-toned overlay',
    defaultSettings: {
      intensity: 40,
      opacity: 100,
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
      {
        key: 'opacity',
        label: 'Opacity',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 100,
      },
    ],
  },
  {
    id: 'solar-eclipse',
    name: 'Solar Eclipse',
    icon: '🔄',
    description: 'Inverts all colors',
    defaultSettings: {
      intensity: 100,
      opacity: 100,
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
        key: 'opacity',
        label: 'Opacity',
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
  const opacity = settings.opacity / 100;

  // All filters use background-color with mix-blend-mode to affect underlying content
  // Intensity controls the color strength, opacity controls overall filter visibility
  const filterStyles: Record<string, string> = {
    'rose-tint': `
      background-color: rgba(255, 100, 150, ${intensity * 0.4});
      mix-blend-mode: multiply;
      opacity: ${opacity};
    `,
    'sunny-brown': `
      background-color: rgba(180, 140, 80, ${intensity * 0.45});
      mix-blend-mode: multiply;
      opacity: ${opacity};
    `,
    'classic-gray': `
      background-color: rgba(128, 128, 128, ${intensity});
      mix-blend-mode: saturation;
      opacity: ${opacity};
    `,
    'emerald-green': `
      background-color: rgba(80, 180, 120, ${intensity * 0.35});
      mix-blend-mode: multiply;
      opacity: ${opacity};
    `,
    'amber-vision': `
      background-color: rgba(255, 180, 50, ${intensity * 0.4});
      mix-blend-mode: multiply;
      opacity: ${opacity};
    `,
    'solar-eclipse': `
      background-color: rgba(255, 255, 255, ${intensity});
      mix-blend-mode: difference;
      opacity: ${opacity};
    `,
  };

  return filterStyles[filterId] || '';
};
