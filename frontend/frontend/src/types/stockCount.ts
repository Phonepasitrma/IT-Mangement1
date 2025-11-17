export interface StockCount {
  CountID: number;
  LocationID: number;
  LocationName?: string;
  AssetID: string;
  AssetName?: string;
  UserID: number;
  UserName?: string;
  CountDate: string;
  Status: 'Matched' | 'Missing' | 'Extra';
  Notes?: string;
}
