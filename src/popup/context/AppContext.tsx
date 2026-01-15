import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FilterId, FilterSettings } from '../../types/filters';
import { WebsiteFilter } from '../../types/storage';
import {
  getCurrentDomain,
  getExtensionDisabled,
  setExtensionDisabled,
  getFilterForWebsite,
  setFilterForWebsite,
  removeFilterForWebsite,
  getWebsiteFilters,
  getDefaultFilter,
  setDefaultFilter,
  clearDefaultFilter,
  getAllFilterSettings,
  setFilterSettings as saveFilterSettingsToStorage,
} from '../../utils/storage';

interface AppContextType {
  currentDomain: string;
  extensionDisabled: boolean;
  currentFilter: WebsiteFilter | null;
  websiteFilters: Record<string, WebsiteFilter>;
  defaultFilter: FilterId | null;
  filterSettings: Partial<Record<FilterId, FilterSettings>>;
  isLoading: boolean;
  toggleExtension: () => Promise<void>;
  applyFilter: (filterId: FilterId) => Promise<void>;
  removeFilter: (domain?: string) => Promise<void>;
  setAsDefault: (filterId: FilterId) => Promise<void>;
  removeDefault: () => Promise<void>;
  saveFilterSettings: (filterId: FilterId, settings: FilterSettings) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [extensionDisabledState, setExtensionDisabledState] = useState<boolean>(false);
  const [currentFilter, setCurrentFilter] = useState<WebsiteFilter | null>(
    null
  );
  const [websiteFilters, setWebsiteFilters] = useState<
    Record<string, WebsiteFilter>
  >({});
  const [defaultFilterState, setDefaultFilterState] = useState<FilterId | null>(null);
  const [filterSettingsState, setFilterSettingsState] = useState<
    Partial<Record<FilterId, FilterSettings>>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const domain = await getCurrentDomain();
      const disabled = await getExtensionDisabled();
      const filter = await getFilterForWebsite(domain);
      const allFilters = await getWebsiteFilters();
      const defaultFlt = await getDefaultFilter();
      const allFilterSettings = await getAllFilterSettings();

      setCurrentDomain(domain);
      setExtensionDisabledState(disabled);
      setCurrentFilter(filter);
      setWebsiteFilters(allFilters);
      setDefaultFilterState(defaultFlt);
      setFilterSettingsState(allFilterSettings);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleStorageChange = () => {
      loadData();
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const toggleExtension = async () => {
    const newState = !extensionDisabledState;
    await setExtensionDisabled(newState);
    setExtensionDisabledState(newState);
  };

  const applyFilter = async (filterId: FilterId) => {
    if (!currentDomain) return;
    await setFilterForWebsite(currentDomain, filterId);
    await loadData();
  };

  const removeFilter = async (domain?: string) => {
    const targetDomain = domain || currentDomain;
    if (!targetDomain) return;
    await removeFilterForWebsite(targetDomain);
    await loadData();
  };

  const refreshData = async () => {
    await loadData();
  };

  const setAsDefault = async (filterId: FilterId) => {
    await setDefaultFilter(filterId);
    await loadData();
  };

  const removeDefault = async () => {
    await clearDefaultFilter();
    await loadData();
  };

  const saveFilterSettings = async (filterId: FilterId, settings: FilterSettings) => {
    await saveFilterSettingsToStorage(filterId, settings);
    await loadData();
  };

  return (
    <AppContext.Provider
      value={{
        currentDomain,
        extensionDisabled: extensionDisabledState,
        currentFilter,
        websiteFilters,
        defaultFilter: defaultFilterState,
        filterSettings: filterSettingsState,
        isLoading,
        toggleExtension,
        applyFilter,
        removeFilter,
        setAsDefault,
        removeDefault,
        saveFilterSettings,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
