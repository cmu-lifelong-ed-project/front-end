'use client';
import Link from 'next/link';

export default function IndexPage() {
  const CmuentraidURL = process.env.CMU_ENTRAID_URL as string;
  return (
    <div className="min-h-screen flex items-center justify-center  px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Sign in using CMU EntraID</h1>
        <Link href={`${CmuentraidURL}`}>
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
            Sign-in with CMU Account
          </button>
        </Link>
      </div>
    </div>
  );
}
