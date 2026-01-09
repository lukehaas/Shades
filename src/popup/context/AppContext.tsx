import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FilterId, FilterSettings } from '../../types/filters';
import { WebsiteFilter, DefaultFilter } from '../../types/storage';
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
} from '../../utils/storage';

interface AppContextType {
  currentDomain: string;
  extensionDisabled: boolean;
  currentFilter: WebsiteFilter | null;
  websiteFilters: Record<string, WebsiteFilter>;
  defaultFilter: DefaultFilter | null;
  isLoading: boolean;
  toggleExtension: () => Promise<void>;
  applyFilter: (filterId: FilterId, settings: FilterSettings) => Promise<void>;
  removeFilter: (domain?: string) => Promise<void>;
  setAsDefault: (filterId: FilterId, settings: FilterSettings) => Promise<void>;
  removeDefault: () => Promise<void>;
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
  const [defaultFilterState, setDefaultFilterState] = useState<DefaultFilter | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const domain = await getCurrentDomain();
      const disabled = await getExtensionDisabled();
      const filter = await getFilterForWebsite(domain);
      const allFilters = await getWebsiteFilters();
      const defaultFlt = await getDefaultFilter();

      setCurrentDomain(domain);
      setExtensionDisabledState(disabled);
      setCurrentFilter(filter);
      setWebsiteFilters(allFilters);
      setDefaultFilterState(defaultFlt);
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

  const setAsDefault = async (filterId: FilterId, settings: FilterSettings) => {
    await setDefaultFilter(filterId, settings);
    await loadData();
  };

  const removeDefault = async () => {
    await clearDefaultFilter();
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
        isLoading,
        toggleExtension,
        applyFilter,
        removeFilter,
        setAsDefault,
        removeDefault,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
