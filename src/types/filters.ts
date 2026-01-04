export type FilterId =
  | 'rose-tint'
  | 'sunny-brown'
  | 'classic-gray'
  | 'emerald-green'
  | 'amber-vision'
  | 'solar-eclipse';

export interface FilterSettings {
  intensity: number;
  opacity: number;
  [key: string]: number | boolean;
}

export interface Filter {
  id: FilterId;
  name: string;
  icon: string;
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
