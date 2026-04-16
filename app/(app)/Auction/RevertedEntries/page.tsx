"use client";

import encrypt from "@/components/Encrypt";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";


type RejectedRow = {
  ID: string;
  NAME: string;
  EMAIL: string;
  StsCode: string;
  CrDt: string;
  Remarks?: string;
  AuctionID?: string;
  APID?: string;
  IDDID?:string;
};

export default function AuctionRejectedEntriesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<RejectedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const { data: session, status } = useSession();
const empCode = String(session?.user?.id ?? "").trim();


  useEffect(() => {
  const loadRejectedEntries = async () => {
    if (!empCode) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/GetData/GetRejectedAuctionListByVendorCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmpCode: empCode }),
      });

      const raw = await res.json();

      if (!res.ok) {
        setRows([]);
        setError(raw?.message || "Failed to load rejected entries.");
        return;
      }

      const data = Array.isArray(raw) ? raw : raw?.data ?? [];
      console.log(data[0])
      setRows(data);
    } catch (err) {
      console.error(err);
      setRows([]);
      setError("Failed to load rejected entries.");
    } finally {
      setLoading(false);
    }
  };

  void loadRejectedEntries();
}, [empCode]);

  const openReapplyForm = async (row: RejectedRow) => {
  const encryptedId = await encrypt(String(row.ID ?? ""));
  const encryptedApid = await encrypt(String(row.APID ?? ""));
  const encryptedIddid = await encrypt(String(row.IDDID ?? ""));

router.push(
  `/Auction/RevertedEntries/Act?id=${encodeURIComponent(encryptedId)}&apid=${encodeURIComponent(
    encryptedApid,
  )}&iddid=${encodeURIComponent(encryptedIddid)}&reapply=1`,
);

  };

  return (
    <section className="max-w-6xl mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-slate-900">Rejected Auction Entries</h1>
        <p className="mt-1 text-sm text-slate-600">
          Vendors can review remarks and submit corrected documents again.
        </p>
      </div>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading rejected entries...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">ID</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Name</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Email</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Remarks</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Rejected On</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-sm text-slate-500">
                    No rejected entries found.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={`${row.ID}-${index}`}>
                    <td className="px-3 py-2 text-sm text-slate-700">{row.ID}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{row.NAME}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{row.EMAIL}</td>
                    <td className="px-3 py-2 text-sm text-red-700">{row.Remarks || "N/A"}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{row.CrDt?.split("T")[0] || "N/A"}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => void openReapplyForm(row)}
                        className="rounded-md bg-blue-700 px-3 py-1.5 text-xs text-white hover:bg-blue-800"
                      >
                        Re-Apply
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
