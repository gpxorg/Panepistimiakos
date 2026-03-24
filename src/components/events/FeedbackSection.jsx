import React, { useState } from 'react';
import { db } from '@/api/supabaseClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import StarRating from '@/components/custom/StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, User, Reply, CornerDownRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FeedbackSection({ eventId, feedbacks = [], currentUser, canGiveFeedback, isOwner }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const queryClient = useQueryClient();

  const hasUserFeedback = feedbacks.some(f => f.user_email === currentUser?.email);

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data) => {
      const feedback = await db.feedbacks.create(data);
      
      const allFeedbacks = [...feedbacks, { rating: data.rating }];
      const avgRating = allFeedbacks.reduce((acc, f) => acc + f.rating, 0) / allFeedbacks.length;
      
      await db.events.update(eventId, {
        average_rating: Math.round(avgRating * 10) / 10,
        total_ratings: allFeedbacks.length
      });
      
      return feedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      setRating(0);
      setComment('');
      setShowForm(false);
      toast.success('Thank you for your feedback!');
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    }
  });

  const submitReplyMutation = useMutation({
    mutationFn: async ({ feedbackId, reply }) => {
      await db.feedbacks.update(feedbackId, {
        organizer_reply: reply,
        organizer_reply_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', eventId] });
      setReplyingTo(null);
      setReplyText('');
      toast.success('Reply posted successfully!');
    },
    onError: () => {
      toast.error('Failed to post reply');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    submitFeedbackMutation.mutate({
      event_id: eventId,
      user_email: currentUser.email,
      user_name: currentUser.full_name || currentUser.email,
      rating,
      comment: comment.trim()
    });
  };

  const handleReplySubmit = (feedbackId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    submitReplyMutation.mutate({ feedbackId, reply: replyText.trim() });
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <MessageSquare className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Feedback & Reviews</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{feedbacks.length} reviews</p>
            </div>
          </div>
          
          {currentUser && !hasUserFeedback && (
            <Button
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? "outline" : "default"}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {showForm ? 'Cancel' : 'Write Review'}
            </Button>
          )}
        </div>
      </div>

      {/* Feedback Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-slate-100 dark:border-neutral-800 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-6 bg-slate-50 dark:bg-neutral-800/50 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Rating</label>
                <StarRating rating={rating} onRatingChange={setRating} size="lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Review (Optional)</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                  className="resize-none dark:bg-neutral-800 dark:border-neutral-700"
                />
              </div>
              
              <Button
                type="submit"
                disabled={submitFeedbackMutation.isPending}
                className="w-full bg-amber-500 hover:bg-amber-600"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitFeedbackMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback List */}
      <div className="divide-y divide-slate-100 dark:divide-neutral-800">
        {feedbacks.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-slate-200 dark:text-neutral-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          feedbacks.map((feedback, index) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold text-sm">
                  {feedback.user_name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-800 dark:text-slate-100">{feedback.user_name}</span>
                    <span className="text-xs text-slate-400 dark:text-neutral-500">
                      {feedback.created_date && format(new Date(feedback.created_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <StarRating rating={feedback.rating} readOnly size="sm" />
                  {feedback.comment && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{feedback.comment}</p>
                  )}

                  {/* Organizer Reply */}
                  {feedback.organizer_reply && (
                    <div className="mt-3 ml-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-2 border-amber-500">
                      <div className="flex items-center gap-2 mb-1">
                        <CornerDownRight className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Organizer Reply</span>
                        {feedback.organizer_reply_date && (
                          <span className="text-xs text-amber-600/70 dark:text-amber-500/70">
                            • {format(new Date(feedback.organizer_reply_date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{feedback.organizer_reply}</p>
                    </div>
                  )}

                  {/* Reply Button for Owner */}
                  {isOwner && !feedback.organizer_reply && (
                    <div className="mt-2">
                      {replyingTo === feedback.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            rows={2}
                            className="resize-none text-sm dark:bg-neutral-800 dark:border-neutral-700"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleReplySubmit(feedback.id)}
                              disabled={submitReplyMutation.isPending}
                              className="bg-amber-500 hover:bg-amber-600"
                            >
                              {submitReplyMutation.isPending ? 'Posting...' : 'Post Reply'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(feedback.id)}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        >
                          <Reply className="w-3.5 h-3.5 mr-1" />
                          Reply
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
