import { FilterId, FilterSettings } from './filters';

export interface WebsiteFilter {
  filterId: FilterId;
  settings: FilterSettings;
}

export interface DefaultFilter {
  filterId: FilterId;
  settings: FilterSettings;
}

export interface StorageData {
  websiteFilters: Record<string, WebsiteFilter>;
  extensionDisabled: boolean;
  defaultFilter: DefaultFilter | null;
}

export const DEFAULT_STORAGE: StorageData = {
  websiteFilters: {},
  extensionDisabled: false,
  defaultFilter: null,
};
