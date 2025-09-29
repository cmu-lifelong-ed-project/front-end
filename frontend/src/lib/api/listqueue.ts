import api, { authHeader } from "@/lib/axios";
import {
  ListQueue,
  CreateListQueueInput,
  UpdateListQueueInput,
  UpdateListQueuePriorityInput,
} from "@/types/api/queue";

//// ============================================================
////                         staff ขึ้นไป
//// ============================================================

/** POST /listqueue
 *  สร้างคิวใหม่
 */
export async function createListQueue(
  body: CreateListQueueInput,
  token?: string
): Promise<ListQueue> {
  const res = await api.post("/listqueue", body, {
    headers: authHeader(token),
  });
  return res.data;
}

/** POST /listqueue
 *  อัปเดตข้อมูลคิว
 */
export async function updateListQueue(
  body: UpdateListQueueInput,
  token?: string
): Promise<ListQueue> {
  const res = await api.put("/listqueue", body, { headers: authHeader(token) });
  return res.data;
}

/** POST /listqueue
 *  อัปเดตลำดับ priority ของคิว
 */
export async function updateListQueuePriority(
  body: UpdateListQueuePriorityInput,
  token?: string
): Promise<ListQueue> {
  const res = await api.put("/listqueue", body, { headers: authHeader(token) });
  return res.data;
}

//// ============================================================
////                           LE ขึ้นไป
//// ============================================================

/** GET /listqueue
 *  ดึงรายการทั้งหมด (ทุกคิว ทุกคณะ)
 */
export async function getAllListQueues(token?: string): Promise<ListQueue[]> {
  const res = await api.get("/listqueue", { headers: authHeader(token) });
  return res.data;
}

/** GET /listqueue/status/notyet
 *  ดึงเฉพาะ queue ที่ยังไม่เสร็จสิ้น
 */
export async function getUnfinishedListQueues(
  token?: string
): Promise<ListQueue[]> {
  const res = await api.get("/listqueue/status/notyet", {
    headers: authHeader(token),
  });
  return res.data;
}

/** POST /listqueue/coursestatus
 *  ดึง queue ตามสถานะรายวิชา
 */
export async function getListQueuesByCourseStatus(
  ids: number[],
  token?: string
): Promise<ListQueue[]> {
  const res = await api.post("/listqueue/coursestatus", ids, {
    headers: authHeader(token),
  });
  return res.data;
}

//// ============================================================
////                        officer ขึ้นไป
//// ============================================================

/** GET /listqueue/faculty
 *  ดึงเฉพาะ queue ของคณะตัวเอง (derive จาก token)
 */
export async function getMyFacultyListQueues(
  token?: string
): Promise<ListQueue[]> {
  const res = await api.get("/listqueue/faculty", {
    headers: authHeader(token),
  });
  return res.data;
}
//// ============================================================
////                         user ขึ้นไป
//// ============================================================

/** GET /listqueue/owner
 *  ดึงเฉพาะ queue ของ user เอง
 */
export async function getMyListQueues(token?: string): Promise<ListQueue[]> {
  const res = await api.get("/listqueue/owner", {
    headers: authHeader(token),
  });
  return res.data;
}
