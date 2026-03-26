export enum CrimeSource {
  OFFICIAL = 'OFFICIAL',
  USER = 'USER'
}

export type CrimeDetail = {
  id: number;
  goNumber: string;
  offenceSummary: string;
  offenceCategory: string;
  neighbourhood: string;
  intersection: string;
  occurredDate: string; // ISO date string (yyyy-mm-dd)
  occurredHour: number;
  reportedDate: string; // ISO date string (yyyy-mm-dd)
  reportedHour: number;
  source: CrimeSource;
};

export type GridStatsRequestParams = {
  gridId: number;
};

export type GridAnomaly = {
  date: string;
  anomalyScore: string | number;
  modelVersion: string;
  triagePercentile: string | number;
  triageLabel: string;
  triageExplanation: string;
};

export type GridStat = {
  id: number;
  totalCrimes: number;
  avgCrimesPerYear: number;
  crimesLastYear: number;
  crimesLast5Years: number;
  crimesLast10Years: number;
  mostCommonCrimeAllTime: string | null;
  mostCommonCrimeLastYear: string | null;
  mostCommonCrimeLast5Years: string | null;
  mostCommonCrimeLast10Years: string | null;
  firstReported: string | null; // ISO date (YYYY-MM-DD)
  lastReported: string | null; // ISO date (YYYY-MM-DD)
  anomaly: GridAnomaly | null;
  empty: boolean;
};
