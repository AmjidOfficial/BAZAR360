import React from 'react';

interface Category {
  id: string;
  name: string;
  nameUr: string;
}

const CATEGORIES_DATA: Category[] = [
  { id: 'sedan', name: 'Sedan', nameUr: 'سیڈان' },
  { id: 'suv', name: 'SUV', nameUr: 'ایس یو وی' },
  { id: 'hatchback', name: 'Hatchback', nameUr: 'ہیچ بیک' },
  { id: 'crossover', name: 'Crossover', nameUr: 'کراس اوور' },
  { id: 'coupe', name: 'Coupe', nameUr: 'کوپے' },
  { id: 'pickup', name: 'Pickup', nameUr: 'پک اپ' },
  { id: 'van', name: 'Van', nameUr: 'وین' }
];

interface CategoryBrowserProps {
  activeCategory?: string;
  onCategoryClick?: (id: string) => void;
  lang?: 'en' | 'ur';
}

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  activeCategory,
  onCategoryClick,
  lang = 'en'
}) => {
  return (
    <div className="w-full py-4 overflow-x-auto no-scrollbar flex items-center gap-3" id="category-browser-container">
      {CATEGORIES_DATA.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryClick?.(cat.id)}
            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer select-none border ${
              isActive
                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            {lang === 'en' ? cat.name : cat.nameUr}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryBrowser;
