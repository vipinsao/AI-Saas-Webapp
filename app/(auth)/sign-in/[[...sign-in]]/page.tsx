import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome To SocialShare!
          </h1>
          <p className="text-gray-500">Sign in to continue 🚀</p>
        </div>
        <div className="w-full">
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                card: "shadow-none border-none",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
