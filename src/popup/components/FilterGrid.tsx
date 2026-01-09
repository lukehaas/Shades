import { useApp } from '../context/AppContext';
import FilterOption from './FilterOption';
import { FILTERS } from '../../utils/filters';
import { FilterId } from '../../types/filters';

interface FilterGridProps {
  onFilterSettingsClick: (filterId: FilterId) => void;
}

const FilterGrid = ({ onFilterSettingsClick }: FilterGridProps) => {
  const { currentDomain, currentFilter, defaultFilter, applyFilter } = useApp();

  // Determine the active filter: website-specific (if not 'none') or default
  const activeFilterId =
    currentFilter && currentFilter.filterId !== 'none'
      ? currentFilter.filterId
      : !currentFilter && defaultFilter
        ? defaultFilter.filterId
        : null;

  const handleFilterClick = async (filterId: FilterId) => {
    const filter = FILTERS.find((f) => f.id === filterId);
    if (!filter) return;

    if (activeFilterId === filterId) {
      // Clicking active filter sets to 'none' (explicitly no filter)
      await applyFilter('none', { intensity: 0 });
    } else {
      await applyFilter(filter.id, filter.defaultSettings);
    }
  };

  return (
    <div className="space-y-6">
      {currentDomain && (
        <div className="text-center">
          <p className="text-2xl font-semibold text-slate-50">{currentDomain}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {FILTERS.map((filter) => (
          <FilterOption
            key={filter.id}
            filter={filter}
            isActive={activeFilterId === filter.id}
            onClick={() => handleFilterClick(filter.id)}
            onSettingsClick={() => onFilterSettingsClick(filter.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FilterGrid;
