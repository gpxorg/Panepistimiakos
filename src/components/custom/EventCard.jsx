import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, Clock, MapPin, Users, Star, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// CUSTOM COMPONENT 1: EventCard - A beautifully designed card for displaying events
export default function EventCard({ event, index = 0 }) {
  const categoryColors = {
    academic: 'from-blue-500 to-indigo-600',
    social: 'from-pink-500 to-rose-600',
    sports: 'from-green-500 to-emerald-600',
    cultural: 'from-purple-500 to-violet-600',
    career: 'from-amber-500 to-orange-600',
    workshop: 'from-cyan-500 to-teal-600',
    other: 'from-slate-500 to-gray-600'
  };

  const categoryBadgeColors = {
    academic: 'bg-blue-100 text-blue-700',
    social: 'bg-pink-100 text-pink-700',
    sports: 'bg-green-100 text-green-700',
    cultural: 'bg-purple-100 text-purple-700',
    career: 'bg-amber-100 text-amber-700',
    workshop: 'bg-cyan-100 text-cyan-700',
    other: 'bg-slate-100 text-slate-700'
  };

  const spotsLeft = event.is_unlimited 
    ? 'Unlimited' 
    : Math.max(0, (event.capacity || 0) - (event.registrations_count || 0));

  const isFull = !event.is_unlimited && spotsLeft === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 dark:border-neutral-800">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[event.category] || categoryColors.other} opacity-90`} />
          {event.image_url && (
            <img 
              src={event.image_url} 
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            />
          )}
          
          {/* Floating Category Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm bg-white/90 ${categoryBadgeColors[event.category] || categoryBadgeColors.other}`}>
              {event.category?.charAt(0).toUpperCase() + event.category?.slice(1)}
            </span>
          </div>

          {/* Rating Badge */}
          {event.average_rating > 0 && (
            <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-slate-700">{event.average_rating.toFixed(1)}</span>
            </div>
          )}

          {/* Status Overlay */}
          {isFull && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
              <span className="px-4 py-2 bg-white rounded-full text-sm font-bold text-slate-800">
                Fully Booked
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {event.title}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>{event.date ? format(new Date(event.date), 'MMM dd, yyyy') : 'TBA'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{event.time || 'TBA'}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {event.registrations_count || 0} / {event.is_unlimited ? '∞' : event.capacity}
              </span>
            </div>
            
            <Link 
              to={createPageUrl(`EventDetails?id=${event.id}`)}
              className="flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
            >
              View Details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}