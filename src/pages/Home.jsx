import React, { useState, useMemo } from 'react';
import { db, auth } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EventCard from '@/components/custom/EventCard';
import EventFilters from '@/components/events/EventFilters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Plus, Calendar, TrendingUp, Users, Sparkles } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-asc');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => db.events.list('-created_date'),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => auth.me(),
  });

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(event =>
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (category !== 'all') {
      result = result.filter(event => event.category === category);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'popular':
          return (b.registrations_count || 0) - (a.registrations_count || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [events, searchQuery, category, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: events.length,
    upcoming: events.filter(e => new Date(e.date) >= new Date()).length,
    totalAttendees: events.reduce((acc, e) => acc + (e.registrations_count || 0), 0)
  }), [events]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-amber-500">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-amber-300" />
              <span className="text-white/90 font-medium">Dept. Informatics & Telecommunicatons UOI</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Panepistimiakos
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Discover, create, and join amazing events happening across campus. 
              Connect with fellow students and never miss out on the action.
            </p>
            
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 md:gap-8 mt-12 max-w-2xl mx-auto"
          >
            {[
              { icon: Calendar, label: 'Total Events', value: stats.total },
              { icon: TrendingUp, label: 'Upcoming', value: stats.upcoming },
              { icon: Users, label: 'Attendees', value: stats.totalAttendees }
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <stat.icon className="w-6 h-6 text-white/70 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Filters */}
        <div className="mb-8">
          <EventFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            category={category}
            setCategory={setCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-neutral-800">
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No events found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || category !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Be the first to create an event!'
              }
            </p>
            {user && (
              <Link to={createPageUrl('CreateEvent')}>
                <Button className="bg-amber-500 hover:bg-amber-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
