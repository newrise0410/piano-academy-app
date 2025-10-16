// src/hooks/useDashboard.js
import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/dashboardService';

export default function useDashboard() {
  const [stats, setStats] = useState({
    todayClasses: 0,
    unpaidStudents: 0,
    makeupClasses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refresh: loadData };
}