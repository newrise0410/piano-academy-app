// src/hooks/useActivities.js
import { useState, useEffect } from 'react';
import { getRecentActivities } from '../services/dashboardService';

export default function useActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getRecentActivities();
      setActivities(data);
    } catch (error) {
      console.error('활동 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return { activities, loading, refresh: loadData };
}