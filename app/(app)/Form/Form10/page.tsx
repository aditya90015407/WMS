"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Rows } from "lucide-react";
import encrypt from "@/components/Encrypt";
type Form10Row = {
  ID?: string | number | null;
  IDDID?: string | number | null;
  WasteCategory?: string | null;
  Waste?: string | null;
  TotalQty?: string | number | null;
  CrDt?: string | null;
  ReceiverName?: string | null;
  TransporterName?: string | null;
  MUnit: string
};

type ApiResponse = {
  success?: boolean;
  data?: Form10Row[];
  message?: string;
  error?: string;
};

type ApprovalStatusResponse = {
  success?: boolean;
  data?: {
    FDDID?: string | number | null;
    IDDID?: string | number | null;
    StsCode?: string | number | null;
  } | Array<{
    FDDID?: string | number | null;
    IDDID?: string | number | null;
    StsCode?: string | number | null;
  }>;
  message?: string;
  error?: string;
};

const PAGE_SIZE = 10;

const toText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const formatDate = (value: unknown): string => {
  const text = toText(value);
  if (!text) return "";
  return text.split("T")[0];
};

export default function Form10Page() {
  const router = useRouter();

  const [rows, setRows] = useState<Form10Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [fddid1, setFddid1] = useState("");
  const [iddid1, setIddid1] = useState("");
  const [form10Availability, setForm10Availability] = useState<Record<string, boolean>>({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [clickedrow, setClickedrow] = useState<Form10Row>();




  useEffect(() => {
    const loadRows = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/GetData/GetForm10DisposalList", {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await res.json()) as ApiResponse;

        if (!res.ok || !payload.success || !Array.isArray(payload.data)) {
          setRows([]);
          setError(payload.message || payload.error || "Failed to load Form 10 records");
          return;
        }

        setRows(payload.data);
      } catch {
        setRows([]);
        setError("Request failed while loading Form 10 records");
      } finally {
        setLoading(false);
      }
    };

    void loadRows();
  }, []);

  useEffect(() => {
    const checkAvailability = async () => {
      if (rows.length === 0) {
        setForm10Availability({});
        return;
      }

      setCheckingAvailability(true);

      try {
        const results = await Promise.all(
          rows.map(async (row) => {
            const fddid = toText(row.ID).trim();

            if (!fddid) {
              return [fddid, false] as const;
            }

            try {
              const res = await fetch("/api/GetData/GetDisposalApprovalStatus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ FDDID: fddid }),
              });

              const payload = (await res.json()) as ApprovalStatusResponse;

              if (!res.ok || !payload.success) {
                return [fddid, false] as const;
              }

              const statusRow = Array.isArray(payload.data) ? payload.data[0] : payload.data;
              return [fddid, Number(statusRow?.StsCode ?? 0) === 3] as const;
            } catch {
              return [fddid, false] as const;
            }
          }),
        );

        setForm10Availability(Object.fromEntries(results));
      } finally {
        setCheckingAvailability(false);
      }
    };

    void checkAvailability();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) =>
      [
        toText(row.ID),
        toText(row.IDDID),
        toText(row.WasteCategory),
        toText(row.Waste),
        toText(row.TotalQty),
        toText(row.TransporterName),
        toText(row.ReceiverName),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [rows, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, rows.length]);

  const canViewForm10 = (row: Form10Row) => {
    const fddid = toText(row.ID).trim();
    if (!fddid) return false;
    return Boolean(form10Availability[fddid]);
  };

  //  useEffect(()=>{
  //   const handleEncrypt=async(clickedrow : any)=>{

  //   const iddid= toText(clickedrow.IDDID).trim();
  //   const fddid= toText(clickedrow.ID).trim()
  //   const nextFddid = fddid ? await encrypt(fddid) : "";
  //   const nextIddid = iddid ? await encrypt(iddid) : "";

  //   setFddid1(nextFddid)
  //   setIddid1(nextIddid)
  //   }

  //   // if(!fddid || !iddid)
  //   // {
  //   //   setFddid1("");
  //   //   setIddid1("");
  //   //   return;
  //   // }
  //   void handleEncrypt(clickedrow);
  // },[clickedrow])

  const openForm10 = async (row: Form10Row) => {
    const iddid = toText(row.IDDID).trim();
    const fddid = toText(row.ID).trim()
    // const iddid= toText(clickedrow.IDDID).trim();
    // const fddid= toText(clickedrow.ID).trim()

    const nextFddid = fddid ? await encrypt(fddid) : "";
    const nextIddid = iddid ? await encrypt(iddid) : "";
    // console.log(nextFddid,nextIddid)
    setFddid1(nextFddid)
    setIddid1(nextIddid)
    if (!iddid) {
      alert("IDDID is missing.");
      return;
    }
    // console.log("hii")

    router.push(
      `/Form/Form10/Form10List?fddid=${encodeURIComponent(nextFddid)}&iddid=${encodeURIComponent(nextIddid)}`
    );

  };

  const downloadForm10 = async (row: Form10Row) => {
    const iddid = toText(row.IDDID).trim();
    const fddid = toText(row.ID).trim();

    if (!iddid) {
      alert("IDDID is missing.");
      return;
    }

    const nextFddid = fddid ? await encrypt(fddid) : "";
    const nextIddid = await encrypt(iddid);

    window.open(
      `/Form/Form10/Form10List?fddid=${encodeURIComponent(nextFddid)}&iddid=${encodeURIComponent(nextIddid)}&mode=print`,
      "_blank"
    );

  };

  return (
    <section className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-teal-600">FORM 10 LIST</h1>
        {/* <p className="mt-1 text-sm text-slate-600">
          Disposal records available for Form 10 view and download.
        </p> */}
      </div>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading records...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, IDDID, waste, receiver..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 sm:max-w-sm"
          />

          <div className="overflow-x-auto rounded-xl border border-slate-300">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-2 py-2 text-left font-semibold text-slate-900">ID</th>
                  <th className="border border-slate-300 px-2 py-2 text-left font-semibold text-slate-900">IDDID</th>
                  <th className="border border-slate-300 px-2 py-2 text-left font-semibold text-slate-900">Waste Category</th>
                  <th className="border border-slate-300 px-2 py-2 text-left font-semibold text-slate-900">Waste</th>
                  <th className="border border-slate-300 px-2 py-2 text-left font-semibold text-slate-900">Quantity</th>
                  <th className="border border-slate-300 px-2 py-2 text-left font-semibold text-slate-900">Created On</th>
                  <th className="border border-slate-300 px-2 py-2 text-left font-semibold text-slate-900">Form 10</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="border border-slate-300 px-2 py-3 text-center text-slate-600">
                      No records found.
                    </td>
                  </tr>
                )}

                {pagedRows.map((row, index) => (
                  <tr key={`form10-${currentPage}-${index}`} className="hover:bg-slate-50">
                    <td className="border border-slate-300 px-2 py-2 text-slate-800">
                      {toText(row.ID)}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-800">
                      {toText(row.IDDID)}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-800">
                      {toText(row.WasteCategory)}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-800">
                      {toText(row.Waste)}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-800">
                      {toText(row.TotalQty)}{" "}{row.MUnit}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-800">
                      {formatDate(row.CrDt)}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-800">
                      {checkingAvailability ? (
                        <span className="text-slate-500">Checking...</span>
                      ) : canViewForm10(row) ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              openForm10(row)
                              // setClickedrow(row)
                            }}

                            className="rounded bg-blue-700 px-3 py-1 text-white hover:bg-blue-800"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadForm10(row)}
                            className="inline-flex items-center gap-1 rounded bg-emerald-700 px-3 py-1 text-white hover:bg-emerald-800"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRows.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 sm:text-sm">
              <p>
                Showing {pagedRows.length} of {filteredRows.length} records
                {searchTerm.trim() ? " (filtered)" : ""}
              </p>

              <div className="flex flex-wrap items-center gap-2">
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
            </div>
          )}
        </div>
      )}
    </section>
  );
}
