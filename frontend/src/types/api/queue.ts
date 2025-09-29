import { Faculty } from "./faculty";
import { StaffStatus, CourseStatus } from "./status";
import { OrderMapping } from "./order";
import { User } from "./user";

export type ListQueue = {
  id: number;
  priority: number;
  title: string;
  faculty_id: number;
  faculty: Faculty;
  staff_id: number;
  staff: User;
  staff_status_id: number;
  staff_status: StaffStatus;
  course_status_id: number;
  course_status: CourseStatus;
  wordfile_submit: string;
  info_submit: string;
  info_submit_14days: string;
  time_register: string;
  on_web: string;
  appointment_date_aw: string;
  date_left: number;
  note: string;
  order_mappings: OrderMapping[];
  duration_of_operation_from_the_memo?: number;
  duration_of_work_from_word_file?: number;
  owner: string[];
  created_at: string;
  updated_at: string;
};

export type CreateListQueueInput = {
  title: string;
  staff_id: number;
  faculty_id: number;
  staff_status_id: number;
  course_status_id: number;
  wordfile_submit: string;
  info_submit: string;
  info_submit_14days: string;
  time_register: string;
  on_web: string;
  appointment_date_aw: string;
  note?: string;
};

export type UpdateListQueueInput = CreateListQueueInput & {
  id: number;
};

export type UpdateListQueuePriorityInput = {
  id: number;
  priority: number;
};
