import React from 'react';
import { db, auth } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EventForm from '@/components/events/EventForm';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function EditEvent() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => auth.me(),
  });

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => db.events.filter({ id: eventId }).then(res => res[0]),
    enabled: !!eventId
  });

  const updateEventMutation = useMutation({
    mutationFn: (data) => db.events.update(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Event updated successfully!');
      navigate(createPageUrl(`EventDetails?id=${eventId}`));
    },
    onError: () => {
      toast.error('Failed to update event. Please try again.');
    }
  });

  if (userLoading || eventLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="bg-white rounded-2xl p-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Sign In Required</h2>
          <p className="text-slate-500 mb-6">You need to be signed in to edit events.</p>
          <button
            onClick={() => auth.redirectToLogin()}
            className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Event Not Found</h2>
          <p className="text-slate-500 mb-4">The event you're trying to edit doesn't exist.</p>
          <Link to={createPageUrl('Home')}>
            <button className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors">
              Back to Events
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (user.email !== event.created_by) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-4">You can only edit events that you created.</p>
          <Link to={createPageUrl('Home')}>
            <button className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors">
              Back to Events
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            to={createPageUrl(`EventDetails?id=${eventId}`)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Event
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-100 rounded-xl">
              <Edit className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Edit Event</h1>
              <p className="text-slate-500">Update your event details</p>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8"
        >
          <EventForm
            event={event}
            onSubmit={(data) => updateEventMutation.mutate(data)}
            isSubmitting={updateEventMutation.isPending}
            currentUser={user}
          />
        </motion.div>
      </div>
    </div>
  );
}
