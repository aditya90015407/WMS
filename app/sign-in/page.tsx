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
import { decrypt } from "@/lib/decryptVendorCode";




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


  const [loginAttempt, setLoginAttempt] = useState(0)


  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const passwordRegex = /^(?=.{12,})[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


  async function isValidCredential(username: any, password: any) {
    // console.log(username, password)
    // const pass = await decryptPassword(password);
    // console.log(pass)
    return usernameRegex.test(username) && passwordRegex.test(password);
    // return usernameRegex.test(username);
  }


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
  // }

  // useEffect(() => {
  //   encryptpwd()
  // }, [])


  // **********************************   SSO Starts   ************************************

  // const [QS, setQS] = useState("EETtDpkruKXuZmmZ7XOyDf8fywx+w6EYOB3KVbe2tjLaA2IHh0EMdq+BEu4ChUJ38HLZDZWrpA0CKfnsiFwFjbgHYX9WWXVylxRrkVch//UA1XKopoRIIBnPFBGBlsf+EUh8Rwk+UeUwRmmMHn2yKw==")

  // const pathname = usePathname()
  // const searchParams = useSearchParams()
  // const fullurl = pathname + "?" + params

  // const currenturl = new URL(window.location.href)
  // const params = currenturl.search
  // const QueryString = params.split("QS=")[1]

  // console.log(currenturl, "currenturl")
  // console.log(params, "params")
  // console.log(QueryString, "QueryString");

  // const qs = new URL(window.location.href).searchParams.get("QS")



  // async function ProcessQueryString() {
  //     // console.log("hi i am entering processQueryString")

  //     const decryptedQueryString = await decrypt(QueryString!)
  //     // console.log(decryptedQueryString, "decrypytedquerystring")

  //     const userEmailQS = decryptedQueryString.split(",")[0]
  //     const userIDQS = decryptedQueryString.split(",")[1]
  //     const userEmail = userEmailQS.split("=")[1]
  //     const userID = userIDQS.split("=")[1]
  //     // console.log(userEmail, "UserEmail")
  //     // console.log(userID, "UserID")

  //     // console.log("hi i am exiting processQueryString")

  //     const res = await fetch(`/api/SSO_Login`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ "Email": userEmail }),
  //     });


  //     const data = await res.json();
  //     // console.log(data)
  //     // console.log(data.empName)


  //     const status = await res.status;

  //     await signIn("credentials", {
  //         redirect: false,
  //         userId: data.appUserID,
  //         role: data.empRoll,
  //         name: data.empName,
  //         email: data.empEmail,
  //         dept: data.empDept,
  //         deptid: data.empDeptId,
  //         desg: data.empDesg,

  //     });

  //     setTimeout(() => {
  //         if (status == 200) {
  //             // console.log(data.empRoll)
  //             if (data.empRoll == "ADMIN") {

  //                 redirect("/Admin")
  //             }
  //             else if (data.empRoll == "SEGMENT LEAD") {

  //                 redirect("/SegmentLead")
  //             }
  //             else if (data.empRoll == "AGENCY") {
  //                 redirect("/Department")
  //             }
  //             else if (data.empRoll == "ZONAL REPRESENTATIVE") {
  //                 redirect("/ZonalRepresentative")
  //             }
  //             else if (data.empRoll == "LAB") {
  //                 redirect("/Lab")
  //             }
  //             else if (data.empRoll == "VIEWER") {
  //                 redirect("/Viewer")
  //             }
  //             else if (data.empRoll == "Agency HOD") {
  //                 redirect("/HOD")
  //             }
  //             else {
  //                 toast.error("No Valid Role Assigned , Please Contact Administrator", {
  //                     position: "top-right"
  //                 })
  //                 return
  //             }

  //         }
  //         else {
  //             toast.error("Kindly verify your credentials and try again !", {
  //                 position: "top-right"
  //             })
  //             setSignClick(false)
  //         }

  //     }, 1000);
  // }

  // useEffect(() => {
  //     ProcessQueryString()
  // }, [])


  // ********************************   SSO Ends   ****************************



  const onSubmit = async () => {
    clearErrors();


    // console.log(employeeCode, password)

    setLoginAttempt(prev => prev + 1);

    if (loginAttempt > 4) {
      toast.error("Maximum Login Attempts Exceeded. Please try after some time.", {
        position: "top-right"
      })
      return
    }

    if (!employeeCode.trim()) {
      setUsernameError("Employee Code is required");
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      return;
    }


    if (!await isValidCredential(employeeCode, password)) {
      toast.error("Invalid Username or Password Pattern", {
        position: "top-right"
      })
      return
    }


    if (employeeCode == password) {
      toast.error("Username and Password can't be Same", {
        position: "top-right"
      })
      return
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
          `Login successful `,
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
    <div className="min-h-screen bg-linear-to-br bg-white/75 flex items-center justify-center">
      <img src="/wmsbackground.png" alt="" className="h-screen" />
      <Toaster position="top-right" />
      <div className="w-full max-w-6xl ">
        {/* <div className="space-y-8 place-self-center">
            <div className="flex gap-4 align-center justify-center ">
              <div className="h-auto w-64 md:w-55 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                <Image
                  src="/jsl-logo.png"
                  alt="Jindal Stainless"
                  className="w-full h-auto me-5"
                  width={320}
                  height={320}
                  priority
                />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="font-[eco] text-3xl md:text-4xl font-bold text-emerald-700 leading-tight">
                Waste Management System
              </h1>
            </div>
          </div> */}

        <div className="w-full items-right place-self-end justify-self-end bg-white backdrop-blur-md  p-10 ">

          <div className="flex items-center justify-center">
            <Image
              src="/jsl-logo.png"
              alt="Jindal Stainless"
              className="w-[170px] h-auto my-5"
              width={200}
              height={200}
              priority
            />

          </div>
          <h1 className="font-[eco] text-center w-full text-lg md:text-2xl font-bold tracking-wide mt-3 mb-8 font-bold text-emerald-700 leading-tight">
            Waste Management System
          </h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="my-2"
          >
            {/* <div className="space-y-2">
                <h2 className="text-xl font-semibold text-emerald-600 text-center">
                  Sign In
                </h2>
                <p className="text-slate-600 text-center text-xs">
                  Enter your credentials to continue
                </p>
              </div> */}

            {globalError && (
              <div className="p-4 text-sm text-red-600 bg-red-50/80 rounded-xl border border-red-100">
                {globalError}
              </div>
            )}

            {/* Employee Code */}
            <div className="space-y-1 my-1 mt-2">
              <label className="text-sm font-medium text-teal-600 block">
                Employee Code
              </label>
              <Input
                placeholder="Enter your code"
                value={employeeCode}
                onChange={(e) => {
                  setEmployeeCode(e.target.value);
                  setUsernameError(null);
                }}
                className={`h-12 rounded-xl border-green-100 focus:border-emerald-500 focus-visible:ring-offset-0 focus-visible:ring-0 ${usernameError ? "border-red-400" : ""
                  }`}
              />
              {usernameError && (
                <p className="text-sm text-red-600">{usernameError}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1 my-1 mt-2">
              <label className="text-sm font-medium text-teal-600 block">
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
                  className={`h-12 rounded-xl border-green-100 focus:border-emerald-500 focus-visible:ring-offset-0 focus-visible:ring-0 ${usernameError ? "border-red-400" : ""
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
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
              type="button"
              className="w-full h-12 text-white rounded-xl mt-5"
              disabled={isLoading}
            >
              <span
                // className="w-fit bg-[#2F4F4F] hover:bg-[#165346] text-[#FFFFFF] rounded-lg cursor-pointer py-2 px-10"
                className="w-fit bg-gradient-to-br from-[#1F6F5F] to-[#2E8B74] text-white px-10 py-2 
                rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:brightness-110 transition-all duration-300 
                cursor-pointer"
                onClick={onSubmit}
              // className="w-fit bg-[#1F6F5F] hover:bg-[#165346] text-[#FFFFFF] rounded-lg cursor-pointer py-2 px-10"
              >{isLoading ? "Signing in..." : "Sign In"}
              </span>
            </Button>

            {/* <p className="text-xs text-center text-slate-500 pt-2">
                Need help? Contact IT Application Team for support
              </p> */}
          </form>
        </div>
      </div>
    </div>
  );
}
