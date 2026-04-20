"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import encrypt from "@/components/Encrypt";

type SelectedAuctionRow = {
  ID?: string | number;
  IDDID?: string | number;
  VendorCode?: string;
  NAME?: string;
  EMAIL?: string;
  StsCode?: string;
  AuctionDate: string
  Waste: string
  WasteCategory: string
  VID: string
  DiposalType: string
  DisType: string
  TotalQty: string
  CrBy: string
  IsActive: string
  CrDt: string
};

export default function SelectedEntriesPage() {
  const { data: session, status } = useSession();
  const empCode = String(session?.user?.id ?? "").trim();
  const router = useRouter();

  const [rows, setRows] = useState<SelectedAuctionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSelectedEntries = async () => {
      if (!empCode) return;

      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/GetData/GetSelectedAuctionListByVendorCode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ EmpCode: empCode }),
        });

        const data = await res.json();

        if (!res.ok) {
          setRows([]);
          setError(data?.message || "Failed to load selected entries.");
          return;
        }

        const list = Array.isArray(data) ? data : data?.data ?? [];
        setRows(list);
      } catch (err) {
        console.error("Failed to load selected entries", err);
        setRows([]);
        setError("Failed to load selected entries.");
      } finally {
        setLoading(false);
      }
    };

    void loadSelectedEntries();
  }, [empCode]);

  const handleRowClick = async (row: SelectedAuctionRow) => {
    try {
      const id = String(row.ID ?? "").trim();
      const iddid = String(row.IDDID ?? "").trim();
      const stsCode = String(row.StsCode ?? "").trim();

      if (!id || !iddid) return;

      const encryptedId = await encrypt(id);
      const encryptedApid = await encrypt(id);
      const encryptedIddid = await encrypt(iddid);


      router.push(
        `/Auction/SelectedEntries/Act?id=${encodeURIComponent(encryptedId)}&apid=${encodeURIComponent(
          encryptedApid,
        )}&iddid=${encodeURIComponent(encryptedIddid)}`,
      );
    } catch (err) {
      console.error("Redirect failed:", err);
    }
  };

  if (status === "loading") {
    return (
      <section className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">Loading session...</p>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-center">
        <h1 className="text-lg font-semibold text-slate-900">Selected Auction Entries</h1>
        <p className="mt-1 text-sm text-slate-600">Auctions selected for the logged-in vendor</p>
      </div>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading selected entries...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                  IDDID
                </th>
                <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                  Auction Date
                </th>
                <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                  Waste Category
                </th>
                <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                  Waste
                </th>
                <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                  Total Qty
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-sm text-slate-500">
                    No selected auction entries found.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={`${row.ID ?? index}`}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => void handleRowClick(row)}
                  >
                    <td className="px-3 py-2 text-sm text-slate-700">{row.IDDID}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{row.AuctionDate}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{row.WasteCategory}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{row.Waste}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{row.TotalQty}</td>
                    {/* <td className="px-3 py-2 text-sm text-slate-700">{row.CrDt?.split("T")[0] || "N/A"}</td> */}

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )
      }
    </section >
  );
}
