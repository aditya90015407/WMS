"use client";

import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, UserCircle2 } from "lucide-react";

type SessionUserLike = {
  username?: string;
  name?: string;
  email?: string | null;
  department?: string;
  roles?: string[] | string;
  role?: string;
  uid?: string;
  deptId?: string;
  WMSUnit?: string;
  WMSDept?: string;
  id?: string;
};

const normalizeUser = (value: unknown): SessionUserLike => {
  if (typeof value !== "object" || value === null) return {};
  return value as SessionUserLike;
};

const formatSegment = (segment: string) =>
  segment
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export default function AppNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const user = normalizeUser(isMounted ? session?.user : null);
  const displayName = user.username || user.name || "Unknown User";
  const email = user.email || "Not available";
  const department = user.department || "Not available";
  const uid = user.uid || "Not available";
  const deptId = user.deptId || "Not available";
  const wmsUnit = user.WMSUnit || "Not available";
  const wmsDept = user.WMSDept || "Not available";
  const empCode = user.id || "Not available";
  const pathSegments = (pathname || "/")
    .split("/")
    .filter(Boolean)
    .filter((segment) => segment.toLowerCase() !== "home");
  const breadcrumbParts = ["Home", ...pathSegments.map(formatSegment)];
  const roleList = Array.isArray(user.roles)
    ? user.roles.filter((role) => typeof role === "string" && role.trim().length > 0)
    : typeof user.roles === "string" && user.roles.trim().length > 0
      ? user.roles
        .split(",")
        .map((role) => role.trim())
        .filter((role) => role.length > 0)
      : typeof user.role === "string" && user.role.trim().length > 0
        ? [user.role]
        : [];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/sign-in" });
  };

  return (
    <header className="w-full sticky z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="relative flex h-16 w-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Image
            src="/jsl-logo.png"
            alt="JSL Logo"
            width={120}
            height={36}
            className="h-auto w-28 md:w-32"
            priority
          />
        </div>

        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-lg font-extrabold tracking-wide text-slate-800 drop-shadow-sm md:text-2xl">
            WASTE MANAGEMENT SYSTEM
          </h1>
        </div>

        <div className="relative" ref={containerRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="rounded-full p-1 text-slate-700 transition hover:bg-slate-100"
            aria-label="Open profile"
          >
            <UserCircle2 className="h-9 w-9" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Profile
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-slate-800">
                  <span className="font-semibold">EmpCode:</span> {empCode}
                </p>
                <p className="text-slate-800">
                  <span className="font-semibold">Name:</span> {displayName}
                </p>
                <p className="text-slate-800">
                  <span className="font-semibold">Email:</span> {email}
                </p>
                {/* <p className="text-slate-800">
                  <span className="font-semibold">Department:</span>{" "}
                  {department}
                </p> */}
                {/* <p className="text-slate-800">
                  <span className="font-semibold">UID:</span>{" "}
                  {uid}
                </p>
                <p className="text-slate-800">
                  <span className="font-semibold">Dept Id:</span>{" "}
                  {deptId}
                </p> */}
                <p className="text-slate-800">
                  <span className="font-semibold">Unit:</span>{" "}
                  {wmsUnit}
                </p>
                <p className="text-slate-800">
                  <span className="font-semibold">Department:</span>{" "}
                  {wmsDept}
                </p>
                <p className="text-slate-800">
                  <span className="font-semibold">Assigned Roles:</span>
                </p>
                {roleList.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {roleList.map((role) => (
                      <span
                        key={role}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">Not assigned yet</p>
                )}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoggingOut ? "Logging out..." : "Log out"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-2">
        <div className="flex w-full justify-start">
          <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5">
            {breadcrumbParts.map((part, index) => (
              <div key={`nav-${part}-${index}`} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                <span className="text-[11px] font-medium text-slate-700 md:text-xs">{part}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
