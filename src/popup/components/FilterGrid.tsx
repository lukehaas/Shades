import { useApp } from '../context/AppContext';
import FilterOption from './FilterOption';
import { FILTERS } from '../../utils/filters';
import { FilterId } from '../../types/filters';

interface FilterGridProps {
  onFilterSettingsClick: (filterId: FilterId) => void;
}

const FilterGrid = ({ onFilterSettingsClick }: FilterGridProps) => {
  const { currentDomain, currentFilter, applyFilter, removeFilter } = useApp();

  const handleFilterClick = async (filterId: FilterId) => {
    const filter = FILTERS.find((f) => f.id === filterId);
    if (!filter) return;

    if (currentFilter?.filterId === filterId) {
      await removeFilter();
    } else {
      await applyFilter(filter.id, filter.defaultSettings);
    }
  };

  return (
    <div className="space-y-4">
      {currentDomain && (
        <div className="text-center">
          <p className="text-sm text-gray-600">Current website:</p>
          <p className="text-lg font-semibold text-gray-900">{currentDomain}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {FILTERS.map((filter) => (
          <FilterOption
            key={filter.id}
            filter={filter}
            isActive={currentFilter?.filterId === filter.id}
            onClick={() => handleFilterClick(filter.id)}
            onSettingsClick={() => onFilterSettingsClick(filter.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FilterGrid;
