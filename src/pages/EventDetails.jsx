import React, { useState } from 'react';
import { db, auth } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import StarRating from '@/components/custom/StarRating';
import FeedbackSection from '@/components/events/FeedbackSection';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Calendar, Clock, MapPin, Users, Star, ArrowLeft,
  Edit, Trash2, Download, Share2, UserPlus, UserMinus,
  Loader2, CheckCircle, ExternalLink
} from 'lucide-react';

export default function EventDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => auth.me()
  });

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => db.events.filter({ id: eventId }).then(res => res[0]),
    enabled: !!eventId
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['registrations', eventId],
    queryFn: () => db.registrations.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['feedbacks', eventId],
    queryFn: () => db.feedbacks.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const isOwner = user?.email === event?.created_by;
  const userRegistration = registrations.find(r => r.user_email === user?.email && r.status === 'registered');
  const isRegistered = !!userRegistration;
  const isPastEvent = event?.date && new Date(event.date) < new Date();
  const isFull = !event?.is_unlimited && (event?.registrations_count || 0) >= (event?.capacity || 0);
  const canRegister = user && !isOwner && !isRegistered && !isFull && !isPastEvent;
  const canGiveFeedback = user && isRegistered && isPastEvent;

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      await db.registrations.create({
        event_id: eventId,
        user_email: user.email,
        user_name: user.full_name || user.email,
        registered_at: new Date().toISOString()
      });
      await db.events.update(eventId, {
        registrations_count: (event.registrations_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['registrations', eventId] });
      toast.success('Successfully registered for the event!');
    },
    onError: () => {
      toast.error('Failed to register. Please try again.');
    }
  });

  // Unregister mutation
  const unregisterMutation = useMutation({
    mutationFn: async () => {
      await db.registrations.update(userRegistration.id, { status: 'cancelled' });
      await db.events.update(eventId, {
        registrations_count: Math.max(0, (event.registrations_count || 0) - 1)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['registrations', eventId] });
      toast.success('Registration cancelled.');
    },
    onError: () => {
      toast.error('Failed to cancel registration.');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await db.events.delete(eventId);
    },
    onSuccess: () => {
      toast.success('Event deleted successfully.');
      navigate(createPageUrl('Home'));
    },
    onError: () => {
      toast.error('Failed to delete event.');
    }
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const categoryColors = {
    academic: 'bg-blue-100 text-blue-700',
    social: 'bg-pink-100 text-pink-700',
    sports: 'bg-green-100 text-green-700',
    cultural: 'bg-purple-100 text-purple-700',
    career: 'bg-amber-100 text-amber-700',
    workshop: 'bg-cyan-100 text-cyan-700',
    other: 'bg-slate-100 text-slate-700'
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-64 md:h-96 rounded-2xl mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-6" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">Event Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">The event you're looking for doesn't exist.</p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-amber-500 hover:bg-amber-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900">
      {/* Header Image */}
      <div className="relative h-64 md:h-96 bg-amber-500 overflow-hidden">
        {event.image_url && (
          <img 
            src={event.image_url} 
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Back Button */}
        <Link 
          to={createPageUrl('Home')} 
          className="absolute top-4 left-4 md:top-6 md:left-6 p-2.5 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          {isOwner && (
            <>
              <Link to={createPageUrl(`EditEvent?id=${event.id}`)}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                >
                  <Edit className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-500/80 backdrop-blur-sm hover:bg-red-600 text-white"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-6 left-6">
          <Badge className={categoryColors[event.category]}>
            {event.category?.charAt(0).toUpperCase() + event.category?.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-16 relative z-10 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-slate-100 dark:border-neutral-800 overflow-hidden"
        >
          <div className="p-6 md:p-8">
            {/* Title & Rating */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{event.title}</h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Organized by <span className="font-medium text-slate-700 dark:text-slate-300">{event.organizer_name}</span>
                </p>
              </div>
              {event.average_rating > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
                  <StarRating rating={event.average_rating} readOnly size="sm" />
                  <span className="font-semibold text-amber-700">{event.average_rating.toFixed(1)}</span>
                  <span className="text-sm text-amber-600">({event.total_ratings} reviews)</span>
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-xl">
                <Calendar className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    {event.date ? format(new Date(event.date), 'EEEE, MMMM d, yyyy') : 'TBA'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-xl">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Time</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    {event.time}{event.end_time ? ` - ${event.end_time}` : ''}
                  </p>
                </div>
              </div>
              {event.location && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-xl">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{event.location}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-xl">
                <Users className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Capacity</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    {event.registrations_count || 0} / {event.is_unlimited ? 'Unlimited' : event.capacity}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">About this event</h3>
                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Attached File */}
            {event.file_url && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{event.file_name || 'Attached Document'}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Event document</p>
                    </div>
                  </div>
                  <a
                    href={event.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium"
                  >
                    View <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Registration Button */}
            {user && !isOwner && (
              <div className="mt-8">
                {isRegistered ? (
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">You're registered for this event!</span>
                    </div>
                    {!isPastEvent && (
                      <Button
                        variant="outline"
                        onClick={() => unregisterMutation.mutate()}
                        disabled={unregisterMutation.isPending}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        {unregisterMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <UserMinus className="w-4 h-4 mr-2" />
                        )}
                        Cancel Registration
                      </Button>
                    )}
                  </div>
                ) : canRegister ? (
                  <Button
                    onClick={() => registerMutation.mutate()}
                    disabled={registerMutation.isPending}
                    className="w-full md:w-auto h-12 px-8 bg-amber-500 hover:bg-amber-600"
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Register for Event
                  </Button>
                ) : isFull ? (
                  <div className="text-center p-4 bg-slate-100 dark:bg-neutral-800 rounded-xl text-slate-600 dark:text-neutral-300">
                    This event is fully booked
                  </div>
                ) : isPastEvent ? (
                  <div className="text-center p-4 bg-slate-100 dark:bg-neutral-800 rounded-xl text-slate-600 dark:text-neutral-300">
                    This event has already ended
                  </div>
                ) : null}
              </div>
            )}

            {!user && (
              <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                <p className="text-slate-600 dark:text-slate-300 mb-3">Sign in to register for this event</p>
                <Button
                  onClick={() => auth.redirectToLogin()}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Feedback Section */}
        <div className="mt-8">
          <FeedbackSection
            eventId={eventId}
            feedbacks={feedbacks}
            currentUser={user}
            canGiveFeedback={canGiveFeedback}
            isOwner={isOwner}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
              All registrations and feedback will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
