import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import FilterGrid from './components/FilterGrid';
import FilterSettings from './components/FilterSettings';
import ManageWebsites from './components/ManageWebsites';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { FilterId } from '../types/filters';

type View = 'main' | 'filterSettings' | 'manageWebsites';

function DisabledScreen() {
  const { toggleExtension } = useApp();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={toggleExtension}
          className="p-8 rounded-full bg-slate-700 hover:bg-slate-600 transition text-slate-400 hover:text-primary-400"
          aria-label="Enable extension"
        >
          <svg
            className="w-24 h-24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 3v6"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6.34 7.34a8 8 0 1011.32 0"
            />
          </svg>
        </button>
      </div>
      <p className="text-slate-500 text-lg py-8">Shades is disabled</p>
    </div>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedFilterId, setSelectedFilterId] = useState<FilterId | null>(null);
  const { isLoading, extensionDisabled } = useApp();

  return (
    <div className="bg-slate-800 h-full flex flex-col">
      <Header
        onSettingsClick={() => setCurrentView('manageWebsites')}
      />
      <main className="p-4 flex-1 flex flex-col min-h-0">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {currentView === 'main' && !extensionDisabled && (
              <FilterGrid
                onFilterSettingsClick={(filterId) => {
                  setSelectedFilterId(filterId);
                  setCurrentView('filterSettings');
                }}
              />
            )}

            {
              currentView === 'main' && extensionDisabled && (
                <DisabledScreen />
              )
            }

            {currentView === 'filterSettings' && selectedFilterId && (
              <FilterSettings
                filterId={selectedFilterId}
                onCancel={() => setCurrentView('main')}
                onApply={() => setCurrentView('main')}
              />
            )}

            {currentView === 'manageWebsites' && (
              <ManageWebsites onBack={() => setCurrentView('main')} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
