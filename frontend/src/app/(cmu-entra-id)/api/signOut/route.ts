import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type SuccessResponse = {
  ok: true;
};

type ErrorResponse = {
  ok: false;
};

export type signoutResponse = SuccessResponse | ErrorResponse;
export async function POST(): Promise<NextResponse<signoutResponse>> {
  // function delete cookie apptoken
  (await cookies()).delete("cmu-entraid-example-token");
  (await cookies()).delete("backend-api-token");
  return NextResponse.json({ ok: true });
}
