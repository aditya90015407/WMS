"use client";

import { log } from "console";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuctionList = {
  ID: string;
  DisType: string;
  DisposalType: string;
  Auctionable: string;
  AuctionDate: string;
  WCID: string;
  WasteCategory: string;
  Remarks: string;
  CrBy: string;
  CrDt: string;
  IsActive: string;
};

function normalizeData<T extends Record<string, any>>(row: T) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      if (value === null || value === undefined) return [key, "NA"];
      if (typeof value === "object") return [key, "NA"];
      return [key, value];
    })
  );
}

export default function DisposalListPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allDisposalList, setAllDisposalList] = useState<AuctionList[]>([]);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const router = useRouter();

  const totalPages = Math.max(1, Math.ceil(allDisposalList.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const currentRows = allDisposalList.slice(start, start + pageSize);

  useEffect(() => {
    const loadAuctions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/GetData/GetAllDisposalList`, {
          method: "GET",
        });

        const rawData = await res.json();
        console.log(rawData);
        const data = rawData.map(normalizeData);
        setAllDisposalList(data);
      } catch {
        setAllDisposalList([]);
        setError("Failed to load auction list");
      } finally {
        setLoading(false);
      }
    };

    void loadAuctions();
  }, []);

  return (
    <section className="max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full">
          <h1 className="text-lg text-center font-semibold text-slate-900">
            Approve Auction Applicants
          </h1>
          <h1 className="text-sm text-center font-semibold text-slate-900">
            Active Auctions List
          </h1>
        </div>
      </div>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading Auction records...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && currentRows.length === 0 && (
        <p className="mt-4 text-sm text-slate-600">No records found.</p>
      )}

      {!loading && !error && currentRows.length > 0 && (
        <>
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">
                    ID
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">
                    DisType
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">
                    Waste Category
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">
                    Remarks
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {currentRows.map((row, index) => (
                  <tr
                    key={index}
                    className="cursor-pointer"
                    onClick={() => {
                      try {
                        const iddid = String(row.ID ?? "").trim();
                        const wcid = String(row.WCID ?? "").trim();
                           

                        const disposalType=String(row.DisType ?? "").trim();
                        console.log("Row clicked:", { iddid, wcid, disposalType });
                        if (!iddid || !disposalType) return;
                      
                                  const target =
            disposalType?.toLowerCase() === "internal"
              ? `/Disposal/Generate/Internal?id=${encodeURIComponent(iddid)}`
              : wcid === "1"
              ? `/Disposal/Generate/Hazardous?id=${encodeURIComponent(iddid)}`
              :
              `/Disposal/Generate/NonHazardous?id=${encodeURIComponent(iddid)}`
              ;

          if (!target) {
            alert("Invalid disposal route");
            return;
          }

          router.push(target);

                        
                      } catch (err) {
                        console.error("Redirect failed:", err);
                      }
                    }}
                  >
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">{row.ID}</td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">{row.DisType}</td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">{row.WasteCategory}</td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">{row.Remarks}</td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {row.AuctionDate || row.CrDt?.split("T")[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50"
            >
              First
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </>
      )}
    </section>
  );
}
