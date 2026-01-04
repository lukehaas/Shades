import { useState } from 'react';
import { Filter } from '../../types/filters';

interface FilterOptionProps {
  filter: Filter;
  isActive: boolean;
  onClick: () => void;
  onSettingsClick: () => void;
}

const FilterOption = ({
  filter,
  isActive,
  onClick,
  onSettingsClick,
}: FilterOptionProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative p-4 rounded-lg border-2 transition cursor-pointer ${
        isActive
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-200 bg-white hover:border-primary-300'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="text-4xl">{filter.icon}</div>
        <div className="text-center">
          <p className="font-medium text-gray-900">{filter.name}</p>
          <p className="text-xs text-gray-500">{filter.description}</p>
        </div>
      </div>

      {isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSettingsClick();
          }}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
          aria-label="Filter settings"
        >
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default FilterOption;
