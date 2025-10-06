export type OrderMapping = {
  id: number | string;
  order_id: number;
  checked: boolean;
  order: { id: number; title: string };
};

export type UpdateOrderInput = {
  order_id: number;
  list_queue_id: number;
  checked: boolean;
};

export type UpdateOrderNameInput = {
  order_id: number;
  title: string;
};
