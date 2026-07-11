"use client";

import encrypt from "@/components/Encrypt";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type AuctionRow = {
  AuctionID: string;
  DisposalType: string;
  AuctionDate: string;
  WasteCategory: string;
  Remarks: string;
  TotalQty: string
  // MUID: string
  MUnit: string
  Waste: string
  [key: string]: unknown;
};

type AuctionListResponse = {
  success?: boolean;
  data?: Array<Record<string, unknown>>;
  message?: string;
  error?: string;
};

const PAGE_SIZE = 10;

const toText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const firstValue = (row: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = toText(row[key]).trim();
    if (value) return value;
  }
  return "";
};

const formatDate = (value: unknown): string => {
  const text = toText(value).trim();
  if (!text) return "-";

  const datePart = text.split("T")[0];
  return datePart || text;
};

const mapAuctionRow = (row: Record<string, unknown>): AuctionRow => ({
  ...row,
  AuctionID: firstValue(row, ["AuctionID", "AuctionId", "AID", "ID"]),
  DisposalType: firstValue(row, ["DisType"]),
  AuctionDate: firstValue(row, ["AuctionDate", "Auction Date", "Date", "CrDt"]),
  WasteCategory: firstValue(row, ["WasteCategory", "Waste Category", "WC"]),
  Remarks: firstValue(row, ["Remarks", "Remark"]),
  Waste: firstValue(row, ["Waste"]),
  MUnit: firstValue(row, ["MUnit"]),
  TotalQty: firstValue(row, ["TotalQty"])
});

export default function AuctionList() {
  const router = useRouter();
  const [allAuctionRows, setAllAuctionRows] = useState<AuctionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadRows = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/GetData/GetAllAuctionsListToView", {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await res.json()) as AuctionListResponse;

        if (!res.ok || !payload.success) {
          setAllAuctionRows([]);
          setError(payload.message || payload.error || "Failed to load auction records");
          return;
        }

        if (!Array.isArray(payload.data)) {
          setAllAuctionRows([]);
          setError("Invalid auction response format");
          return;
        }

        setAllAuctionRows(payload.data.map(mapAuctionRow));
      } catch {
        setAllAuctionRows([]);
        setError("Request failed while loading auction records");
      } finally {
        setLoading(false);
      }
    };

    void loadRows();
  }, [refreshSeed]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allAuctionRows;

    return allAuctionRows.filter((row) =>
      [row.AuctionID, row.DisposalType, row.AuctionDate, row.WasteCategory, row.Waste]
        .some((value) => toText(value).toLowerCase().includes(q)),
    );
  }, [allAuctionRows, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const currentRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const openAuction = async (auctionId: string) => {
    if (!auctionId) {
      alert("Auction ID is missing.");
      return;
    }

    const encryptedID = await encrypt(auctionId);
    router.push(`/Auction/ListView/View?id=${encodeURIComponent(encryptedID)}`);
  };

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full">
          <h1 className="text-lg font-semibold text-teal-600 text-center">Auctions List</h1>
          {/* <p className="mt-1 text-xs text-slate-500">Click any auction row to view details.</p> */}
        </div>
        {/* <button
          type="button"
          onClick={() => setRefreshSeed((x) => x + 1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button> */}
        <img src="/refresh.png" alt="" className="h-5 cursor-pointer"
          onClick={() => setRefreshSeed((x) => x + 1)}
        />
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search auctions..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </div>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading auction records...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && filteredRows.length === 0 && (
        <p className="mt-4 text-sm text-slate-600">No auction records found.</p>
      )}

      {!loading && !error && filteredRows.length > 0 && (
        <>
          <p className="mt-4 text-sm text-slate-600">
            Showing {currentRows.length} of {filteredRows.length} auctions
          </p>

          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Auction ID
                  </th>
                  {/* <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Disposal Type
                  </th> */}
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
                  <th className="min-w-64 px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {currentRows.map((row, index) => (
                  <tr
                    key={`${row.AuctionID}-${index}`}
                    onClick={() => void openAuction(row.AuctionID)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {row.AuctionID || "-"}
                    </td>
                    {/* <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {row.DisposalType || "-"}
                    </td> */}
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {formatDate(row.AuctionDate)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {row.WasteCategory || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {row.Waste || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {row.TotalQty || "-"} {" "} {row.MUnit}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-700">
                      {row.Remarks || "-"}
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
              className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50"
            >
              First
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50"
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
              className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
              className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </>
      )}
    </section>
  );
}
