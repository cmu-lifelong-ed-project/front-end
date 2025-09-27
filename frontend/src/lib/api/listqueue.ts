import api, { authHeader } from "@/lib/axios";
import type { CardItem } from "@/types/api/queue";

//// ==============================
//// LE ขึ้นไป
//// ==============================

/**
 * GET /listqueue
 * - ดึงรายการทั้งหมด (ทุกคิว ทุกคณะ)
 */
export async function getAllListQueues(token?: string): Promise<CardItem[]> {
  const res = await api.get("/listqueue", { headers: authHeader(token) });
  return res.data;
}

/**
 * GET /listqueue/status/notyet
 * - ดึงเฉพาะ queue ที่ยังไม่เสร็จสิ้น
 */
export async function getUnfinishedListQueues(
  token?: string
): Promise<CardItem[]> {
  const res = await api.get("/listqueue/status/notyet", {
    headers: authHeader(token),
  });
  return res.data;
}

/**
 * POST /listqueue/coursestatus
 * - ดึง queue ตามสถานะรายวิชา
 * - body: array ของ course_status_id
 */
export async function getListQueuesByCourseStatus(
  ids: number[],
  token?: string
): Promise<CardItem[]> {
  const res = await api.post("/listqueue/coursestatus", ids, {
    headers: authHeader(token),
  });
  return res.data;
}

//// ==============================
//// officer ขึ้นไป
//// ==============================

/**
 * GET /listqueue/faculty
 * - ดึงเฉพาะ queue ของคณะตัวเอง (derive จาก token)
 */
export async function getMyFacultyListQueues(
  token?: string
): Promise<CardItem[]> {
  const res = await api.get("/listqueue/faculty", {
    headers: authHeader(token),
  });
  return res.data;
}

//// ==============================
//// user ขึ้นไป
//// ==============================

/**
 * GET /listqueue/owner
 * - ดึงเฉพาะ queue ของ user เอง
 */
export async function getMyListQueues(token?: string): Promise<CardItem[]> {
  const res = await api.get("/listqueue/owner", {
    headers: authHeader(token),
  });
  return res.data;
}
