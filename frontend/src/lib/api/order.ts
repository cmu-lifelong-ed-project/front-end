import api, { authHeader } from "@/lib/axios";
import { UpdateOrderInput } from "@/types/api/order";

//// ============================================================
////                         staff ขึ้นไป
//// ============================================================

/** PUT /order
 *  อัปเดตการเช็ค order (เตือนความจำ)
 */
export async function updateOrder(
  body: UpdateOrderInput,
  token?: string
): Promise<void> {
  await api.put("/order", body, { headers: authHeader(token) });
}
