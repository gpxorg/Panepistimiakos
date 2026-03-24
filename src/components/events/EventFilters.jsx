import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'academic', label: 'Academic' },
  { value: 'social', label: 'Social' },
  { value: 'sports', label: 'Sports' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'career', label: 'Career' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' }
];

const sortOptions = [
  { value: 'date-asc', label: 'Date (Earliest)' },
  { value: 'date-desc', label: 'Date (Latest)' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' }
];

export default function EventFilters({ 
  searchQuery, 
  setSearchQuery, 
  category, 
  setCategory, 
  sortBy, 
  setSortBy 
}) {
  const hasActiveFilters = searchQuery || category !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('all');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 p-4 md:p-6"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 rounded-xl focus:bg-white dark:focus:bg-neutral-700 transition-colors dark:text-neutral-100"
          />
        </div>

        {/* Category Filter */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full lg:w-48 h-12 bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 rounded-xl dark:text-neutral-100">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="dark:bg-neutral-900 dark:border-neutral-800">
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value} className="dark:text-neutral-200 dark:focus:bg-neutral-800">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full lg:w-44 h-12 bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 rounded-xl dark:text-neutral-100">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="dark:bg-neutral-900 dark:border-neutral-800">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="dark:text-neutral-200 dark:focus:bg-neutral-800">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-slate-100 dark:border-neutral-800"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-500 dark:text-slate-400">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm flex items-center gap-1">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-amber-900 dark:hover:text-amber-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {category !== 'all' && (
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm flex items-center gap-1">
                  {category}
                  <button onClick={() => setCategory('all')} className="hover:text-amber-900 dark:hover:text-amber-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Clear all
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}