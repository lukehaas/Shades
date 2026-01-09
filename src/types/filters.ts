export type FilterId =
  | 'none'
  | 'rose-tint'
  | 'sunny-brown'
  | 'classic-gray'
  | 'emerald-green'
  | 'amber-vision'
  | 'solar-eclipse';

export interface FilterSettings {
  intensity: number;
  [key: string]: number | boolean;
}

export interface Filter {
  id: FilterId;
  name: string;
  description: string;
  defaultSettings: FilterSettings;
  availableSettings: FilterSettingConfig[];
}

export interface FilterSettingConfig {
  key: string;
  label: string;
  type: 'slider' | 'checkbox';
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number | boolean;
}
