export type OrderMapping = {
  id: number | string;
  order_id: number;
  checked: boolean;
  order: { id: number; title: string };
};
