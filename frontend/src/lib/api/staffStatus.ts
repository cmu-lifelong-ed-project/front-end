import api, { authHeader } from "@/lib/axios";
import {
  StaffStatus,
  CreateStaffStatusInput,
  UpdateStaffStatusNameInput,
} from "@/types/api/status";

//// ============================================================
////                         admin เท่านั้น
//// ============================================================

/** POST /staffstatus
 *  สร้าง staff status ใหม่
 */
export async function createStaffStatus(
  body: CreateStaffStatusInput,
  token?: string
): Promise<StaffStatus> {
  const res = await api.post("/staffstatus", body, {
    headers: authHeader(token),
  });
  return res.data;
}

/** PUT /staffstatus/name
 *  แก้ไขชื่อ staff status
 */
export async function updateStaffStatusName(
  body: UpdateStaffStatusNameInput,
  token?: string
): Promise<StaffStatus> {
  const res = await api.put("/staffstatus/name", body, {
    headers: authHeader(token),
  });
  return res.data;
}

/** DELETE /staffstatus/:id
 *  ลบ staff status
 */
export async function deleteStaffStatus(
  id: number,
  token?: string
): Promise<{ message: string }> {
  const res = await api.delete(`/staffstatus/${id}`, {
    headers: authHeader(token),
  });
  return res.data;
}

//// ============================================================
////                         staff ขึ้นไป
//// ============================================================

/** GET /staffstatus
 *  ดึงข้อมูล staff status ทั้งหมด
 */
export async function getStaffStatuses(token?: string): Promise<StaffStatus[]> {
  const res = await api.get("/staffstatus", { headers: authHeader(token) });
  return res.data;
}
