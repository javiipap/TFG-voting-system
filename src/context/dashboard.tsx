'use client';

import Candidate from '@/database/models/candidate';
import Voter from '@/database/models/voter';
import { createContext } from 'react';

type DashboardContextType = {
  voters: Voter[];
  candidates: Candidate[];
  name: string;
  description: string;
  startDate: string;
  endDate: string;
};

export const DashboardContext = createContext<DashboardContextType>({
  voters: [],
  candidates: [],
  name: '',
  description: '',
  startDate: '',
  endDate: '',
});
