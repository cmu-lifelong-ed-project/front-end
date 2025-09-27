"use client";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SignInResponse } from "../api/signIn/route";
import Loader from "@/components/Loader";

export default function cmuEntraIDCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const [message, setMessage] = useState("");

  useEffect(() => {
    //Next.js takes sometime to read parameter from URL
    //So we'll check if "code" is ready before calling sign-in api
    if (!code) return;

    axios
      .post<SignInResponse>("/api/signIn", { authorizationCode: code })
      .then((resp) => {
        if (resp.data.ok) {
          router.push("/main");
        }
      })
      .catch((error: AxiosError<SignInResponse>) => {
        if (!error.response) {
          setMessage(
            "Cannot connect to CMU EntraID Server. Please try again later."
          );
        } else if (!error.response.data.ok) {
          setMessage(error.response.data.message);
        } else {
          setMessage("..Unknown error occurred. Please try again later.");
        }
      });
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4FF]">
      {!message ? (
        <Loader />
      ) : (
        <p className="text-red-600 text-sm">{message}</p>
      )}
    </div>
  );
}
