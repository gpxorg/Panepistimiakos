import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { uploadFile } from '@/api/supabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUploader from '@/components/custom/FileUploader';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, FileText, Loader2 } from 'lucide-react';

const categories = [
  { value: 'academic', label: 'Academic' },
  { value: 'social', label: 'Social' },
  { value: 'sports', label: 'Sports' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'career', label: 'Career' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' }
];

export default function EventForm({ event, onSubmit, isSubmitting, currentUser }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    end_time: '',
    location: '',
    capacity: 50,
    is_unlimited: false,
    category: 'other',
    image_url: '',
    file_url: '',
    file_name: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        time: event.time || '',
        end_time: event.end_time || '',
        location: event.location || '',
        capacity: event.capacity || 50,
        is_unlimited: event.is_unlimited || false,
        category: event.category || 'other',
        image_url: event.image_url || '',
        file_url: event.file_url || '',
        file_name: event.file_name || ''
      });
    }
  }, [event]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Event title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Start time is required';
    if (!formData.is_unlimited && (!formData.capacity || formData.capacity < 1)) {
      newErrors.capacity = 'Capacity must be at least 1';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      organizer_name: currentUser?.full_name || currentUser?.email,
      organizer_email: currentUser?.email
    });
  };

  const handleImageUpload = async (file) => {
    setUploading(true);
    const result = await uploadFile(file);
    if (result?.file_url) {
      setFormData({ ...formData, image_url: result.file_url });
    }
    setUploading(false);
  };

  const handleFileUpload = (fileData) => {
    handleChange('file_url', fileData?.url || '');
    handleChange('file_name', fileData?.name || '');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-slate-700">Event Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter event title"
          className={`mt-1.5 ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-slate-700">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe your event..."
          rows={4}
          className="mt-1.5 resize-none"
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date *
          </Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className={`mt-1.5 ${errors.date ? 'border-red-500' : ''}`}
          />
          {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
        </div>
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Start Time *
          </Label>
          <Input
            type="time"
            value={formData.time}
            onChange={(e) => handleChange('time', e.target.value)}
            className={`mt-1.5 ${errors.time ? 'border-red-500' : ''}`}
          />
          {errors.time && <p className="text-sm text-red-500 mt-1">{errors.time}</p>}
        </div>
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            End Time
          </Label>
          <Input
            type="time"
            value={formData.end_time}
            onChange={(e) => handleChange('end_time', e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <Label className="text-slate-700 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location
        </Label>
        <Input
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="e.g., University Auditorium, Room 101"
          className="mt-1.5"
        />
      </div>

      {/* Category */}
      <div>
        <Label className="text-slate-700">Category</Label>
        <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Capacity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Capacity
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Unlimited</span>
            <Switch
              checked={formData.is_unlimited}
              onCheckedChange={(checked) => handleChange('is_unlimited', checked)}
            />
          </div>
        </div>
        {!formData.is_unlimited && (
          <Input
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 1)}
            placeholder="Maximum attendees"
            className={errors.capacity ? 'border-red-500' : ''}
          />
        )}
        {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
      </div>

      {/* Image Upload */}
      <FileUploader
        onFileUpload={handleImageUpload}
        accept="image/*"
        label="Event Cover Image"
        description="Upload an image for your event"
        currentFile={formData.image_url ? { url: formData.image_url, name: 'Current image' } : null}
      />

      {/* File Attachment */}
      <FileUploader
        onFileUpload={handleFileUpload}
        label="Attach Document"
        description="Upload agenda, schedule, or other documents"
        currentFile={formData.file_url ? { url: formData.file_url, name: formData.file_name } : null}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {event ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          event ? 'Update Event' : 'Create Event'
        )}
      </Button>
    </motion.form>
  );
}
