import {
  getFilterForWebsite,
  getExtensionDisabled,
  setExtensionDisabled,
  getDefaultFilter,
  setFilterForWebsite,
  removeFilterForWebsite,
  normalizeDomain,
} from '../utils/storage';
import { generateFilterCSS, getFilterById } from '../utils/filters';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Shades extension installed');
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-extension') {
    const disabled = await getExtensionDisabled();
    await setExtensionDisabled(!disabled);
  } else if (command === 'toggle-filter') {
    await toggleCurrentFilter();
  } else if (command === 'toggle-invert') {
    await toggleSolarEclipse();
  }
});

async function toggleCurrentFilter() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab.url || !tab.id) return;

    const disabled = await getExtensionDisabled();
    if (disabled) return;

    const url = new URL(tab.url);
    const domain = normalizeDomain(url.hostname);

    const websiteFilter = await getFilterForWebsite(domain);
    const defaultFilter = await getDefaultFilter();

    if (websiteFilter && websiteFilter.filterId !== 'none') {
      // Site-specific filter is active, turn it off
      await setFilterForWebsite(domain, 'none', { intensity: 0 });
    } else if (!websiteFilter && defaultFilter) {
      // Default filter is applied, block it for this site
      await setFilterForWebsite(domain, 'none', { intensity: 0 });
    } else if (websiteFilter?.filterId === 'none') {
      // Filter is explicitly 'none', remove override to restore default
      await removeFilterForWebsite(domain);
    }
  } catch (error) {
    console.error('Error toggling filter:', error);
  }
}

async function toggleSolarEclipse() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab.url || !tab.id) return;

    const disabled = await getExtensionDisabled();
    if (disabled) return;

    const url = new URL(tab.url);
    const domain = normalizeDomain(url.hostname);

    const websiteFilter = await getFilterForWebsite(domain);
    const solarEclipse = getFilterById('solar-eclipse');

    if (websiteFilter?.filterId === 'solar-eclipse') {
      // Solar eclipse is active, turn it off
      await setFilterForWebsite(domain, 'none', { intensity: 0 });
    } else if (solarEclipse) {
      // Apply solar eclipse
      await setFilterForWebsite(
        domain,
        'solar-eclipse',
        solarEclipse.defaultSettings
      );
    }
  } catch (error) {
    console.error('Error toggling solar eclipse:', error);
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await applyFilterToTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    await applyFilterToTab(tabId);
  }
});

chrome.storage.onChanged.addListener(async (changes) => {
  if (
    changes.websiteFilters ||
    changes.extensionDisabled ||
    changes.defaultFilter
  ) {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id) {
      await applyFilterToTab(tab.id);
    }
  }
});

function isRestrictedUrl(url: string): boolean {
  const restrictedProtocols = [
    'chrome://',
    'chrome-extension://',
    'about:',
    'edge://',
    'brave://',
  ];
  return restrictedProtocols.some((protocol) => url.startsWith(protocol));
}

async function sendMessageToTab(
  tabId: number,
  message: Record<string, unknown>
): Promise<boolean> {
  try {
    await chrome.tabs.sendMessage(tabId, message);
    return true;
  } catch {
    // Content script not injected (e.g., tab was open before extension installed)
    // Reload the tab so the content script gets injected
    try {
      await chrome.tabs.reload(tabId);
      return false; // Message wasn't sent, but tab will reload with content script
    } catch (reloadError) {
      console.error('Failed to reload tab:', reloadError);
      return false;
    }
  }
}

async function applyFilterToTab(tabId: number) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;

    // Skip restricted URLs where content scripts can't run
    if (isRestrictedUrl(tab.url)) return;

    const url = new URL(tab.url);
    const domain = normalizeDomain(url.hostname);

    const disabled = await getExtensionDisabled();
    if (disabled) {
      await sendMessageToTab(tabId, { action: 'removeFilter' });
      return;
    }

    const websiteFilter = await getFilterForWebsite(domain);

    if (websiteFilter) {
      // 'none' means explicitly no filter, don't fall back to default
      if (websiteFilter.filterId === 'none') {
        await sendMessageToTab(tabId, { action: 'removeFilter' });
        return;
      }

      const css = generateFilterCSS(
        websiteFilter.filterId,
        websiteFilter.settings
      );

      await sendMessageToTab(tabId, {
        action: 'applyFilter',
        css,
        filterId: websiteFilter.filterId,
        settings: websiteFilter.settings,
      });
      return;
    }

    // Fall back to default filter if no domain-specific filter
    const defaultFilter = await getDefaultFilter();
    if (defaultFilter) {
      const css = generateFilterCSS(
        defaultFilter.filterId,
        defaultFilter.settings
      );

      await sendMessageToTab(tabId, {
        action: 'applyFilter',
        css,
        filterId: defaultFilter.filterId,
        settings: defaultFilter.settings,
      });
    } else {
      await sendMessageToTab(tabId, { action: 'removeFilter' });
    }
  } catch (error) {
    console.error('Error applying filter to tab:', error);
  }
}
