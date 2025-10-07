export type RoleKey = "admin" | "staff" | "LE" | "officer" | "user";

export const ROLE_ITEMS: Record<RoleKey, string[]> = {
  admin: ["แก้ไขการตั้งค่าเว็บไซต์", "ข้อมูลเชิงลึก", "การจัดการสมาชิกบัญชี"],
  staff: ["ข้อมูลเชิงลึก"],
  LE: ["เข้าถึงรายงาน LE", "จัดการกิจกรรม LE"],
  officer: ["เข้าถึงระบบเจ้าหน้าที่", "ตรวจสอบสถานะผู้ใช้"],
  user: [],
};

export const ROLE_LABEL: Record<RoleKey, string> = {
  admin: "Admin",
  staff: "Staff",
  LE: "LE",
  officer: "Officer",
  user: "User",
};

export const ROLE_HEADING: Record<RoleKey, string> = {
  admin: "แอดมิน",
  staff: "สตาฟ",
  LE: "LE",
  officer: "เจ้าหน้าที่",
  user: "อาจารย์",
};

export const ROLE_BADGE: Record<string, string> = {
  admin: "แอดมิน",
  staff: "เจ้าหน้าที่",
  LE: "บุคลากร LE",
  officer: "เจ้าหน้าที่",
  user: "อาจารย์",
};
