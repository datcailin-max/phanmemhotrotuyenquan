
import { useState, useEffect, useCallback } from 'react';
import { Recruit, Feedback, User } from '../types';
import { api } from '../api';

export const useInitialData = (user: User | null, sessionYear: number | null) => {
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!user || !sessionYear) return;
    setIsLoading(true);
    try {
      const [rData, fData] = await Promise.all([
        api.getRecruits(), 
        api.getFeedbacks()
      ]);
      if (rData) setRecruits(rData);
      if (fData) setFeedbacks(fData);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionYear]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    recruits,
    setRecruits,
    feedbacks,
    isLoading,
    fetchAllData
  };
};
