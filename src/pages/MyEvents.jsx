import React, { useState, useMemo } from 'react';
import { db, auth } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EventCard from '@/components/custom/EventCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Plus, Calendar, CalendarCheck, Loader2 } from 'lucide-react';

export default function MyEvents() {
  const [activeTab, setActiveTab] = useState('created');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => auth.me(),
  });

  const { data: allEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => db.events.list('-created_date'),
    enabled: !!user
  });

  const { data: registrations = [], isLoading: registrationsLoading } = useQuery({
    queryKey: ['userRegistrations'],
    queryFn: () => db.registrations.filter({ user_email: user?.email, status: 'registered' }),
    enabled: !!user
  });

  const myCreatedEvents = useMemo(() => 
    allEvents.filter(e => e.created_by === user?.email),
    [allEvents, user]
  );

  const myRegisteredEvents = useMemo(() => {
    const registeredEventIds = registrations.map(r => r.event_id);
    return allEvents.filter(e => registeredEventIds.includes(e.id));
  }, [allEvents, registrations]);

  const displayedEvents = activeTab === 'created' ? myCreatedEvents : myRegisteredEvents;
  const isLoading = userLoading || eventsLoading || registrationsLoading;

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">Sign In Required</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Sign in to view your events.</p>
          <button
            onClick={() => auth.redirectToLogin()}
            className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">My Events</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your created and registered events</p>
          </div>
          <Link to={createPageUrl('CreateEvent')}>
            <Button className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white dark:bg-neutral-900 shadow-sm border border-slate-100 dark:border-neutral-800 p-1 rounded-xl">
              <TabsTrigger 
                value="created" 
                className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-lg px-4 py-2"
              >
                <Calendar className="w-4 h-4" />
                Created ({myCreatedEvents.length})
              </TabsTrigger>
              <TabsTrigger 
                value="registered" 
                className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-lg px-4 py-2"
              >
                <CalendarCheck className="w-4 h-4" />
                Registered ({myRegisteredEvents.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
        ) : displayedEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800"
          >
            {activeTab === 'created' ? (
              <>
                <Calendar className="w-16 h-16 text-slate-200 dark:text-neutral-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">No events created yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Start by creating your first event!</p>
                <Link to={createPageUrl('CreateEvent')}>
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <CalendarCheck className="w-16 h-16 text-slate-200 dark:text-neutral-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">No registered events</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Browse events and register for ones you're interested in!</p>
                <Link to={createPageUrl('Home')}>
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    Browse Events
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
