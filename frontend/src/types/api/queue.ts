import { OrderMapping } from "./order";

export type CardItem = {
  id: number;
  priority: number;
  title: string;
  faculty: string;
  staff_id: number;
  staff_status: { id: number; status: string };
  user_status: { id: number; status: string };
  course_status_id?: number;
  note?: string;
  wordfile_submit?: string;
  info_submit?: string;
  info_submit_14days?: string;
  time_register?: string;
  date_left?: number;
  on_web?: string;
  appointment_date_aw?: string;
  order_mappings: OrderMapping[];
};
