import api, { authHeader } from "@/lib/axios";
import { FacultyItem } from "@/types/api/faculty";

//// ==============================
//// staff ขึ้นไป
//// ==============================
/**
 * GET /faculty
 * - ดึงข้อมูล faculty ทั้งหมด
 */
export async function getFaculties(token?: string): Promise<FacultyItem[]> {
  const res = await api.get("/faculty", { headers: authHeader(token) });
  return res.data;
}
