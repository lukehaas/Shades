import type { FilterId, FilterSettings } from './filters';

// Messages sent from the background/popup to the content script
export type ContentMessage =
  | {
      action: 'applyFilter';
      css: string;
      filterId: FilterId;
      settings: FilterSettings;
    }
  | { action: 'removeFilter' };
