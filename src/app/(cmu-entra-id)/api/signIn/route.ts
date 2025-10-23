import axios from "axios";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { CmuEntraIDBasicInfo } from "@/types/auth/CmuEntraIDBasicInfo";

type SuccessResponse = { ok: true };
type ErrorResponse = { ok: false; message: string };
export type SignInResponse = SuccessResponse | ErrorResponse;

const http = axios.create({
  proxy: false,
  timeout: 15000,
});

async function getEmtraIDAccessTokenAsync(
  authorizationCode: string
): Promise<string | null> {
  try {
    const tokenUrl = process.env.CMU_ENTRAID_GET_TOKEN_URL!;
    const redirectUrl = process.env.CMU_ENTRAID_REDIRECT_URL!;
    const clientId = process.env.CMU_ENTRAID_CLIENT_ID!;
    const clientSecret = process.env.CMU_ENTRAID_CLIENT_SECRET!;
    const scope = process.env.SCOPE!;

    const params = new URLSearchParams();
    params.append("code", authorizationCode);
    params.append("redirect_uri", redirectUrl);
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("scope", scope);
    params.append("grant_type", "authorization_code");

    const response = await http.post(tokenUrl, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    return null;
  }
}

async function getCMUBasicInfoAsync(accessToken: string) {
  try {
    const basicInfoUrl = process.env.CMU_ENTRAID_GET_BASIC_INFO!;
    const response = await http.get(basicInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data as CmuEntraIDBasicInfo;
  } catch (err) {
    console.error("Error fetching basic info:", err);
    return null;
  }
}

export async function GET() {
  const authBaseUrl = process.env.CMU_ENTRAID_URL;
  const clientId = process.env.CMU_ENTRAID_CLIENT_ID;
  const redirectUrl = process.env.CMU_ENTRAID_REDIRECT_URL;
  const scope = process.env.SCOPE;

  if (!authBaseUrl || !clientId || !redirectUrl || !scope) {
    console.error(
      "Missing critical CMU EntraID environment variables for GET redirect."
    );
    return NextResponse.json(
      {
        ok: false,
        message: "Server configuration error: Missing CMU EntraID credentials.",
      },
      { status: 500 }
    );
  }

  const url = new URL(authBaseUrl);

  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("redirect_uri", redirectUrl);
  url.searchParams.append("scope", scope);
  url.searchParams.append("state", "xyz");

  return NextResponse.redirect(url.toString());
}

export async function POST(req: NextRequest) {
  try {
    const { authorizationCode } = await req.json();

    if (!authorizationCode || typeof authorizationCode !== "string") {
      return NextResponse.json(
        { ok: false, message: "Invalid authorization code" },
        { status: 400 }
      );
    }

    const accessToken = await getEmtraIDAccessTokenAsync(authorizationCode);
    if (!accessToken) {
      return NextResponse.json(
        { ok: false, message: "Cannot get EntraID access token" },
        { status: 400 }
      );
    }

    const cmuBasicInfo = await getCMUBasicInfoAsync(accessToken);
    if (!cmuBasicInfo) {
      return NextResponse.json(
        { ok: false, message: "Cannot get cmu basic info" },
        { status: 400 }
      );
    }

    // สร้าง JWT token
    if (typeof process.env.JWT_SECRET !== "string") {
      throw new Error("Please assign jwt secret in .env!");
    }

    const token = jwt.sign(
      {
        cmuitaccount_name: cmuBasicInfo.cmuitaccount_name,
        cmuitaccount: cmuBasicInfo.cmuitaccount,
        student_id: cmuBasicInfo.student_id,
        prename_id: cmuBasicInfo.prename_id,
        prename_TH: cmuBasicInfo.prename_TH,
        prename_EN: cmuBasicInfo.prename_EN,
        firstname_TH: cmuBasicInfo.firstname_TH,
        firstname_EN: cmuBasicInfo.firstname_EN,
        lastname_TH: cmuBasicInfo.lastname_TH,
        lastname_EN: cmuBasicInfo.lastname_EN,
        organization_code: cmuBasicInfo.organization_code,
        organization_name_TH: cmuBasicInfo.organization_name_TH,
        organization_name_EN: cmuBasicInfo.organization_name_EN,
        itaccounttype_id: cmuBasicInfo.itaccounttype_id,
        itaccounttype_TH: cmuBasicInfo.itaccounttype_TH,
        itaccounttype_EN: cmuBasicInfo.itaccounttype_EN,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // POST user data ไป backend api
    const backendUrl =
      process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL!;

    let backendToken: string | null = null;
    try {
      const res = await http.post(`${backendUrl}/auth`, {
        cmuitaccount_name: cmuBasicInfo.cmuitaccount_name,
        cmuitaccount: cmuBasicInfo.cmuitaccount,
        student_id: cmuBasicInfo.student_id,
        prename_id: cmuBasicInfo.prename_id,
        prename_TH: cmuBasicInfo.prename_TH,
        prename_EN: cmuBasicInfo.prename_EN,
        firstname_TH: cmuBasicInfo.firstname_TH,
        firstname_EN: cmuBasicInfo.firstname_EN,
        lastname_TH: cmuBasicInfo.lastname_TH,
        lastname_EN: cmuBasicInfo.lastname_EN,
        organization_code: cmuBasicInfo.organization_code,
        organization_name_TH: cmuBasicInfo.organization_name_TH,
        organization_name_EN: cmuBasicInfo.organization_name_EN,
        itaccounttype_id: cmuBasicInfo.itaccounttype_id,
        itaccounttype_TH: cmuBasicInfo.itaccounttype_TH,
        itaccounttype_EN: cmuBasicInfo.itaccounttype_EN,
      });

      // สมมติ backend ตอบกลับ { token: "..." }
      backendToken = res.data.token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error response:", error.response?.data);
        return NextResponse.json(
          {
            ok: false,
            message:
              "Failed to save user to backend: " +
              JSON.stringify(error.response?.data),
          },
          { status: error.response?.status || 500 }
        );
      } else {
        console.error("Unexpected error:", error);
        return NextResponse.json(
          { ok: false, message: "Unexpected error saving user to backend" },
          { status: 500 }
        );
      }
    }

    if (!backendToken) {
      return NextResponse.json(
        { ok: false, message: "No token received from backend" },
        { status: 500 }
      );
    }

    // เซ็ต cookie สำหรับ token ที่คุณสร้างเอง
    const cookieStore = await cookies();
    cookieStore.set({
      name: "cmu-entraid-example-token",
      value: token,
      expires: new Date(Date.now() + 3600 * 1000),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    // เซ็ต cookie สำหรับ token ที่ได้จาก backend
    cookieStore.set({
      name: "backend-api-token",
      value: backendToken,
      expires: new Date(Date.now() + 3600 * 1000),
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unexpected error in POST handler:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
