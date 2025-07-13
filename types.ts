
export enum MovementType {
  DEPOSITO = 'DEPOSITO',
  RETIRO = 'RETIRO',
}

export enum TradeType {
  COMPRA = 'COMPRA',
  VENTA = 'VENTA',
}

export interface BRLMovement {
  id: string;
  type: MovementType;
  date: string;
  brlValue: number;
  proof: string;
}

export interface AssetTrade {
  id: string;
  currency: string;
  type: TradeType;
  date: string;
  brlValue: number;
  rate: number;
  amount: number;
  fee: number;
  feeValue: number;
  netAmount: number;
  finalRate: number;
}

export interface AssetMovement {
  id: string;
  currency: string;
  type: MovementType;
  date: string;
  amount: number;
  networkFee: number;
  hash: string;
}