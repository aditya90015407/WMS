"use client";

import decrypt from "@/components/Decrypt";
import encrypt from "@/components/Encrypt";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import toast, { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";

type ViewRow = Record<string, string | number | null>;

type ApiResponse = {
  success?: boolean;
  data?: ViewRow[];
  message?: string;
  error?: string;
};

type FilterState = {
  date: string;
  categoryId: string;
  wasteId: string;
  disposerId: string;
  physicalStateId: string;
  storageMethodId: string;
  receiverId: string;
};

const toText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
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

export default function AuctionSelect({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = React.use(searchParams)
  const encoded = params.id;
  // const encoded = params.get("id");

  type AuctionParticipants = {
    ID: string;
    VID: string;
    VendorCode: string;
    NAME: string;
    EMAIL: string;
    CrBy: string;
    CrDt: string;
    IsActive: string;
  };

  const [allAuctionParticipants, setAllAuctionParticipants] = useState<AuctionParticipants[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const currentRows = allAuctionParticipants.slice(start, end);
  const totalPages = Math.ceil(allAuctionParticipants.length / pageSize);

  const [selectedVid, setSelectedVid] = useState("");
  const [selectedVendorCode, setSelectedVendorCode] = useState("");
  const [selectedVendorName, setSelectedVendorName] = useState("");
  const [selectedRowVid, setSelectedRowVid] = useState("");

  const [rows, setRows] = useState<ViewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [refreshSeed, setRefreshSeed] = useState(0);

  const [filters, setFilters] = useState<FilterState>({
    date: "",
    categoryId: "",
    wasteId: "",
    disposerId: "",
    physicalStateId: "",
    storageMethodId: "",
    receiverId: "",
  });

  const router = useRouter();


  const { data: session } = useSession();

  const empCode = String(session?.user?.id ?? "").trim();


  useEffect(() => {
    const loadRows = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!encoded) return;
        const id = await decrypt(encoded);

        const res2 = await fetch("/api/GetData/GetLevel2ApprovedAuctionParticipantsByID", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ID: encoded }),
        });

        const rawData = await res2.json();
        console.log("Approved participants payload:", rawData);

        if (!res2.ok || !rawData.success) {
          throw new Error(rawData.message || "API failed");
        }

        const data = rawData.data.map(normalizeData);
        setAllAuctionParticipants(data);
      } catch {
        setRows([]);
        setError("Request failed while loading Applicants records");
      } finally {
        setLoading(false);
      }
    };

    void loadRows();
  }, [refreshSeed, filters, encoded]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => toText(value).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query, filters]);

  async function handleSelectSubmit() {
    try {
      if (!encoded || !String(selectedVid).trim()) {

        toast.error("Please enter VID.");
        return;
      }

      const id = await decrypt(encoded);

      const res = await fetch("/api/SetData/SetSelectedVendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IDDID: id,
          VID: String(selectedVid).trim(),
          EmpCode: empCode

        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to save selected vendor");
        return;
      }

      toast.success("Selected vendor saved!");
      router.back()
    } catch (err) {
      console.error("Select submit failed:", err);
      toast.error(err instanceof Error ? err.message : "Error while saving selected vendor");
    }

  }

  return (
    <section className="max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Toaster />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full">
          <h1 className="text-lg font-semibold text-slate-900">Select Auction Participants</h1>
          <h1 className="text-sm text-center font-semibold text-slate-900">Applicants List</h1>
        </div>
        <button
          type="button"
          onClick={() => setRefreshSeed((x) => x + 1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading Auction Participants records...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">
                    Select
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">VendorCode</th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">Name</th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">Email</th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">Applied By</th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">Applied On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {currentRows?.map((row, index) => (
                  <tr
                    key={index}
                    className="cursor-pointer"
                  >
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedRowVid === row.VID}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRowVid(row.VID);
                            setSelectedVid(String(row.VID));
                            setSelectedVendorCode(row.VendorCode)
                            setSelectedVendorName(row.NAME)
                          } else {
                            setSelectedRowVid("");
                            setSelectedVid("");
                          }
                        }}
                      />
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">{row.VendorCode}</td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">{row.NAME}</td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">{row.EMAIL}</td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">{row.CrBy}</td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {row?.CrDt?.split("T")[0]} {row?.CrDt?.split("T")[1]?.split(".")[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <button type="button" onClick={() => setPage(1)} disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50">
              First
            </button>
            <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50">
              Prev
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50">
              Next
            </button>
            <button type="button" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50">
              Last
            </button>
          </div>
        </>
      )}

      <div className="mt-4">
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Selected Vendor
        </label>
        <input
          type="text"
          value={selectedVendorName + " ( " + selectedVendorCode + " )"}
          readOnly
          // onChange={(e) => setSelectedVid(e.target.value)}
          // placeholder="Type VID here..."
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </div>

      <button
        type="button"
        onClick={handleSelectSubmit}
        className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-800"
      >
        Submit Selected Vendor
      </button>
    </section>
  );
}
