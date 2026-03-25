"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toForm3Entry } from "@/lib/form3-columns";

type ViewRow = Record<string, string | number | null>;

type ApiResponse = {
  success?: boolean;
  data?: ViewRow[];
  message?: string;
  error?: string;
};

type FormEntry = {
  code: string;
  date: string;
  targetDate: string;
  sapWasteCode: string;
  wasteCategory: string;
  wasteType: string;
  waste: string;
  quantity: string;
  storageMethod: string;
  physicalState: string;
  disposer: string;
  receiver: string;
  approvalStatus: string;
  unitDesc: string;
  dateOfIssuance: string;
  referenceNo: string;
  dispId: string;
  deptId: string;
  dept: string;
  receiverId: string;
  wcid: string;
  stsCode: string;
};

const PAGE_SIZE = 10;

const toText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const getDestinedDisplay = (entry: FormEntry): string => {
  const disposerLabel = entry.disposer?.trim() || "";
  const receiverLabel = entry.receiver?.trim() || "";

  if (disposerLabel && receiverLabel) {
    return `${disposerLabel} / Received From: ${receiverLabel}`;
  }
  if (receiverLabel) return `Received From: ${receiverLabel}`;
  return disposerLabel;
};

const esc = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const createForm3Html = (entry: FormEntry): string => {
  const typeWithCategory = [entry.waste || entry.wasteType, entry.sapWasteCode]
    .filter(Boolean)
    .join(" / ");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Form3_${esc(entry.code)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color: #111827; }
    h1, h2, p { margin: 0; }
    .center { text-align: center; }
    .mt2 { margin-top: 8px; } .mt4 { margin-top: 16px; } .mt10 { margin-top: 40px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 13px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; }
    .small { font-size: 13px; }
  </style>
</head>
<body>
  <div class="center">
    <h1>FORM 3</h1>
    <p class="small"><i>[See rules 6(5), 13(7), 14(6), 16(5) and 20(1)]</i></p>
    <h2 class="mt2">FORMAT FOR MAINTAINING RECORDS OF HAZARDOUS AND OTHER WASTES</h2>
  </div>

  <div class="mt4 small">
    <p>1. Name and address of the facility : ${esc(entry.unitDesc)}</p>
    <p class="mt2">2. Date of issuance of authorisation and its reference number : ${esc(
    [entry.dateOfIssuance, entry.referenceNo].filter(Boolean).join(" ")
  )}</p>
    <p class="mt2">3. Description of hazardous and other wastes handled (Generated or Received)</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type of waste with category</th>
        <th>Total quantity(MT)</th>
        <th>Method of Storage</th>
        <th>Destined to or received from</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${esc(entry.date)}</td>
        <td>${esc(typeWithCategory)}</td>
        <td>${esc(entry.quantity)}</td>
        <td>${esc(entry.storageMethod)}</td>
        <td>${esc(getDestinedDisplay(entry))}</td>
      </tr>
    </tbody>
  </table>

  <p class="mt4 small"><i>* Fill up above table separately for indigenous and imported waste.</i></p>

  <div class="mt4 small">
    <p>4. Date wise description of management of hazardous and other wastes including products sent and to whom in case of recyclers or pre-processor or utiliser:</p>
    <p class="mt2">5. Date of environmental monitoring (as per authorisation or guidelines of Central Pollution Control Board):</p>
  </div>

  <div class="mt10 small" style="display:flex;justify-content:space-between;align-items:flex-end;">
    <div>
      <p>Date: ${esc(entry.date)}</p>
      <p class="mt2">Place: </p>
    </div>
    <p><b>Signature of occupier</b></p>
  </div>
</body>
</html>`;
};

export default function Form3Page() {
  const [rows, setRows] = useState<ViewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<FormEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadRows = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("flag", "GWT-ALL");
        const res = await fetch(`/api/auth/waste/view?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await res.json()) as ApiResponse;
        if (!res.ok || !payload.success || !Array.isArray(payload.data)) {
          setRows([]);
          setError(payload.message || payload.error || "Failed to load Form 3 data");
          return;
        }
        setRows(payload.data);
      } catch {
        setRows([]);
        setError("Request failed while loading Form 3 data");
      } finally {
        setLoading(false);
      }
    };

    void loadRows();
  }, []);

  const tableRows = useMemo<FormEntry[]>(() => {
    const sortedRows = [...rows].sort((a, b) => {
      const aCode = toText(a.ID ?? a.Code).trim();
      const bCode = toText(b.ID ?? b.Code).trim();
      const aNum = Number(aCode);
      const bNum = Number(bCode);
      if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum;
      return aCode.localeCompare(bCode, undefined, { numeric: true, sensitivity: "base" });
    });

    return sortedRows.map((row) => toForm3Entry(row as Record<string, unknown>) as FormEntry);
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return tableRows;

    return tableRows.filter((item) =>
      [
        item.code,
        item.date,
        item.targetDate,
        item.wasteCategory,
        item.wasteType,
        item.waste,
        item.quantity,
        item.storageMethod,
        item.physicalState,
        item.disposer,
        item.receiver,
        item.approvalStatus,
        item.wcid,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [tableRows, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [rows.length, searchTerm]);

  const onDownload = (entry: FormEntry) => {
    const html = createForm3Html(entry);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `FORM3_${entry.code || "ENTRY"}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">FORM 3</h1>
        <p className="text-sm italic text-slate-700">[See rules 6(5), 13(7), 14(6), 16(5) and 20(1)]</p>
        <h2 className="mt-2 text-base font-semibold text-slate-900">
          FORMAT FOR MAINTAINING RECORDS OF HAZARDOUS AND OTHER WASTES
        </h2>
      </div>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading records...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <input
              id="form3-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code, date, waste, receiver..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 sm:max-w-sm"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-300">
            <table className="w-[80%] border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-2 py-0.5 text-left font-semibold text-slate-900">ID</th>
                  <th className="min-w-[110px] whitespace-nowrap border border-slate-300 px-2 py-0.5 text-left font-semibold text-slate-900">Date</th>
                  <th className="border border-slate-300 px-2 py-0.5 text-left font-semibold text-slate-900">Waste Category</th>
                  <th className="border border-slate-300 px-2 py-0.5 text-left font-semibold text-slate-900">Waste Type</th>
                  <th className="border border-slate-300 px-2 py-0.5 text-left font-semibold text-slate-900">Waste</th>
                  <th className="border border-slate-300 px-2 py-0.5 text-left font-semibold text-slate-900">Quantity</th>
                  <th className="border border-slate-300 px-2 py-0.5 text-left font-semibold text-slate-900">Storage</th>
                  <th className="border border-slate-300 px-2 py-0.5 text-left font-semibold text-slate-900">Physical State</th>
                  <th className="border border-slate-300 px-2 py-0.5 text-left font-semibold text-slate-900">Disposer</th>
                  <th className="border border-slate-300 px-2 py-0.5 text-left font-semibold text-slate-900">Receiver</th>
                  <th className="border border-slate-300 px-2 py-0.5 text-left font-semibold text-slate-900">ApprovalStatus</th>
                  <th className="min-w-[110px] whitespace-nowrap border border-slate-300 px-2 py-0.5 text-left font-semibold text-slate-900">Target Date</th>
                  <th className="min-w-[120px] border border-slate-300 px-2 py-0.5 text-left font-semibold text-slate-900">Waste Form</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.length === 0 && (
                  <tr>
                    <td colSpan={13} className="border border-slate-300 px-2 py-3 text-center text-slate-600">
                      No records found for the current search.
                    </td>
                  </tr>
                )}
                {pagedRows.map((item, index) => (
                  <tr key={`form3-entry-${(currentPage - 1) * PAGE_SIZE + index}`}>
                    <td className="border border-slate-300 px-2 py-0.5 text-slate-800">{item.code}</td>
                    <td className="whitespace-nowrap border border-slate-300 px-2 py-0.5 text-slate-800">{item.date}</td>
                    <td className="border border-slate-300 px-2 py-0.5 text-slate-800">{item.wasteCategory}</td>
                    <td className="border border-slate-300 px-2 py-0.5 text-slate-800">{item.wasteType}</td>
                    <td className="border border-slate-300 px-2 py-0.5 text-slate-800">{item.waste}</td>
                    <td className="border border-slate-300 px-2 py-0.5 text-slate-800">{item.quantity}</td>
                    <td className="border border-slate-300 px-2 py-0.5 text-slate-800">{item.storageMethod}</td>
                    <td className="border border-slate-300 px-2 py-0.5 text-slate-800">{item.physicalState}</td>
                    <td className="border border-slate-300 px-2 py-0.5 text-slate-800">{item.disposer}</td>
                    <td className="border border-slate-300 px-2 py-0.5 text-slate-800">{item.receiver}</td>
                    <td className="border border-slate-300 px-2 py-0.5 text-slate-800">{item.approvalStatus}</td>
                    <td className="whitespace-nowrap border border-slate-300 px-2 py-0.5 text-slate-800">{item.targetDate}</td>
                    <td className="border border-slate-300 px-2 py-0.5 text-slate-800">
                      <div className="flex items-center gap-2">


                        {item.wcid !== "1" && <div className="text-center">Not Applicable</div>}

                        {item.wcid === "1" && item.stsCode === "3" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setSelectedEntry(item)}
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                            >
                              View Form
                            </button>
                            <button
                              type="button"
                              onClick={() => onDownload(item)}
                              className="rounded-md border border-slate-300 p-1 hover:bg-slate-50"
                              title="Download Form 3"
                              aria-label="Download Form 3"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {item.wcid === "1" && item.stsCode === "2" && (
                          <div className="text-center">Download requires approval.</div>
                        )}


                        {item.wcid == "1" && item.stsCode != "3" && item.stsCode != "2" && (
                          <div className="text-center">Not Applicable.</div>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && filteredRows.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 sm:text-sm">
          <p>
            Showing {pagedRows.length} of {filteredRows.length} records
            {searchTerm.trim() ? " (filtered)" : ""} (Code Ascending)
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
            <span>Page {currentPage} of {totalPages}</span>
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

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-2 md:p-4">
          <div className="max-h-[96vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-3 md:p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Waste Form - {selectedEntry.code || "Entry"}</h3>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="mt-4 text-center">
              <h1 className="text-xl font-bold text-slate-900">FORM 3</h1>
              <p className="text-xs italic text-slate-700">[See rules 6(5), 13(7), 14(6), 16(5) and 20(1)]</p>
              <h2 className="mt-2 text-sm font-semibold text-slate-900">
                FORMAT FOR MAINTAINING RECORDS OF HAZARDOUS AND OTHER WASTES
              </h2>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-800 sm:text-sm">
              <p>1. Name and address of the facility : {selectedEntry.unitDesc}</p>
              <p>
                2. Date of issuance of authorisation and its reference number :{" "}
                {[selectedEntry.dateOfIssuance, selectedEntry.referenceNo].filter(Boolean).join(" ")}
              </p>
              <p>3. Description of hazardous and other wastes handled (Generated or Received)</p>
            </div>

            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-300">
              <table className="min-w-[760px] border-collapse text-xs sm:min-w-full sm:text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="min-w-[110px] whitespace-nowrap border border-slate-300 px-2 py-2 text-left">Date</th>
                    <th className="border border-slate-300 px-2 py-2 text-left">Type of waste with category</th>
                    <th className="border border-slate-300 px-2 py-2 text-left">Total quantity(MT)</th>
                    <th className="border border-slate-300 px-2 py-2 text-left">Method of Storage</th>
                    <th className="border border-slate-300 px-2 py-2 text-left">Destined to or received from</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="whitespace-nowrap border border-slate-300 px-2 py-2">{selectedEntry.date}</td>
                    <td className="border border-slate-300 px-2 py-2">
                      {[selectedEntry.waste || selectedEntry.wasteType, selectedEntry.sapWasteCode]
                        .filter(Boolean)
                        .join(" / ")}
                    </td>
                    <td className="border border-slate-300 px-2 py-2">{selectedEntry.quantity}</td>
                    <td className="border border-slate-300 px-2 py-2">{selectedEntry.storageMethod}</td>
                    <td className="border border-slate-300 px-2 py-2">{getDestinedDisplay(selectedEntry)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs italic text-slate-700 sm:text-sm">
              * Fill up above table separately for indigenous and imported waste.
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-800 sm:text-sm">
              <p>
                4. Date wise description of management of hazardous and other wastes including products sent and to whom in case of
                recyclers or pre-processor or utiliser:
              </p>
              <p>5. Date of environmental monitoring (as per authorisation or guidelines of Central Pollution Control Board):</p>
            </div>

            <div className="mt-8 flex flex-col gap-3 text-xs text-slate-900 sm:flex-row sm:items-end sm:justify-between sm:text-sm">
              <div>
                <p>Date: {selectedEntry.date || "...................."}</p>
                <p className="mt-2">Place: ....................</p>
              </div>
              <p className="font-semibold">Signature of occupier</p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => onDownload(selectedEntry)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
