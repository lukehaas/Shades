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

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedFilterId, setSelectedFilterId] = useState<FilterId | null>(null);
  const { isLoading } = useApp();

  return (
    <div className="bg-gray-50 min-h-full">
      <Header
        onSettingsClick={() => setCurrentView('manageWebsites')}
      />

      <main className="p-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {currentView === 'main' && (
              <FilterGrid
                onFilterSettingsClick={(filterId) => {
                  setSelectedFilterId(filterId);
                  setCurrentView('filterSettings');
                }}
              />
            )}

            {currentView === 'filterSettings' && selectedFilterId && (
              <FilterSettings
                filterId={selectedFilterId}
                onCancel={() => setCurrentView('main')}
                onApply={() => setCurrentView('main')}
              />
            )}

            {currentView === 'manageWebsites' && <ManageWebsites />}
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
