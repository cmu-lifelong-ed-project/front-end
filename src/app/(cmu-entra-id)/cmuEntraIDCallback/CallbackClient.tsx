// src/app/(cmu-entra-id)/cmuEntraIDCallback/CallbackClient.tsx
"use client";

import axios, { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { SignInResponse } from "../api/signIn/route";
import Loader from "@/components/Loader";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    axios
      .post<SignInResponse>(`${base}/api/signIn`, { authorizationCode: code })
      .then((resp) => {
        if (resp.data.ok) router.push("/main");
      })
      .catch((error: AxiosError<SignInResponse>) => {
        if (!error.response)
          setMessage(
            "Cannot connect to CMU EntraID Server. Please try again later."
          );
        else if (!error.response.data.ok)
          setMessage(error.response.data.message);
        else setMessage("..Unknown error occurred. Please try again later.");
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {!message ? (
        <Loader />
      ) : (
        <p className="text-red-600 text-sm">{message}</p>
      )}
    </div>
  );
}
