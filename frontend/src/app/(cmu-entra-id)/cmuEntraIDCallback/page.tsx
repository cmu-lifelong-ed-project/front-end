import { Suspense } from "react";
import Loader from "@/components/Loader";
import CallbackClient from "./CallbackClient";

export default function CmuEntraIDCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <CallbackClient />
    </Suspense>
  );
}
