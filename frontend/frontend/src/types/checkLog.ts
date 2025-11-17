export interface CheckLog {
  LogID: number;
  AssetID: string;
  AssetName?: string;
  UserID: number;
  UserName?: string;
  LocationID: number;
  LocationName?: string;
  ActionType: 'CheckIn' | 'CheckOut';
  Timestamp: string;
  Notes?: string;
}
