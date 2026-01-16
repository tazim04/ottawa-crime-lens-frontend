export interface MapCrimeRequestParams {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;

  zoom: number; // >= 0 (validated by backend)

  startDate?: string; // ISO date: YYYY-MM-DD
  endDate?: string; // ISO date: YYYY-MM-DD
}

export interface CrimeMapPoint {
  id: number;
  category: string;
  lat: number;
  lon: number;
  occurredDate: string; // ISO date string
}

export type MapDataType = 'GRID' | 'POINTS';

export interface GridCell {
  lon: number;
  lat: number;
  crimeCount: number;
}

export type MapDataResponse =
  | {
      type: 'GRID';
      data: GridCell[];
    }
  | {
      type: 'POINTS';
      data: CrimeMapPoint[];
    };
