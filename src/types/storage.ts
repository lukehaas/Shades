import { FilterId, FilterSettings } from './filters';

// Website filter now only stores the filter ID - settings are global per-filter
export interface WebsiteFilter {
  filterId: FilterId;
}

export interface StorageData {
  websiteFilters: Record<string, WebsiteFilter>;
  extensionDisabled: boolean;
  defaultFilter: FilterId | null;
  // Global filter settings - settings apply to the filter everywhere
  filterSettings: Partial<Record<FilterId, FilterSettings>>;
}

export const DEFAULT_STORAGE: StorageData = {
  websiteFilters: {},
  extensionDisabled: false,
  defaultFilter: null,
  filterSettings: {},
};
