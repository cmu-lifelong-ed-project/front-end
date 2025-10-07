import api, { authHeader } from "@/lib/axios";
import { User } from "@/types/api/user";

//// ============================================================
////                         staff ขึ้นไป
//// ============================================================

/** GET /staff
 *  ดึงข้อมูลเจ้าหน้าที่ที่มีสิทธิ์ในการจัดการคิว
 */
export async function getStaffs(token?: string): Promise<User[]> {
  const res = await api.get("/staff", { headers: authHeader(token) });
  return res.data;
}

//// ============================================================
////                         user ขึ้นไป
//// ============================================================

/** GET /user/me
 *  ดึงข้อมูล user ตัวเอง
 */
export async function getUser(token?: string): Promise<User> {
  const res = await api.get("/user/me", {
    headers: authHeader(token),
  });
  return res.data;
}
