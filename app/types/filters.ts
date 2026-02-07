export enum OffenceCategory {
  Arson = 'Arson',
  Assaults = 'Assaults',
  AttemptedMurder = 'Attempted Murder',
  BreakAndEnter = 'Break and Enter',
  CriminalHarassment = 'Criminal Harassment',
  Homicide = 'Homicide',
  IndecentOrHarassingCommunications = 'Indecent or Harassing Communications',
  Mischief = 'Mischief',
  Robbery = 'Robbery',
  Theft5000AndUnder = 'Theft $5000 and Under',
  TheftOver5000 = 'Theft Over $5000',
  TheftOfMotorVehicle = 'Theft of Motor Vehicle',
  UtteringThreats = 'Uttering Threats',
}

export type CrimeDateRange = {
  startDate: string | null; // ISO yyyy-mm-dd
  endDate: string | null;
}

export type CrimeFilter = {
  dateRange: CrimeDateRange;
  category: OffenceCategory | null;
};