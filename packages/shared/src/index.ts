export interface IDoSpiderDto {
  urls: string[];
  headless: boolean;
  sleepSecond: number;
}

export interface RankingItem {
  rank: string;
  asin: string;
  imgUrl: string;
  title: string;
  price: number;
  rate: number | undefined;
  rateCount: number | undefined;
  listingSales: string | undefined;
  asinSales: string | undefined;
  revenus: string | undefined;
  brand: string | undefined;
  seller: string | undefined;
}
