import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

const SITE_ACCESS = { origins: ['<all_urls>'] };

/**
 * Firefox lets users revoke host permissions from about:addons, which stops
 * filters from being applied. Offer a one-click way to grant access again.
 * Renders nothing while access is granted (always the case in Chrome).
 */
const SiteAccessBanner = () => {
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const check = () => {
      browser.permissions
        .contains(SITE_ACCESS)
        .then(setHasAccess)
        .catch((error) => console.error('Error checking site access:', error));
    };

    check();
    browser.permissions.onAdded.addListener(check);
    browser.permissions.onRemoved.addListener(check);
    return () => {
      browser.permissions.onAdded.removeListener(check);
      browser.permissions.onRemoved.removeListener(check);
    };
  }, []);

  const requestAccess = async () => {
    try {
      // Must be called directly from the click handler (user gesture)
      setHasAccess(await browser.permissions.request(SITE_ACCESS));
    } catch (error) {
      console.error('Error requesting site access:', error);
    }
  };

  if (hasAccess) return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-amber-900/40 border-b border-amber-700/60 px-4 py-3">
      <p className="text-sm text-amber-100">
        Shades needs access to websites to apply filters.
      </p>
      <button
        onClick={requestAccess}
        className="shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg bg-amber-500 text-slate-900 hover:bg-amber-400 transition"
      >
        Grant access
      </button>
    </div>
  );
};

export default SiteAccessBanner;
