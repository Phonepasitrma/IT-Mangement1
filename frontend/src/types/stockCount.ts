export interface StockCount {
  CountID: number;
  LocationID: number;
  LocationName?: string;
  AssetID: string;
  ModelName?: string;
  Brand?: string;
  UserID: number;
  UserName?: string;
  CountDate: string;
  Status: 'Matched' | 'Missing' | 'Extra';
  Notes?: string;
}
