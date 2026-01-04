import { FilterId, FilterSettings } from './filters';

export interface WebsiteFilter {
  filterId: FilterId;
  settings: FilterSettings;
}

export interface StorageData {
  websiteFilters: Record<string, WebsiteFilter>;
  extensionEnabled: boolean;
}

export const DEFAULT_STORAGE: StorageData = {
  websiteFilters: {},
  extensionEnabled: true,
};
