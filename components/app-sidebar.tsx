"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";

type Menu = {
  MenuID: string;
  Menu: string;
  AspxPage: string;
  PID: string;
};

function normalizeData<T extends Record<string, any>>(row: T): Menu {
  return {
    MenuID: String(row.MenuID ?? ""),
    Menu: String(row.Menu ?? ""),
    AspxPage: String(row.AspxPage ?? ""),
    PID: String(row.PID ?? ""),
  };
}

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openParent, setOpenParent] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<Menu[]>([]);
  const { data: session } = useSession();

  const empCode = String(session?.user?.id ?? "").trim();

  useEffect(() => {
    const loadMenu = async () => {
      if (!empCode) return;

      try {
        const res = await fetch("/api/GetData/GetMenu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ EmpCode: empCode }),
        });

        const raw = await res.json();
        const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const normalized = rows.map(normalizeData);

        setMenuData(normalized);
      } catch (error) {
        console.error("Failed to load menu", error);
        setMenuData([]);
      }
    };

    void loadMenu();
  }, [empCode]);

  const parentMenu = useMemo(
    () => menuData.filter((item) => item.PID === "0" || item.PID === ""),
    [menuData],
  );

  const childMenu = useMemo(
    () => menuData.filter((item) => item.PID !== "0" && item.PID !== ""),
    [menuData],
  );

  const toggleMenu = (menuId: string) => {
    setOpenParent((prev) => (prev === menuId ? null : menuId));
  };

  const menuIcon = (label: string) =>
    label.toUpperCase() === "APPROVE"
      ? "/approved.png"
      : label.toUpperCase() === "EDIT"
        ? "/edit.png"
        : label.toUpperCase() === "VIEW"
          ? "/view-list.png"
          : "/form_generate.png";

  const buildHref = (page: string) => {
    const cleaned = String(page ?? "").trim().replace(/^\/+/, "");
    return cleaned ? `/${cleaned}` : "#";
  };

  return (
    <aside
      className={`shrink-0 border-r border-slate-200 bg-white transition-all duration-200 ${collapsed ? "w-20" : "w-64"
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
          {parentMenu.length === 0 ? (
            <div
              className={`rounded-lg py-2 text-sm text-slate-500 ${collapsed ? "px-2 text-center" : "px-3"
                }`}
            >
              Loading Menu...
            </div>
          ) : (
            parentMenu.map((parent) => {
              const children = childMenu.filter((child) => child.PID === parent.MenuID);
              const hasChildren = children.length > 0;
              const isOpen = openParent === parent.MenuID;

              return (
                <div key={parent.MenuID} className="mt-2">
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleMenu(parent.MenuID)}
                        className={`w-full rounded-lg py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 ${collapsed
                            ? "flex items-center justify-center px-2"
                            : "flex items-center justify-between px-3"
                          }`}
                        title={parent.Menu}
                      >
                        <span className={collapsed ? "" : "tracking-wide"}>{parent.Menu}</span>
                        {!collapsed && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-0" : "-rotate-90"
                              }`}
                          />
                        )}
                      </button>

                      {isOpen && (
                        <div className={collapsed ? "mt-1 space-y-1" : "mt-1 space-y-1 pl-3"}>
                          {children.map((child) => (
                            <Link
                              key={child.MenuID}
                              href={buildHref(child.AspxPage)}
                              className={`rounded-lg py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 ${collapsed
                                  ? "flex items-center justify-center px-2"
                                  : "flex items-center gap-2 px-3"
                                }`}
                              title={child.Menu}
                            >
                              <Image
                                src={menuIcon(child.Menu)}
                                alt={child.Menu}
                                width={16}
                                height={16}
                                className="h-4 w-4"
                              />
                              {!collapsed && child.Menu}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={buildHref(parent.AspxPage)}
                      className={`w-full rounded-lg py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 ${collapsed
                          ? "flex items-center justify-center px-2"
                          : "flex items-center gap-2 px-3"
                        }`}
                      title={parent.Menu}
                    >
                      <Image
                        src={menuIcon(parent.Menu)}
                        alt={parent.Menu}
                        width={16}
                        height={16}
                        className="h-4 w-4"
                      />
                      {!collapsed && <span className="tracking-wide">{parent.Menu}</span>}
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </nav>
      </div>
    </aside>
  );
}