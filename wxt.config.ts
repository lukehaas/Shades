import { defineConfig } from 'wxt';

const icons = {
  16: 'icons/icon16.png',
  48: 'icons/icon48.png',
  128: 'icons/icon128.png',
};

export default defineConfig({
  srcDir: 'src',
  publicDir: 'public',
  modules: ['@wxt-dev/module-react'],
  manifestVersion: 3,
  // Use explicit imports everywhere instead of WXT's auto-import globals
  imports: false,
  zip: {
    // Sources zip is uploaded to Firefox Add-ons for review; keep it to what's
    // needed to reproduce the build
    includeSources: ['**/*', '.nvmrc'],
    excludeSources: ['*.zip', 'CLAUDE.md', 'assets/**'],
  },
  manifest: ({ browser }) => ({
    name: 'Shades - Because the web is too bright',
    description:
      'Protect your eyes while browsing the web. Apply color filters to reduce eye strain, filter blue light, and enhance visual comfort.',
    permissions: ['storage', 'activeTab', 'tabs'],
    host_permissions: ['<all_urls>'],
    commands: {
      'toggle-extension': {
        suggested_key: { default: 'Alt+Shift+S' },
        description: 'Toggle Shades on/off',
      },
      'toggle-filter': {
        suggested_key: { default: 'Alt+Shift+F' },
        description: 'Toggle filter for current site',
      },
      'toggle-invert': {
        suggested_key: { default: 'Alt+Shift+D' },
        description: 'Toggle invert filter',
      },
    },
    action: {
      default_title: 'Shades',
      default_icon: icons,
    },
    icons,
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          id: 'shades@lukehaas.me',
          // 140 is the first ESR supporting data_collection_permissions
          strict_min_version: '140.0',
          data_collection_permissions: { required: ['none'] },
        },
      },
    }),
  }),
});
