export interface Asset {
  AssetID: string;
  AssetName: string;
  Category: string;
  PurchaseDate: string;
  PurchasePrice: number;
  DepreciationValue: number;
  CurrentValue: number;
  LocationID: number;
  LocationName?: string;
  Department?: string;
  QRCode?: string;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
}
