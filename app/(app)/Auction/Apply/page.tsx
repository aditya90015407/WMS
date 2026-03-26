"use client";

import encrypt from "@/components/Encrypt";
import { useRouter } from "next/navigation";
import { normalize } from "path";
import { useEffect, useMemo, useState } from "react";

type ViewRow = Record<string, string | number | null>;
type Option = {
  id: string;
  name: string;
};

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


const VIEW_FLAG = "GWT-ALL";

const toText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const getDisplayHeader = (header: string): string => {
  const key = header.trim().toUpperCase();
  const labelMap: Record<string, string> = {
    ID: "Code",
    WC: "Waste Category",
    WT: "Waste Type",
    SM: "Storage Method",
    PS: "Physical State",
    WD: "Waste Disposer",
    WR: "Waste Disposer",
    WQ: "Waste Quantity",
    GD: "Date of Entry",
    TD: "Target Date",
    //
    WW: "Waste",
    MAS: "Approval Stage",
    MASD: "Approval Stage Desc"
  };
  return labelMap[key] ?? header;
};

export default function WasteApprove() {


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

  type AuctionList = {
    ID: string
    Auctionable: string
    AuctionDate: string
    WCID: string
    WasteCategory: string
    Remarks: string
    CrBy: string
    CrDt: string
    IsActive: string
  }

  const [allauctionList, setAllauctionList] = useState<AuctionList[]>([])


  const [page, setPage] = useState(1);
  const pageSize = 10;

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const currentRows = allauctionList.slice(start, end);
  const totalPages = Math.ceil(allauctionList.length / pageSize);

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
  const [categories, setCategories] = useState<Option[]>([]);
  const [availableWaste, setAvailableWaste] = useState<Option[]>([]);
  const [disposers, setDisposers] = useState<Option[]>([]);
  const [physicalStates, setPhysicalStates] = useState<Option[]>([]);
  const [storageMethods, setStorageMethods] = useState<Option[]>([]);
  const [receivers, setReceivers] = useState<Option[]>([]);


  const router = useRouter()

  useEffect(() => {
    const loadRows = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("flag", VIEW_FLAG);
        if (filters.categoryId) params.set("WCID", filters.categoryId);
        if (filters.wasteId) params.set("WID", filters.wasteId);
        if (filters.disposerId) params.set("DID", filters.disposerId);
        if (filters.physicalStateId) params.set("PSID", filters.physicalStateId);
        if (filters.storageMethodId) params.set("SMID", filters.storageMethodId);
        if (filters.receiverId) params.set("AID", filters.receiverId);
        if (filters.date) params.set("GenerationDate", filters.date);

        const res = await fetch(`/api/auth/waste/view?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await res.json()) as ApiResponse;
        // console.log(payload)

        if (!res.ok || !payload.success) {
          setRows([]);
          setError(payload.message || payload.error || "Failed to load records");
          return;
        }

        if (!Array.isArray(payload.data)) {
          setRows([]);
          setError("Invalid response data format");
          return;
        }

        setRows(payload.data);

        const res2 = await fetch(`/api/GetData/GetAllAuctionList`, {
          method: "POST",
        });

        const rawData = await res2.json()
        // console.log(rawData)
        const data = rawData.map(normalizeData)
        setAllauctionList(data)

      } catch {
        setRows([]);
        setError("Request failed while loading waste records");
      } finally {
        setLoading(false);
      }
    };

    void loadRows();
  }, [refreshSeed, filters]);

  useEffect(() => {
    const loadBaseFilters = async () => {
      try {
        const [
          categoryRes,
          disposerRes,
          physicalRes,
          storageRes,
          receiverRes,
        ] = await Promise.all([
          fetch("/api/auth/Waste/generate?type=drop-wc", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/auth/Waste/generate?type=drop-dispo", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/auth/Waste/generate?type=drop-phstate", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/auth/Waste/generate?type=drop-smethod", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/auth/Waste/generate?type=drop-rcvr", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

        const [categoryPayload, disposerPayload, physicalPayload, storagePayload, receiverPayload] =
          (await Promise.all([
            categoryRes.json(),
            disposerRes.json(),
            physicalRes.json(),
            storageRes.json(),
            receiverRes.json(),
          ])) as Array<{ success?: boolean; data?: Option[] }>;

        setCategories(
          categoryPayload.success && Array.isArray(categoryPayload.data)
            ? categoryPayload.data
            : [],
        );
        setDisposers(
          disposerPayload.success && Array.isArray(disposerPayload.data)
            ? disposerPayload.data
            : [],
        );
        setPhysicalStates(
          physicalPayload.success && Array.isArray(physicalPayload.data)
            ? physicalPayload.data
            : [],
        );
        setStorageMethods(
          storagePayload.success && Array.isArray(storagePayload.data)
            ? storagePayload.data
            : [],
        );
        setReceivers(
          receiverPayload.success && Array.isArray(receiverPayload.data)
            ? receiverPayload.data
            : [],
        );
      } catch {
        setCategories([]);
        setDisposers([]);
        setPhysicalStates([]);
        setStorageMethods([]);
        setReceivers([]);
      }
    };

    void loadBaseFilters();
  }, []);

  useEffect(() => {
    const loadWaste = async () => {
      if (!filters.categoryId) {
        setAvailableWaste([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/auth/Waste/generate?type=drop-waste&wcid=${encodeURIComponent(filters.categoryId)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );
        const payload = (await res.json()) as { success?: boolean; data?: Option[] };
        if (payload.success && Array.isArray(payload.data)) {
          setAvailableWaste(payload.data);
          return;
        }
        setAvailableWaste([]);
      } catch {
        setAvailableWaste([]);
      }
    };

    void loadWaste();
  }, [filters.categoryId]);

  const headers = useMemo(() => {
    const keySet = new Set<string>();
    for (const row of rows) {
      Object.keys(row).forEach((k) => keySet.add(k));
    }
    return Array.from(keySet);
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => toText(value).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  // const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query, filters]);


  return (
    <section className="max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900"> Approve Waste</h1>

        </div>
        <button
          type="button"
          onClick={() => setRefreshSeed((x) => x + 1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {/* <div className="mt-4 grid grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Date</label>
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, date: e.target.value }))
                        }
                        className="w-1/2 min-w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Category</label>
                    <select
                        value={filters.categoryId}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                categoryId: e.target.value,
                                wasteId: "",
                            }))
                        }
                        className="w-1/2 min-w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
                    >
                        <option value="">Select</option>
                        {categories.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Waste</label>
                    <select
                        value={filters.wasteId}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, wasteId: e.target.value }))
                        }
                        className="w-1/2 min-w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
                        disabled={!filters.categoryId}
                    >
                        <option value="">Select</option>
                        {availableWaste.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Disposer</label>
                    <select
                        value={filters.disposerId}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, disposerId: e.target.value }))
                        }
                        className="w-1/2 min-w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
                    >
                        <option value="">Select</option>
                        {disposers.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Physical State
                    </label>
                    <select
                        value={filters.physicalStateId}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, physicalStateId: e.target.value }))
                        }
                        className="w-1/2 min-w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
                    >
                        <option value="">Select</option>
                        {physicalStates.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Method of Storage
                    </label>
                    <select
                        value={filters.storageMethodId}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, storageMethodId: e.target.value }))
                        }
                        className="w-1/2 min-w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
                    >
                        <option value="">Select</option>
                        {storageMethods.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Receiver</label>
                    <select
                        value={filters.receiverId}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, receiverId: e.target.value }))
                        }
                        className="w-1/2 min-w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
                    >
                        <option value="">Select</option>
                        {receivers.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

            </div>

            <div className="mt-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Search
                </label>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search in all columns..."
                    className="w-1/2 min-w-40 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
                />
            </div> */}

      {loading && (
        <p className="mt-4 text-sm text-slate-600">Loading waste records...</p>
      )}

      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && headers.length === 0 && (
        <p className="mt-4 text-sm text-slate-600">No records found.</p>
      )}

      {!loading && !error && headers.length > 0 && (
        <>
          {/* <p className="mt-4 text-sm text-slate-600">
            Showing {pagedRows.length} of {filteredRows.length} records
          </p> */}
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr >
                  {/* {headers.map((header) => (
                                        <th
                                            key={header}
                                            className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-700"
                                        >
                                            {getDisplayHeader(header)}
                                        </th>
                                    ))} */}
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                  >ID</th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                  >Auction Date</th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                  >Waste Category</th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                  >Remarks</th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                  >Posted On</th>
                  {/* <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                    >Waste Category</th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                    >Waste Type</th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                    >Storage Method</th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                    >Physical form</th> */}

                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {currentRows?.map((row, index) => (
                  <tr key={index}
                    onClick={async () => {
                      const encryptedID = await encrypt(row.ID!.toString());
                      router.push(`./Apply/Act?id=${encryptedID}`);
                    }}
                    className="cursor-pointer"
                  >
                    <td
                      className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                    >{row.ID}
                    </td>
                    <td
                      className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                    >{row.AuctionDate}
                    </td>
                    <td
                      className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                    >{row.WasteCategory}
                    </td>
                    <td
                      className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                    >{row.Remarks}
                    </td>
                    <td
                      className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                    >{row.CrDt?.split("T")[0]}
                    </td>
                  </tr>
                ))}
                {/* {pagedRows.map((row, index) => (
                                    <tr key={`row-${(currentPage - 1) * pageSize + index}`}
                                        onClick={async () => {
                                            const encryptedID = await encrypt(row.ID!.toString());
                                            router.push(`./Approve/Act?id=${encryptedID}`);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        {headers.map((header) => (
                                            <td
                                                key={`${index}-${header}`}
                                                className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                            >
                                                {toText(row[header]) || "-"}
                                            </td>
                                        ))}
                                    </tr>
                                ))} */}
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
