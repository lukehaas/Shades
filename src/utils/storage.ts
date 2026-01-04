import {
  StorageData,
  WebsiteFilter,
  DEFAULT_STORAGE,
} from '../types/storage';
import { FilterId, FilterSettings } from '../types/filters';

export const getStorageData = async (): Promise<StorageData> => {
  const result = await chrome.storage.local.get(DEFAULT_STORAGE);
  return result as StorageData;
};

export const getWebsiteFilters = async (): Promise<
  Record<string, WebsiteFilter>
> => {
  const data = await getStorageData();
  return data.websiteFilters;
};

export const getFilterForWebsite = async (
  domain: string
): Promise<WebsiteFilter | null> => {
  const filters = await getWebsiteFilters();
  return filters[domain] || null;
};

export const setFilterForWebsite = async (
  domain: string,
  filterId: FilterId,
  settings: FilterSettings
): Promise<void> => {
  const data = await getStorageData();
  data.websiteFilters[domain] = { filterId, settings };
  await chrome.storage.local.set({ websiteFilters: data.websiteFilters });
};

export const removeFilterForWebsite = async (
  domain: string
): Promise<void> => {
  const data = await getStorageData();
  delete data.websiteFilters[domain];
  await chrome.storage.local.set({ websiteFilters: data.websiteFilters });
};

export const getExtensionEnabled = async (): Promise<boolean> => {
  const data = await getStorageData();
  return data.extensionEnabled;
};

export const setExtensionEnabled = async (enabled: boolean): Promise<void> => {
  await chrome.storage.local.set({ extensionEnabled: enabled });
};

export const getCurrentDomain = async (): Promise<string> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url) return '';

  try {
    const url = new URL(tab.url);
    return url.hostname;
  } catch {
    return '';
  }
};
