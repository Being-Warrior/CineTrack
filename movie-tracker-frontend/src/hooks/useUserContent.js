import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const useUserContent = (statusFilter = '') => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await api.get('/user-content', { params });
      setList(data);
    } catch {
      toast.error('Failed to load your list');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const addOrUpdate = async (tmdbData, status, rating) => {
    try {
      await api.post('/user-content', { tmdbData, status, rating });
      toast.success(`Added to ${status}`);
      fetchList();
    } catch {
      toast.error('Failed to save');
    }
  };

  const updateEntry = async (id, status, rating) => {
    try {
      await api.patch(`/user-content/${id}`, { status, rating });
      toast.success('Updated!');
      fetchList();
    } catch {
      toast.error('Failed to update');
    }
  };

  const removeEntry = async (id) => {
    try {
      await api.delete(`/user-content/${id}`);
      toast.success('Removed from list');
      fetchList();
    } catch {
      toast.error('Failed to remove');
    }
  };

  return { list, loading, addOrUpdate, updateEntry, removeEntry, refetch: fetchList };
};
