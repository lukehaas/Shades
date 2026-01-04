import { getFilterForWebsite, getExtensionEnabled } from '../utils/storage';
import { generateFilterCSS } from '../utils/filters';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Shades extension installed');
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await applyFilterToTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    await applyFilterToTab(tabId);
  }
});

chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.websiteFilters || changes.extensionEnabled) {
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

async function applyFilterToTab(tabId: number) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;

    // Skip restricted URLs where content scripts can't run
    if (isRestrictedUrl(tab.url)) return;

    const url = new URL(tab.url);
    const domain = url.hostname;

    const enabled = await getExtensionEnabled();
    if (!enabled) {
      await chrome.tabs.sendMessage(tabId, {
        action: 'removeFilter',
      });
      return;
    }

    const websiteFilter = await getFilterForWebsite(domain);

    if (websiteFilter) {
      const css = generateFilterCSS(
        websiteFilter.filterId,
        websiteFilter.settings
      );

      await chrome.tabs.sendMessage(tabId, {
        action: 'applyFilter',
        css,
        filterId: websiteFilter.filterId,
        settings: websiteFilter.settings,
      });
    } else {
      await chrome.tabs.sendMessage(tabId, {
        action: 'removeFilter',
      });
    }
  } catch (error) {
    console.error('Error applying filter to tab:', error);
  }
}
