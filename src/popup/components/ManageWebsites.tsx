import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FILTERS } from '../../utils/filters';
import { FilterId } from '../../types/filters';
import { setFilterForWebsite } from '../../utils/storage';

interface ManageWebsitesProps {
  onBack: () => void;
}

const ManageWebsites = ({ onBack }: ManageWebsitesProps) => {
  const { websiteFilters, removeFilter, refreshData } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const websites = Object.entries(websiteFilters).filter(([domain]) =>
    domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFilterChange = async (domain: string, newFilterId: FilterId) => {
    await setFilterForWebsite(domain, newFilterId);
    await refreshData();
  };

  const handleDelete = async (domain: string) => {
    await removeFilter(domain);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="relative flex items-center justify-center pb-4">
        <button
          onClick={onBack}
          className="absolute left-0 p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition"
          aria-label="Go back"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-slate-100">Manage Websites</h2>
      </div>

      <div className="relative pb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 -mt-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search domains..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {websites.length === 0 ? (
        <div className="text-center py-8">
          {searchQuery ? (
            <p className="text-slate-400">No domains matching "{searchQuery}"</p>
          ) : (
            <>
              <p className="text-slate-400">No websites with filters yet</p>
              <p className="text-sm text-slate-500 mt-2">
                Apply a filter to a website to see it here
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2">
          {websites.map(([domain, websiteFilter]) => (
            <div
              key={domain}
              className="flex items-center justify-between gap-2 p-2 bg-slate-700 border border-slate-600 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">
                  {domain}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={websiteFilter.filterId}
                  onChange={(e) =>
                    handleFilterChange(domain, e.target.value as FilterId)
                  }
                  className="text-sm bg-slate-600 text-slate-200 border border-slate-500 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="none">None</option>
                  {FILTERS.map((filter) => (
                    <option key={filter.id} value={filter.id}>
                      {filter.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleDelete(domain)}
                  className="p-1 text-red-400 hover:bg-slate-600 rounded transition"
                  aria-label="Delete filter"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageWebsites;
