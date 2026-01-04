import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FilterId, FilterSettings } from '../../types/filters';
import { WebsiteFilter } from '../../types/storage';
import {
  getCurrentDomain,
  getExtensionEnabled,
  setExtensionEnabled,
  getFilterForWebsite,
  setFilterForWebsite,
  removeFilterForWebsite,
  getWebsiteFilters,
} from '../../utils/storage';

interface AppContextType {
  currentDomain: string;
  extensionEnabled: boolean;
  currentFilter: WebsiteFilter | null;
  websiteFilters: Record<string, WebsiteFilter>;
  isLoading: boolean;
  toggleExtension: () => Promise<void>;
  applyFilter: (filterId: FilterId, settings: FilterSettings) => Promise<void>;
  removeFilter: (domain?: string) => Promise<void>;
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
  const [extensionEnabled, setExtensionEnabledState] = useState<boolean>(true);
  const [currentFilter, setCurrentFilter] = useState<WebsiteFilter | null>(
    null
  );
  const [websiteFilters, setWebsiteFilters] = useState<
    Record<string, WebsiteFilter>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const domain = await getCurrentDomain();
      const enabled = await getExtensionEnabled();
      const filter = await getFilterForWebsite(domain);
      const allFilters = await getWebsiteFilters();

      setCurrentDomain(domain);
      setExtensionEnabledState(enabled);
      setCurrentFilter(filter);
      setWebsiteFilters(allFilters);
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
    const newState = !extensionEnabled;
    await setExtensionEnabled(newState);
    setExtensionEnabledState(newState);
  };

  const applyFilter = async (filterId: FilterId, settings: FilterSettings) => {
    if (!currentDomain) return;
    await setFilterForWebsite(currentDomain, filterId, settings);
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

  return (
    <AppContext.Provider
      value={{
        currentDomain,
        extensionEnabled,
        currentFilter,
        websiteFilters,
        isLoading,
        toggleExtension,
        applyFilter,
        removeFilter,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
