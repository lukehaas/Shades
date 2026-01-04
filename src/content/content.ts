const FILTER_OVERLAY_ID = 'shades-filter-overlay';
const FILTER_STYLE_ID = 'shades-filter-style';

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'applyFilter') {
    applyFilter(message.css, message.filterId, message.settings);
  } else if (message.action === 'removeFilter') {
    removeFilter();
  }
});

// Apply filter immediately on page load to prevent flash
initializeFilter();

function applyFilter(
  css: string,
  filterId: string,
  settings: Record<string, unknown>
) {
  removeFilter();

  const style = document.createElement('style');
  style.id = FILTER_STYLE_ID;

  const overlay = document.createElement('div');
  overlay.id = FILTER_OVERLAY_ID;

  style.textContent = `
    #${FILTER_OVERLAY_ID} {
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

  // Only apply image exclusion for the invert filter
  if (filterId === 'solar-eclipse' && settings.excludeImages) {
    const intensity = (settings.intensity as number) / 100 || 1;
    style.textContent += `
    img, video, canvas, iframe, [style*="background-image"] {
      filter: invert(${intensity}) !important;
    }
    `;
  }

  (document.head || document.documentElement).appendChild(style);
  document.documentElement.appendChild(overlay);
}

function removeFilter() {
  const existingOverlay = document.getElementById(FILTER_OVERLAY_ID);
  if (existingOverlay) {
    existingOverlay.remove();
  }

  const existingStyle = document.getElementById(FILTER_STYLE_ID);
  if (existingStyle) {
    existingStyle.remove();
  }
}

// Initialize filter immediately to prevent flash of unstyled content
async function initializeFilter() {
  try {
    const domain = window.location.hostname;

    // Get stored data
    const data = await chrome.storage.local.get({
      extensionEnabled: true,
      websiteFilters: {},
    });

    if (!data.extensionEnabled) return;

    const websiteFilter = data.websiteFilters[domain];
    if (!websiteFilter) return;

    const { filterId, settings } = websiteFilter;
    const css = generateFilterCSS(filterId, settings);

    applyFilter(css, filterId, settings);
  } catch (error) {
    // Silently fail - background script will handle it
    console.error('Error initializing filter:', error);
  }
}

// Inline filter CSS generation to avoid import issues with content scripts
function generateFilterCSS(
  filterId: string,
  settings: Record<string, unknown>
): string {
  const intensity = ((settings.intensity as number) || 100) / 100;
  const opacity = ((settings.opacity as number) || 100) / 100;

  const filterStyles: Record<string, string> = {
    'rose-tint': `
      background-color: rgba(255, 100, 150, ${intensity * 0.4});
      mix-blend-mode: multiply;
      opacity: ${opacity};
    `,
    'sunny-brown': `
      background-color: rgba(180, 140, 80, ${intensity * 0.45});
      mix-blend-mode: multiply;
      opacity: ${opacity};
    `,
    'classic-gray': `
      background-color: rgba(128, 128, 128, ${intensity});
      mix-blend-mode: saturation;
      opacity: ${opacity};
    `,
    'emerald-green': `
      background-color: rgba(80, 180, 120, ${intensity * 0.35});
      mix-blend-mode: multiply;
      opacity: ${opacity};
    `,
    'amber-vision': `
      background-color: rgba(255, 180, 50, ${intensity * 0.4});
      mix-blend-mode: multiply;
      opacity: ${opacity};
    `,
    'solar-eclipse': `
      background-color: rgba(255, 255, 255, ${intensity});
      mix-blend-mode: difference;
      opacity: ${opacity};
    `,
  };

  return filterStyles[filterId] || '';
}
