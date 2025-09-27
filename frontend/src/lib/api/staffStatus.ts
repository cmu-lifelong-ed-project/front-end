import api, { authHeader } from "@/lib/axios";
import { StaffStatus } from "@/types/api/status";

//// ==============================
//// staff ขึ้นไป
//// ==============================
/**
 * GET /staffstatus
 * - ดึงข้อมูล staff status ทั้งหมด
 */
export async function getStaffStatuses(token?: string): Promise<StaffStatus[]> {
  const res = await api.get("/staffstatus", { headers: authHeader(token) });
  return res.data;
}
