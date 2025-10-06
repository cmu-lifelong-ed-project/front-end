import api, { authHeader } from "@/lib/axios";
import { User, UpdateUserInfoInput } from "@/types/api/user";

//// ============================================================
////                         admin เท่านั้น
//// ============================================================

/** GET /user/updateinfo/:email
 *  อัปเดตข้อมูล user (role และ คณะ)
 */
export async function updateUserInfo(
  email: string,
  body: UpdateUserInfoInput,
  token?: string
): Promise<{ message: string }> {
  const res = await api.put(`/user/updateinfo/${email}`, body, {
    headers: authHeader(token),
  });
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

//// ============================================================
////                         Middleware
//// ============================================================
/** GET /user/me
 *  ดึงข้อมูล user ตัวเอง (สำหรับ Middleware)
 */

export async function getUserEdge(token?: string) {
  if (!token) return undefined;
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 2000);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: ctrl.signal,
    });
    if (!res.ok) return undefined;
    return await res.json();
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}
