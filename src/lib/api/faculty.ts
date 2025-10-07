import api, { authHeader } from "@/lib/axios";
import { Faculty } from "@/types/api/faculty";

//// ============================================================
////                         staff ขึ้นไป
//// ============================================================

/** GET /faculty
 *  ดึงข้อมูล faculty ทั้งหมด
 */
export async function getFaculties(token?: string): Promise<Faculty[]> {
  const res = await api.get("/faculty", { headers: authHeader(token) });
  return res.data;
}
