import api, { authHeader } from "@/lib/axios";
import { CourseStatus } from "@/types/api/status";

//// ============================================================
////                         staff ขึ้นไป
//// ============================================================

/** GET /course/status
 *  ดึงข้อมูล course status ทั้งหมด
 */
export async function getCourseStatuses(
  token?: string
): Promise<CourseStatus[]> {
  const res = await api.get("/course/status", { headers: authHeader(token) });
  return res.data;
}
