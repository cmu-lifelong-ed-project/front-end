"use client";

import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export default function LoginPage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // โหลด script Google Identity Services
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          {
            theme: "outline",
            size: "large",
          }
        );

        // Optionally, prompt for One Tap
        // window.google.accounts.id.prompt();
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  function handleCredentialResponse(response: any) {
    // response.credential = JWT token from Google
    // สามารถส่งไป backend เพื่อ verify และรับข้อมูล user
    console.log("Encoded JWT ID token: " + response.credential);

    // ถ้าต้องการ decode token แบบง่าย (ไม่ปลอดภัยเท่าตรวจ server)
    const base64Url = response.credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    const userObject = JSON.parse(jsonPayload);
    setUser(userObject);

    // หรือส่ง response.credential (token) ไป backend verify และสร้าง session
  }

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 flex-col">
      {!user ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Login with Google</h2>
          <div id="googleSignInDiv"></div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </>
      ) : (
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-xl mb-2">Welcome, {user.name}</h3>
          <img src={user.picture} alt="User picture" className="mx-auto rounded-full mb-2" />
          <p>Email: {user.email}</p>
          <button
            onClick={handleLogout}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
