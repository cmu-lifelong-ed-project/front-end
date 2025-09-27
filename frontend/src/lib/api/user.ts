import api, { authHeader } from "@/lib/axios";
import { User } from "@/types/api/user";

//// ==============================
//// User (ใช้ได้ทุก role)
//// ==============================
/**
 * GET /user/me
 * - ดึงข้อมูล user ตัวเอง
 */
export async function getUser(token?: string): Promise<User> {
  const res = await api.get("/user/me", {
    headers: authHeader(token),
  });
  return res.data;
}
