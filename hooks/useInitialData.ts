
import { useState, useEffect, useCallback } from 'react';
import { Recruit, ResearchDocument, Feedback, User } from '../types';
import { api } from '../api';

export const useInitialData = (user: User | null, sessionYear: number | null) => {
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!user || !sessionYear) return;
    setIsLoading(true);
    try {
      const [rData, dData, fData] = await Promise.all([
        api.getRecruits(), 
        api.getDocuments(), 
        api.getFeedbacks()
      ]);
      if (rData) setRecruits(rData);
      if (dData) setDocuments(dData);
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
    documents,
    feedbacks,
    isLoading,
    fetchAllData
  };
};
