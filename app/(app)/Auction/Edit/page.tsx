"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import encrypt from "@/components/Encrypt";


type DisposalRow = {
  ID?: string | number;
  IDDID?: string | number;
  DisType?: string;
  WasteCategory?: string;
  Waste?: string;
  TotalQty?: string | number;
  Status?: string;
  CrDt?: string;
  MUnit: string
};

function normalizeData<T extends Record<string, unknown>>(row: T) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      if (value === null || value === undefined) return [key, ""];
      if (typeof value === "object" && !Array.isArray(value)) return [key, ""];
      return [key, value];
    }),
  );
}

export default function DisposalEditPage() {
  const router = useRouter();

  const [rows, setRows] = useState<DisposalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  useEffect(() => {
    const loadRows = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/GetData/GetAllInitiatedAuctionListEdit", {
          method: "GET",
          cache: "no-store",
        });

        const rawData = await res.json();
        // console.log(rawData);

        const data = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data)
            ? rawData.data
            : [];
        //  console.log(res)
        const normalized = data.map(normalizeData) as DisposalRow[];
        setRows(normalized);
      } catch (err) {
        console.error("Failed to load disposal edit list", err);
        setRows([]);
        setError("Failed to load disposal records");
      } finally {
        setLoading(false);
      }
    };

    void loadRows();
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) =>
      [
        row.ID,
        // row.IDDID,
        row.DisType,
        row.WasteCategory,
        row.Waste,
        row.TotalQty,
        // row.Status,
        // row.CrDt,
        row.MUnit
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const handleRowClick = async (row: DisposalRow) => {
    const iddid = String(row.ID ?? "").trim();
    const disType = String(row.DisType ?? "").trim().toLowerCase();
    //  console.log(disType,iddid)
    if (!iddid) return;
    const encryptedID = await encrypt(iddid)

    const target = `/Auction/Edit/Auctionable?id=${encodeURIComponent(encryptedID)}`;

    router.push(target);
  };

  return (
    <section className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full">
          <h1 className="text-xl font-semibold text-teal-600 text-center w-full">Edit Auction</h1>
          {/* <p className="text-sm text-slate-600 w-full text-center">
            Choose a disposal record to edit details.
          </p> */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, type, waste, category..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none md:w-80"
          />
        </div>

        <img src="/refresh.png" alt="" className="h-4.5 me-3 cursor-pointer"
          onClick={() => window.location.reload()}
        />

      </div>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading disposal records...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && pagedRows.length === 0 && (
        <p className="mt-4 text-sm text-slate-600">No records found.</p>
      )}

      {!loading && !error && pagedRows.length > 0 && (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Disposal ID
                  </th>
                  {/* <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Original ID
                  </th> */}
                  <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Disposal Type
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Waste Category
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Waste
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Quantity
                  </th>
                  {/* <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Status
                  </th> */}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {pagedRows.map((row, index) => (
                  <tr
                    key={`${row.ID ?? "id"}-${row.IDDID ?? "iddid"}-${index}`}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleRowClick(row)}
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {String(row.ID ?? "")}
                    </td>
                    {/* <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {String(row.IDDID ?? "")}
                    </td> */}
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {String(row.DisType ?? "")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {String(row.WasteCategory ?? "")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {String(row.Waste ?? "")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {String(row.TotalQty ?? "")}{" "}{row.MUnit}
                    </td>
                    {/* <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {String(row.Status ?? "")}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-700">
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
