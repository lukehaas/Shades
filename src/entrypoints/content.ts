import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/utils/define-content-script';
import { getStorageData, normalizeDomain } from '../utils/storage';
import { resolveFilterMessage } from '../utils/filters';
import type { FilterId, FilterSettings } from '../types/filters';
import type { ContentMessage } from '../types/messages';

const FILTER_OVERLAY_ID = 'shades-filter-overlay';
const FILTER_STYLE_ID = 'shades-filter-style';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    // Listen for messages from popup/background
    browser.runtime.onMessage.addListener((message: ContentMessage) => {
      handleMessage(message);
    });

    // Apply filter immediately on page load to prevent flash
    initializeFilter();
  },
});

function handleMessage(message: ContentMessage) {
  if (message.action === 'applyFilter') {
    applyFilter(message.css, message.filterId, message.settings);
  } else if (message.action === 'removeFilter') {
    removeFilter();
  }
}

function applyFilter(
  css: string,
  filterId: FilterId,
  settings: FilterSettings
) {
  removeFilter();

  const style = document.createElement('style');
  style.id = FILTER_STYLE_ID;

  const overlay = document.createElement('div');
  overlay.id = FILTER_OVERLAY_ID;

  style.textContent = `
    #${FILTER_OVERLAY_ID} {
      display: block !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      pointer-events: none !important;
      z-index: 2147483647 !important;
      ${css}
    }
  `;
  if (filterId === 'solar-eclipse') {
    if (settings.excludeImages) {
      style.textContent += `
    img:not([src$=".svg"]):not([src*=".svg?"]), video, canvas, nyt-video-feed::part(player), smp-toucan-player, [style*="background-image"],
    iframe[allow*="autoplay"], iframe[allow*="fullscreen"], iframe[allowfullscreen], iframe[scrolling="no"] {
      filter: invert(1) !important;
    }
    [style*="background-image"] img,
    [style*="background-image"] video,
    [style*="background-image"] canvas {
      filter: none !important;
    }
    `;
    }
    style.textContent += `
  html, body {
      background-color: rgb(255, 255, 255) !important;
    }
  `;
  }

  (document.head || document.documentElement).appendChild(style);
  document.documentElement.appendChild(overlay);
}

function removeFilter() {
  document.getElementById(FILTER_OVERLAY_ID)?.remove();
  document.getElementById(FILTER_STYLE_ID)?.remove();
}

// Initialize filter immediately to prevent flash of unstyled content
async function initializeFilter() {
  try {
    const domain = normalizeDomain(window.location.hostname);
    const data = await getStorageData();
    handleMessage(resolveFilterMessage(data, domain));
  } catch (error) {
    // Background script will retry when the tab finishes loading
    console.error('Error initializing filter:', error);
  }
}
