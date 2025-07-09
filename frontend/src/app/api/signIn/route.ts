import axios from "axios";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { CmuEntraIDBasicInfo } from "@/app/types/CmuEntraIDBasicInfo";

type SuccessResponse = { ok: true };
type ErrorResponse = { ok: false; message: string };
export type SignInResponse = SuccessResponse | ErrorResponse;

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

    const response = await axios.post(tokenUrl, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
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
    const response = await axios.get(basicInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data as CmuEntraIDBasicInfo;
  } catch (err) {
    console.error("Error fetching basic info:", err);
    return null;
  }
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
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    try {
      await axios.post(`${backendUrl}/api/auth`, {
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error response:", error.response?.data);
        return NextResponse.json(
          { ok: false, message: "Failed to save user to backend: " + JSON.stringify(error.response?.data) },
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

    // เซ็ต cookie JWT token (HttpOnly, secure เฉพาะ production)
    const cookieStore = await cookies();
    cookieStore.set({
      name: "cmu-entraid-example-token",
      value: token,
      maxAge: 3600,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      // ไม่ต้องตั้ง domain เป็น localhost เพราะอาจทำให้ cookie ไม่ถูกส่ง
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
