import api, { authHeader } from "@/lib/axios";
import { UpdateOrderInput, UpdateOrderNameInput } from "@/types/api/order";

//// ============================================================
////                         admin เท่านั้น
//// ============================================================

/** PUT /order/name
 *  แก้ไขชื่อ order
 */

export async function updateOrderName(
  body: UpdateOrderNameInput,
  token?: string
): Promise<void> {
  await api.put("/order/name", body, { headers: authHeader(token) });
}

//// ============================================================
////                         staff ขึ้นไป
//// ============================================================

/** PUT /order
 *  อัปเดตการเช็ค order
 */
export async function updateOrder(
  body: UpdateOrderInput,
  token?: string
): Promise<void> {
  await api.put("/order", body, { headers: authHeader(token) });
}
