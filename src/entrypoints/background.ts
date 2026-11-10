import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';
import {
  getFilterForWebsite,
  getExtensionDisabled,
  setExtensionDisabled,
  getDefaultFilter,
  setFilterForWebsite,
  removeFilterForWebsite,
  normalizeDomain,
  getStorageData,
} from '../utils/storage';
import { resolveFilterMessage } from '../utils/filters';
import type { ContentMessage } from '../types/messages';

// Pages where browsers never run extension content scripts
const RESTRICTED_URL_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'edge://',
  'brave://',
  'about:',
  'moz-extension://',
  'resource://',
  'view-source:',
  'https://chromewebstore.google.com',
  'https://chrome.google.com/webstore',
  'https://addons.mozilla.org',
];

export default defineBackground(() => {
  // Listeners must be registered synchronously so the browser can wake the
  // background (Chrome service worker / Firefox event page) for these events
  browser.commands.onCommand.addListener(async (command) => {
    if (command === 'toggle-extension') {
      const disabled = await getExtensionDisabled();
      await setExtensionDisabled(!disabled);
    } else if (command === 'toggle-filter') {
      await toggleCurrentFilter();
    } else if (command === 'toggle-invert') {
      await toggleSolarEclipse();
    }
  });

  browser.tabs.onActivated.addListener(async (activeInfo) => {
    await applyFilterToTab(activeInfo.tabId);
  });

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
      await applyFilterToTab(tabId);
    }
  });

  browser.storage.onChanged.addListener(async (changes) => {
    if (
      changes.websiteFilters ||
      changes.extensionDisabled ||
      changes.defaultFilter ||
      changes.filterSettings
    ) {
      const tab = await getActiveTab();
      if (tab?.id) {
        await applyFilterToTab(tab.id, true);
      }
    }
  });
});

async function getActiveTab() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab;
}

/** Domain of the active tab, or null if there is none or it's disabled. */
async function getActiveDomain(): Promise<string | null> {
  const tab = await getActiveTab();
  if (!tab?.url || !tab.id) return null;
  if (await getExtensionDisabled()) return null;
  return normalizeDomain(new URL(tab.url).hostname);
}

async function toggleCurrentFilter() {
  try {
    const domain = await getActiveDomain();
    if (!domain) return;

    const websiteFilter = await getFilterForWebsite(domain);
    const defaultFilter = await getDefaultFilter();

    if (websiteFilter && websiteFilter.filterId !== 'none') {
      // Site-specific filter is active, turn it off
      await setFilterForWebsite(domain, 'none');
    } else if (!websiteFilter && defaultFilter) {
      // Default filter is applied, block it for this site
      await setFilterForWebsite(domain, 'none');
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
    const domain = await getActiveDomain();
    if (!domain) return;

    const websiteFilter = await getFilterForWebsite(domain);
    await setFilterForWebsite(
      domain,
      websiteFilter?.filterId === 'solar-eclipse' ? 'none' : 'solar-eclipse'
    );
  } catch (error) {
    console.error('Error toggling solar eclipse:', error);
  }
}

function isRestrictedUrl(url: string): boolean {
  return RESTRICTED_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

async function sendMessageToTab(
  tabId: number,
  message: ContentMessage,
  shouldReload = false
): Promise<boolean> {
  try {
    await browser.tabs.sendMessage(tabId, message);
    return true;
  } catch {
    // Content script not injected (e.g., tab was open before extension installed)
    // Reload the tab so the content script gets injected
    if (!shouldReload) return false;
    try {
      await browser.tabs.reload(tabId);
      return false; // Message wasn't sent, but tab will reload with content script
    } catch (reloadError) {
      console.error('Failed to reload tab:', reloadError);
      return false;
    }
  }
}

async function applyFilterToTab(tabId: number, shouldReload = false) {
  try {
    const tab = await browser.tabs.get(tabId);
    if (!tab.url || isRestrictedUrl(tab.url)) return;

    const domain = normalizeDomain(new URL(tab.url).hostname);
    const data = await getStorageData();
    await sendMessageToTab(
      tabId,
      resolveFilterMessage(data, domain),
      shouldReload
    );
  } catch (error) {
    console.error('Error applying filter to tab:', error);
  }
}
