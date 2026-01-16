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

export enum CrimeSource {
  OFFICIAL = 'OFFICIAL',
  USER = 'USER'
}
