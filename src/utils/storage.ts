import { browser } from 'wxt/browser';
import type {
  StorageData,
  WebsiteFilter} from '../types/storage';
import {
  DEFAULT_STORAGE,
} from '../types/storage';
import type { FilterId, FilterSettings } from '../types/filters';

export const normalizeDomain = (hostname: string): string => {
  return hostname.replace(/^www\./, '');
};

export const getStorageData = async (): Promise<StorageData> => {
  return browser.storage.local.get<StorageData>(DEFAULT_STORAGE);
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
  filterId: FilterId
): Promise<void> => {
  const data = await getStorageData();
  data.websiteFilters[domain] = { filterId };
  await browser.storage.local.set({ websiteFilters: data.websiteFilters });
};

export const removeFilterForWebsite = async (
  domain: string
): Promise<void> => {
  const data = await getStorageData();
  delete data.websiteFilters[domain];
  await browser.storage.local.set({ websiteFilters: data.websiteFilters });
};

export const getExtensionDisabled = async (): Promise<boolean> => {
  const data = await getStorageData();
  return data.extensionDisabled;
};

export const setExtensionDisabled = async (disabled: boolean): Promise<void> => {
  await browser.storage.local.set({ extensionDisabled: disabled });
};

export const getCurrentDomain = async (): Promise<string> => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return '';

  try {
    const url = new URL(tab.url);
    return normalizeDomain(url.hostname);
  } catch {
    return '';
  }
};

export const getDefaultFilter = async (): Promise<FilterId | null> => {
  const data = await getStorageData();
  return data.defaultFilter;
};

export const setDefaultFilter = async (filterId: FilterId): Promise<void> => {
  await browser.storage.local.set({ defaultFilter: filterId });
};

export const clearDefaultFilter = async (): Promise<void> => {
  await browser.storage.local.set({ defaultFilter: null });
};

// Global filter settings functions
export const getFilterSettings = async (
  filterId: FilterId
): Promise<FilterSettings | null> => {
  const data = await getStorageData();
  return data.filterSettings[filterId] || null;
};

export const getAllFilterSettings = async (): Promise<
  Partial<Record<FilterId, FilterSettings>>
> => {
  const data = await getStorageData();
  return data.filterSettings;
};

export const setFilterSettings = async (
  filterId: FilterId,
  settings: FilterSettings
): Promise<void> => {
  const data = await getStorageData();
  data.filterSettings[filterId] = settings;
  await browser.storage.local.set({ filterSettings: data.filterSettings });
};
