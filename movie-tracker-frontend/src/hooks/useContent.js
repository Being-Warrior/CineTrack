import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const useContent = (statusFilter = '') => {
  const [list, setList]     = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await api.get('/content', { params });
      setList(data);
    } catch {
      toast.error('Failed to load your list');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const addContent = async (formData) => {
    try {
      await api.post('/content', formData);
      toast.success('Added to your list!');
      fetchList();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
      return false;
    }
  };

  const updateContent = async (id, updates) => {
    try {
      await api.patch(`/content/${id}`, updates);
      toast.success('Updated!');
      fetchList();
    } catch {
      toast.error('Failed to update');
    }
  };

  const deleteContent = async (id) => {
    try {
      await api.delete(`/content/${id}`);
      toast.success('Removed');
      fetchList();
    } catch {
      toast.error('Failed to remove');
    }
  };

  return { list, loading, addContent, updateContent, deleteContent, refetch: fetchList };
};
