import { Suspense } from "react";
import EditUser from "@/components/setting/EditUser";
import Loader from "@/components/Loader";

export default function EditUserPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <EditUser />
    </Suspense>
  );
}
