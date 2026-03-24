import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

// CUSTOM COMPONENT 2: StarRating - Interactive star rating component
export default function StarRating({ 
  rating = 0, 
  onRatingChange, 
  readOnly = false, 
  size = 'md',
  showValue = false 
}) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const containerSizes = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5'
  };

  const displayRating = hoverRating || rating;

  const handleClick = (value) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  return (
    <div className={`flex items-center ${containerSizes[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          whileHover={!readOnly ? { scale: 1.15 } : {}}
          whileTap={!readOnly ? { scale: 0.95 } : {}}
          className={`relative ${!readOnly ? 'cursor-pointer' : 'cursor-default'} focus:outline-none`}
        >
          {/* Background Star */}
          <Star 
            className={`${sizes[size]} text-slate-200 transition-colors duration-200`}
          />
          
          {/* Filled Star Overlay */}
          <motion.div
            initial={false}
            animate={{
              clipPath: star <= displayRating 
                ? 'inset(0 0 0 0)' 
                : 'inset(0 100% 0 0)'
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Star 
              className={`${sizes[size]} fill-amber-400 text-amber-400`}
            />
          </motion.div>

          {/* Glow Effect on Hover */}
          {!readOnly && hoverRating >= star && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 -z-10"
            >
              <Star 
                className={`${sizes[size]} fill-amber-200 text-amber-200 blur-sm`}
              />
            </motion.div>
          )}
        </motion.button>
      ))}
      
      {showValue && (
        <span className={`ml-2 font-semibold text-slate-600 ${
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
        }`}>
          {rating > 0 ? rating.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
}