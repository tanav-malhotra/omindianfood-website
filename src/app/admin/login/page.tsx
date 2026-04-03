import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Restaurant Login - OM Indian Restaurant",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-[70vh] bg-stone-100 px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Access is restricted to authorized restaurant staff.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
