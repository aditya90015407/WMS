"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [wasteOpen, setWasteOpen] = useState(true);
  const [reportOpen, setReportOpen] = useState(true);
  const [auctionOpen, setAuctionOpen] = useState(true);
  const [disposalOpen, setDisposalOpen] = useState(true);
  const [disposalGenerateOpen, setDisposalGenerateOpen] = useState(false);

  const wasteSubmenu = [
    { label: "APPROVE", href: "/Waste/Approve", enabled: true },
    { label: "GENERATE", href: "/Waste/Generate", enabled: true },
    { label: "VIEW", href: "/Waste/View", enabled: true },
    { label: "EDIT", href: "/Waste/Edit", enabled: true },
  ];

  const disposalSubmenu = [
    { label: "INITIATE", href: "/Disposal/Initiate", enabled: true },
  ];

  const disposalGenerateSubmenu = [
    { label: "HAZARDOUS", href: "/Disposal/Generate/Hazardous", enabled: true },
    { label: "NON HAZARDOUS", href: "/Disposal/Generate/NonHazardous", enabled: true },
  ];

  const auctionSubmenu = [
    { label: "APPROVE", href: "", enabled: false },
    { label: "APPLY", href: "/Auction/Apply", enabled: true },
    { label: "VIEW", href: "", enabled: false },
    { label: "EDIT", href: "", enabled: false },
  ];

  const reportSubmenu = [
    { label: "FORM 3", href: "/Form/Form-3", enabled: true },
    { label: "FORM 10", href: "/Form/Form-10", enabled: true },
  ];

  const menuIcon = (label: string) =>
    label === "APPROVE"
      ? "/approved.png"
      : label === "EDIT"
      ? "/edit.png"
      : label === "VIEW"
      ? "/view-list.png"
      : "/form_generate.png";

  return (
    <aside
      className={`shrink-0 border-r border-slate-200 bg-white transition-all duration-200 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col p-3">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {collapsed ? (
          <Link
            href="/Home"
            className="block rounded-md px-1 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100"
            title="Dashboard"
          >
            DB
          </Link>
        ) : (
          <Link
            href="/Home"
            className="block rounded-md px-2 py-1 text-sm font-bold tracking-wide text-slate-800 hover:bg-slate-100"
          >
            Dashboard
          </Link>
        )}

        <nav className={`${collapsed ? "mt-1" : "mt-3"}`}>
          <div>
            <button
              type="button"
              onClick={() => setWasteOpen((prev) => !prev)}
              className={`w-full rounded-lg py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 ${
                collapsed
                  ? "flex items-center justify-center px-2"
                  : "flex items-center justify-between px-3"
              }`}
              title="WASTE"
            >
              <span className={collapsed ? "" : "tracking-wide"}>Generation</span>
              {!collapsed && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    wasteOpen ? "rotate-0" : "-rotate-90"
                  }`}
                />
              )}
            </button>

            {wasteOpen && (
              <div className={collapsed ? "mt-1 space-y-1" : "mt-1 space-y-1 pl-3"}>
                {wasteSubmenu.map((item) =>
                  item.enabled ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`rounded-lg py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 ${
                        collapsed
                          ? "flex items-center justify-center px-2"
                          : "flex items-center gap-2 px-3"
                      }`}
                      title={item.label}
                    >
                      <Image
                        src={menuIcon(item.label)}
                        alt={item.label}
                        width={16}
                        height={16}
                        className="h-4 w-4"
                      />
                      {!collapsed && item.label}
                    </Link>
                  ) : (
                    <div
                      key={item.label}
                      className={`rounded-lg py-2 text-sm font-medium text-slate-400 ${
                        collapsed
                          ? "flex items-center justify-center px-2"
                          : "flex items-center gap-2 px-3"
                      }`}
                      title={`${item.label} (coming soon)`}
                    >
                      <Image
                        src={menuIcon(item.label)}
                        alt={item.label}
                        width={16}
                        height={16}
                        className="h-4 w-4 opacity-70"
                      />
                      {!collapsed && item.label}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="mt-2">
            <button
              type="button"
              onClick={() => setAuctionOpen((prev) => !prev)}
              className={`w-full rounded-lg py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 ${
                collapsed
                  ? "flex items-center justify-center px-2"
                  : "flex items-center justify-between px-3"
              }`}
              title="AUCTION"
            >
              <span className={collapsed ? "" : "tracking-wide"}>Auction</span>
              {!collapsed && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    auctionOpen ? "rotate-0" : "-rotate-90"
                  }`}
                />
              )}
            </button>

            {auctionOpen && (
              <div className={collapsed ? "mt-1 space-y-1" : "mt-1 space-y-1 pl-3"}>
                {auctionSubmenu.map((item) =>
                  item.enabled ? (
                    <Link
                      key={`auction-${item.label}`}
                      href={item.href}
                      className={`rounded-lg py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 ${
                        collapsed
                          ? "flex items-center justify-center px-2"
                          : "flex items-center gap-2 px-3"
                      }`}
                      title={item.label}
                    >
                      <Image
                        src={menuIcon(item.label)}
                        alt={item.label}
                        width={16}
                        height={16}
                        className="h-4 w-4"
                      />
                      {!collapsed && item.label}
                    </Link>
                  ) : (
                    <div
                      key={`auction-${item.label}`}
                      className={`rounded-lg py-2 text-sm font-medium text-slate-400 ${
                        collapsed
                          ? "flex items-center justify-center px-2"
                          : "flex items-center gap-2 px-3"
                      }`}
                      title={`${item.label} (coming soon)`}
                    >
                      <Image
                        src={menuIcon(item.label)}
                        alt={item.label}
                        width={16}
                        height={16}
                        className="h-4 w-4 opacity-70"
                      />
                      {!collapsed && item.label}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="mt-2">
            <button
              type="button"
              onClick={() => setDisposalOpen((prev) => !prev)}
              className={`w-full rounded-lg py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 ${
                collapsed
                  ? "flex items-center justify-center px-2"
                  : "flex items-center justify-between px-3"
              }`}
              title="DISPOSAL"
            >
              <span className={collapsed ? "" : "tracking-wide"}>Disposal</span>
              {!collapsed && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    disposalOpen ? "rotate-0" : "-rotate-90"
                  }`}
                />
              )}
            </button>

            {disposalOpen && (
              <div className={collapsed ? "mt-1 space-y-1" : "mt-1 space-y-1 pl-3"}>
                {disposalSubmenu.map((item) => (
                  <Link
                    key={`disposal-${item.label}`}
                    href={item.href}
                    className={`rounded-lg py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 ${
                      collapsed
                        ? "flex items-center justify-center px-2"
                        : "flex items-center gap-2 px-3"
                    }`}
                    title={item.label}
                  >
                    <Image
                      src="/form_generate.png"
                      alt={item.label}
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                    {!collapsed && item.label}
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={() => setDisposalGenerateOpen((prev) => !prev)}
                  className={`w-full rounded-lg py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 ${
                    collapsed
                      ? "flex items-center justify-center px-2"
                      : "flex items-center justify-between px-3"
                  }`}
                  title="GENERATE"
                >
                  <span>GENERATE</span>
                  {!collapsed && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        disposalGenerateOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  )}
                </button>

                {disposalGenerateOpen && (
                  <div className={collapsed ? "space-y-1" : "space-y-1 pl-3"}>
                    {disposalGenerateSubmenu.map((item) => (
                      <Link
                        key={`disposal-gen-${item.label}`}
                        href={item.href}
                        className={`rounded-lg py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 ${
                          collapsed
                            ? "flex items-center justify-center px-2"
                            : "flex items-center gap-2 px-3"
                        }`}
                        title={item.label}
                      >
                        <Image
                          src="/form_generate.png"
                          alt={item.label}
                          width={16}
                          height={16}
                          className="h-4 w-4"
                        />
                        {!collapsed && item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-2">
            <button
              type="button"
              onClick={() => setReportOpen((prev) => !prev)}
              className={`w-full rounded-lg py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 ${
                collapsed
                  ? "flex items-center justify-center px-2"
                  : "flex items-center justify-between px-3"
              }`}
              title="REPORT"
            >
              <span className={collapsed ? "" : "tracking-wide"}>Report</span>
              {!collapsed && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    reportOpen ? "rotate-0" : "-rotate-90"
                  }`}
                />
              )}
            </button>

            {reportOpen && (
              <div className={collapsed ? "mt-1 space-y-1" : "mt-1 space-y-1 pl-3"}>
                {reportSubmenu.map((item) =>
                  item.enabled ? (
                    <Link
                      key={`report-${item.label}`}
                      href={item.href}
                      className={`rounded-lg py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 ${
                        collapsed
                          ? "flex items-center justify-center px-2"
                          : "flex items-center gap-2 px-3"
                      }`}
                      title={item.label}
                    >
                      <Image
                        src={menuIcon(item.label)}
                        alt={item.label}
                        width={16}
                        height={16}
                        className="h-4 w-4"
                      />
                      {!collapsed && item.label}
                    </Link>
                  ) : (
                    <div
                      key={`report-${item.label}`}
                      className={`rounded-lg py-2 text-sm font-medium text-slate-400 ${
                        collapsed
                          ? "flex items-center justify-center px-2"
                          : "flex items-center gap-2 px-3"
                      }`}
                      title={`${item.label} (coming soon)`}
                    >
                      <Image
                        src={menuIcon(item.label)}
                        alt={item.label}
                        width={16}
                        height={16}
                        className="h-4 w-4 opacity-70"
                      />
                      {!collapsed && item.label}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
}
