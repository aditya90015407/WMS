"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import encrypt from "@/components/Encrypt";

type RejectedRow = {
  WCID?: String
  ID?: String
  IDDID?: String
  DisposalRefNo: string
  AuctionID: String
  DateOfDisposal: String
  DisType: String
  Waste: String
  WasteCategory: String
  CrBy: string
  IsActive: string
  CrDt: string
  TotalQty: string
  MUnit: string
}


export default function RevertedDisposalList() {

  function normalizeData<T extends Record<string, any>>(row: T) {
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => {
        if (value === null || value === undefined) {
          return [key, "NA"];
        }

        if (typeof value === "object") {
          // return [key, JSON.stringify(value)];
          return [key, "NA"];
        }

        return [key, value];
      })
    );
  }
  const router = useRouter();
  const [rows, setRows] = useState<RejectedRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoadding] = useState(true);
  const { data: session, status } = useSession();
  const deptId = String(session?.user?.deptId ?? "").trim();
  //  console.log(deptId)
  useEffect(() => {
    if (status === "loading") return;

    if (!deptId) {
      setRows([]);
      setError("Department ID is not available in session.");
      setLoadding(false);
      return;
    }

    const loadRejectedRows = async () => {
      try {
        setLoadding(true);
        setError("");

        const res = await fetch("/api/GetData/GetDisposalRevertedEntriesByDept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ DeptID: deptId })
        }
        )

        const raw = await res.json();

        if (!res.ok) {

          setRows([]);
          setError(raw?.message || "Failed to load rejected entries.")
          return;

        }

        const rawData = Array.isArray(raw) ? raw : raw?.data ?? [];
        // console.log(rawData)
        const data = rawData.map(normalizeData)
        setRows(data);
      }
      catch (err) {
        setRows([]);
        setError("Failed to load Rejected Entries")
      }
      finally {
        setLoadding(false);
      }
    };
    void loadRejectedRows();
  }, [deptId, status])

  return (
    <section className="max-w-6xl mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-center relative">
        <h1 className="text-lg font-semibold text-teal-600">Rejected Disposal Entries</h1>
        {/* <p className="mt-1 text-sm text-slate-600">
          Vendors can review remarks and submit corrected documents again.
        </p> */}

        <img src="/refresh.png" alt="" className="h-5 cursor-pointer absolute top-1 right-5"
          onClick={() => window.location.reload()}
        />
      </div>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading rejected entries...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Final Ref No.</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Initiated Disposal ID</th>
                {/* <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Date of Disposal</th> */}
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Disposal Type</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Waste Category</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Waste</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Quantity</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Created On</th>

                {/* <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Total Qty</th> */}
                {/* <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Rejected On</th> */}
                {/* <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Action</th> */}
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
                  <tr
                    key={`${row.ID}-${index}`}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={async () => {
                      const rawId = String(row.IDDID ?? "").trim();
                      const finalId = rawId ? await encrypt(rawId) : "";
                      const iddid = await encrypt(String(row.IDDID));

                      const encryptedId = await encrypt(String(row.ID))

                      const wcid = String(row.WCID ?? "").trim();
                      // console.log(wcid)
                      const disType = String(row.DisType ?? "").trim().toLowerCase();
                      // console.log(disType)

                      if (!finalId) return;

                      const target =
                        disType === "internal"
                          ? `/Disposal/RevertedEntries/Internal?id=${encodeURIComponent(encryptedId)}`
                          : wcid === "1"
                            ? `/Disposal/RevertedEntries/Hazardous?id=${encodeURIComponent(encryptedId)}`
                            : `/Disposal/RevertedEntries/NonHazardous?id=${encodeURIComponent(encryptedId)}`;

                      // const target =
                      //   disType === "internal"
                      //     ? `/Disposal/RevertedEntries/Internal?id=${encodeURIComponent(finalId)}&iddid=${encodeURIComponent(iddid)}`
                      //     : wcid === "1"
                      //       ? `/Disposal/RevertedEntries/h2?id=${encodeURIComponent(String(row.ID))}`
                      //       : `/Disposal/RevertedEntries/NonHazardous?id=${encodeURIComponent(finalId)}`;

                      router.push(target);



                      if (!target) {
                        alert("Invalid disposal route");
                        return;
                      }


                    }

                    }
                  >
                    <td className="px-3 py-2 text-xs text-slate-700">{row.DisposalRefNo}</td>
                    <td className="px-3 py-2 text-xs text-slate-700">{row.IDDID}</td>
                    {/* <td className="px-3 py-2 text-xs text-slate-700">{row.DateOfDisposal}</td> */}
                    <td className="px-3 py-2 text-xs text-slate-700">{row.DisType}</td>
                    <td className="px-3 py-2 text-xs text-slate-700">{row.WasteCategory}</td>
                    <td className="px-3 py-2 text-xs text-slate-700">{row.Waste}</td>
                    <td className="px-3 py-2 text-xs text-slate-700">{row.TotalQty}{" "}{row.MUnit}</td>
                    <td className="px-3 py-2 text-xs text-slate-700">{row.CrDt?.split("T")[0]}</td>
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


