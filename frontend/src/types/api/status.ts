export type CourseStatus = {
  id: number;
  status: string;
  type?: string;
};
export enum StaffStatusType {
  None = "None",
  Processing = "Processing",
  Done = "Done",
  Cancel = "Cancel",
}

export type StaffStatus = {
  id: number;
  status: string;
  type: StaffStatusType | string;
};

export type CreateStaffStatusInput = {
  status: string;
  type: StaffStatusType;
};

export type UpdateStaffStatusNameInput = {
  id: number;
  status: string;
};
