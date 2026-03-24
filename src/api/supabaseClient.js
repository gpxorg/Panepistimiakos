import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions to match Base44 SDK pattern
export const db = {
  events: {
    list: async (orderBy = '-created_date') => {
      const ascending = !orderBy.startsWith('-');
      const column = orderBy.replace('-', '');
      const { data } = await supabase.from('events').select('*').order(column, { ascending });
      return data || [];
    },
    filter: async (filters) => {
      let query = supabase.from('events').select('*');
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data } = await query;
      return data || [];
    },
    create: async (eventData) => {
      const { data } = await supabase.from('events').insert(eventData).select().single();
      return data;
    },
    update: async (id, eventData) => {
      const { data } = await supabase.from('events').update(eventData).eq('id', id).select().single();
      return data;
    },
    delete: async (id) => {
      await supabase.from('events').delete().eq('id', id);
    }
  },
registrations: {
  list: async (orderBy = '-created_date') => {
    const ascending = !orderBy.startsWith('-');
    const column = orderBy.replace('-', '');
    const { data } = await supabase.from('registrations').select('*').order(column, { ascending });
    return data || [];
  },
  filter: async (filters) => {
    let query = supabase.from('registrations').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data } = await query;
    return data || [];
  },
  create: async (regData) => {
    const { data } = await supabase.from('registrations').insert(regData).select().single();
    return data;
  },
  update: async (id, regData) => {
    const { data } = await supabase.from('registrations').update(regData).eq('id', id).select().single();
    return data;
  },
  delete: async (id) => {
    await supabase.from('registrations').delete().eq('id', id);
  }
}, feedbacks: {
  list: async (orderBy = '-created_date') => {
    const ascending = !orderBy.startsWith('-');
    const column = orderBy.replace('-', '');
    const { data } = await supabase.from('feedbacks').select('*').order(column, { ascending });
    return data || [];
  },
  filter: async (filters) => {
    let query = supabase.from('feedbacks').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data } = await query;
    return data || [];
  },
  create: async (feedbackData) => {
    const { data } = await supabase.from('feedbacks').insert(feedbackData).select().single();
    return data;
  },
  update: async (id, feedbackData) => {
    const { data } = await supabase.from('feedbacks').update(feedbackData).eq('id', id).select().single();
    return data;
  },
  delete: async (id) => {
    await supabase.from('feedbacks').delete().eq('id', id);
  }
}};

export const auth = {
  me: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
      role: 'user'
    };
  },
  logout: async (redirectUrl) => {
    await supabase.auth.signOut();
    window.location.href = redirectUrl || '/';
  },
  redirectToLogin: () => {
    window.location.href = '/login';
  }
};

// File upload
export const uploadFile = async (file) => {
  const fileName = `${Date.now()}_${file.name}`;
  const { data } = await supabase.storage.from('uploads').upload(fileName, file);
  if (data) {
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
    return { file_url: publicUrl };
  }
  return null;
};
