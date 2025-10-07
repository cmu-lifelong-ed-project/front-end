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
