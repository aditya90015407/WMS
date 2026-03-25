"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { encryptForLogin } from "@/lib/login-crypto-client";
import encrypt from "@/components/Encrypt";
import decrypt from "@/components/Decrypt";




const getSessionRole = (value: unknown): string | undefined => {
  if (typeof value !== "object" || value === null) return undefined;
  const user = (value as { user?: unknown }).user;
  if (typeof user !== "object" || user === null) return undefined;
  const role = (user as { role?: unknown }).role;
  return typeof role === "string" ? role.toUpperCase() : undefined;
};

const getSessionEmpCode = (value: unknown): string | undefined => {
  if (typeof value !== "object" || value === null) return undefined;
  const user = (value as { user?: unknown }).user;
  if (typeof user !== "object" || user === null) return undefined;
  const id = (user as { id?: unknown }).id;
  if (typeof id === "string" && id.trim().length > 0) return id;
  const username = (user as { username?: unknown }).username;
  if (typeof username === "string" && username.trim().length > 0) return username;
  return undefined;
};

export default function LoginPage() {
  const router = useRouter();
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const clearErrors = () => {
    setUsernameError(null);
    setPasswordError(null);
    setGlobalError(null);
  };

  // async function encryptpwd() {
  //   console.log(await encrypt("Jajpur#Jsl\$App@2026-04"))
  //   console.log(await encrypt("JAJITAPPS"))
  //   console.log(await encrypt("WasteMgtSystem"))
  //   console.log(await encrypt("AppDbUser"))
  //   console.log(await encrypt("MAKV2SPBNI99212"))
  //   console.log(await encrypt("1433"))
  //   console.log(await decrypt("ESQgJHjlA6vEgITOupoKwh2P35WJ7Y7oDu4aSJdYwQQ"))
  // }

  // useEffect(() => {
  //   encryptpwd()
  // }, [])

  const onSubmit = async () => {
    clearErrors();

    if (!employeeCode.trim()) {
      setUsernameError("Employee Code is required");
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      const { signIn, getSession } = await import("next-auth/react");
      const encryptedEmployeeCode = await encryptForLogin(employeeCode.trim());
      const encryptedPassword = await encryptForLogin(password);

      

      const res = await signIn("credentials", {
        username: encryptedEmployeeCode,
        password: encryptedPassword,
        redirect: false,
      });
      // console.log(res)

      if (res?.error) {
        setGlobalError(res.error);
        setIsLoading(false);
        return;
      }

      if (res?.ok) {
        // Fetch session for toast details, then always redirect to Home
        const session = await getSession();
        const role = getSessionRole(session);
        const empCode = getSessionEmpCode(session) ?? employeeCode;
        toast.success(
          `Login successful | Emp Code: ${empCode} | Role: ${role ?? "UNKNOWN"}`,
        );
        router.push("/Home");
        return;
      }
    } catch (error) {
      console.log(error);
      setGlobalError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <Toaster position="top-right" />
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="flex gap-4 align-center">
              <div className="h-auto w-64 md:w-80 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                <Image
                  src="/jsl-logo.png"
                  alt="Jindal Stainless"
                  className="w-full h-auto"
                  width={320}
                  height={320}
                  priority
                />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                Waste Management System
              </h1>
            </div>
          </div>

          {/* Right Side - Login Form (DESIGN SAME) */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-white/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-800">
                  Sign In
                </h2>
                <p className="text-slate-600">
                  Enter your credentials to continue
                </p>
              </div>

              {globalError && (
                <div className="p-4 text-sm text-red-600 bg-red-50/80 rounded-xl border border-red-100">
                  {globalError}
                </div>
              )}

              {/* Employee Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">
                  Employee Code
                </label>
                <Input
                  placeholder="Enter your code"
                  value={employeeCode}
                  onChange={(e) => {
                    setEmployeeCode(e.target.value);
                    setUsernameError(null);
                  }}
                  className={`h-12 rounded-xl ${usernameError ? "border-red-400" : ""
                    }`}
                />
                {usernameError && (
                  <p className="text-sm text-red-600">{usernameError}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(null);
                    }}
                    className={`h-12 rounded-xl pr-12 ${passwordError ? "border-red-400" : ""
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#ff7b00ef] text-white rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-xs text-center text-slate-500 pt-2">
                Need help? Contact IT Application Team for support
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
