import Image from "next/image";

export default function SignInPage() {
  const CmuentraidURL = process.env.CMU_ENTRAID_URL as string;
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#dcc0f2] px-4">
      <div className="bg-white rounded-3xl shadow-xl px-21 py-12 w-full max-w-2xl text-center space-y-10">
        {/* Logo */}
        <div className="flex justify-center mt-4 mb-15">
          <Image
            src="/logo_le.png"
            alt="Logo"
            width={300}
            height={300}
            priority
          />
        </div>

        {/* Button */}
        <a href={CmuentraidURL}>
          <button className="w-full bg-gradient-to-r from-purple-800 to-purple-400 text-white font-semibold py-3 rounded-full shadow-md text-base md:text-lg lg:text-xl">
            Sign-in with CMU Account
          </button>
        </a>

        {/* Small note */}
        <p className="text-gray-500 text-xs md:text-sm mt-2">
          For Chiang Mai University Personnel use ONLY
        </p>
      </div>
    </div>
  );
}
