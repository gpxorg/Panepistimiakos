import React from 'react';
import { db, auth } from '@/api/supabaseClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EventForm from '@/components/events/EventForm';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CreateEvent() {
  const navigate = useNavigate();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => auth.me(),
  });

  const createEventMutation = useMutation({
    mutationFn: async (data) => {
      const user = await auth.me();
      return db.events.create({
        ...data,
        created_by: user.email,  // THIS IS CRITICAL
        organizer_email: user.email,
        organizer_name: user.full_name || user.email,
        registrations_count: 0,
        average_rating: 0,
        total_ratings: 0,
        status: 'upcoming'
      });
    },
    onSuccess: (newEvent) => {
      toast.success('Event created successfully!');
      navigate(createPageUrl(`EventDetails?id=${newEvent.id}`));
    },
    onError: () => {
      toast.error('Failed to create event. Please try again.');
    }
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">Sign In Required</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">You need to be signed in to create an event.</p>
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            to={createPageUrl('Home')}
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Plus className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">Create New Event</h1>
              <p className="text-slate-500 dark:text-slate-400">Fill in the details to create your event</p>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 p-6 md:p-8"
        >
          <EventForm
            onSubmit={(data) => createEventMutation.mutate(data)}
            isSubmitting={createEventMutation.isPending}
            currentUser={user}
          />
        </motion.div>
      </div>
    </div>
  );
}
