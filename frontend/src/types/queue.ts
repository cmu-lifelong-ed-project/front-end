export type OrderMapping = {
    id: number | string;
    order_id: number;
    checked: boolean;
    order: { id: number; title: string };
  };
  
  export type UserStatus = { id: number; status: string; type: string };
  export type StaffStatus = { id: number; status: string; type: string; user_status?: UserStatus };
  export type StatusMapping = { staff_status_id: number; user_status_id: number };
  export type FacultyItem = { id: number; code: string; nameTH: string; nameEN: string };
  export type CourseStatus = { id: number; status: string; type: string };
  
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
  