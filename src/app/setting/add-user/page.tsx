import { Suspense } from "react";
import AddUser from "@/components/setting/AddUser";
import Loader from "@/components/Loader";

export default function AddUserPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <AddUser />
    </Suspense>
  );
}
