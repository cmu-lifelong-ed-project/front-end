import { cookies } from 'next/headers'
import  { NextRequest, NextResponse } from "next/server";

type SuccessResponse = {
  ok: true;
};

type ErrorResponse = {
  ok: false;
};

export type signoutResponse = SuccessResponse | ErrorResponse;
export async function POST(
  req: NextRequest
): Promise<NextResponse<signoutResponse>> { 
// function delete cookie apptoken
 (await cookies()).delete('cmu-entraid-example-token');
  return NextResponse.json({ ok: true});
}
