export type Product = Readonly<{
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}>;

export type Stock = Readonly<{
  id: number;
  amount: number;
}>;
