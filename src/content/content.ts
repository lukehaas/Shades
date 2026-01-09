const FILTER_OVERLAY_ID = 'shades-filter-overlay';
const FILTER_STYLE_ID = 'shades-filter-style';

function normalizeDomain(hostname: string): string {
  return hostname.replace(/^www\./, '');
}

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
    const domain = normalizeDomain(window.location.hostname);

    // Get stored data
    const data = await chrome.storage.local.get({
      extensionDisabled: false,
      websiteFilters: {},
      defaultFilter: null,
    });

    if (data.extensionDisabled) return;

    // Check for domain-specific filter first
    const websiteFilter = data.websiteFilters[domain];

    if (websiteFilter) {
      const { filterId, settings } = websiteFilter;
      // 'none' means explicitly no filter, don't fall back to default
      if (filterId === 'none') {
        return;
      }
      const css = generateFilterCSS(filterId, settings);
      applyFilter(css, filterId, settings);
      return;
    }

    // Fall back to default filter if no domain-specific filter
    if (data.defaultFilter) {
      const { filterId, settings } = data.defaultFilter;
      const css = generateFilterCSS(filterId, settings);
      applyFilter(css, filterId, settings);
    }
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
  const userintensity = (settings.intensity as number) || 100;
  const intensity = userintensity / 100;
  const eclipseColor = 255 - Math.round((100 - userintensity)/2);

  const filterStyles: Record<string, string> = {
    'rose-tint': `
      background-color: rgba(255, 100, 150, ${intensity * 0.8});
      mix-blend-mode: multiply;
    `,
    'sunny-brown': `
      background-color: rgba(180, 140, 80, ${intensity * 0.7});
      mix-blend-mode: multiply;
    `,
    'classic-gray': `
      background-color: rgba(116, 116, 116, ${intensity * 0.8});
      mix-blend-mode: multiply;
    `,
    'emerald-green': `
      background-color: rgba(80, 180, 120, ${intensity * 0.6});
      mix-blend-mode: multiply;
    `,
    'amber-vision': `
      background-color: rgba(255, 180, 50, ${intensity * 0.8});
      mix-blend-mode: multiply;
    `,
    'solar-eclipse': `
      background-color: rgba(${eclipseColor}, ${eclipseColor}, ${eclipseColor}, 1);
      mix-blend-mode: difference;
    `,
  };

  return filterStyles[filterId] || '';
}
