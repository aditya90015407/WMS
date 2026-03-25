"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

type EditState = {
  id: string;
  date: string;
  categoryId: string;
  wasteId: string;
  receiver: string;
  disposer: string;
  physicalState: string;
  storage: string;
  quantity: string;
  disposalTarget: string;
};

const PAGE_SIZE = 10;

const toText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const asDateValue = (value: unknown): string => {
  const text = toText(value).trim();
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(text);
  return match ? match[1] : "";
};

const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

export default function WasteEditPage() {
  const [rows, setRows] = useState<ViewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [page, setPage] = useState(1);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Option[]>([]);
  const [availableWaste, setAvailableWaste] = useState<Option[]>([]);
  const [receivers, setReceivers] = useState<Option[]>([]);
  const [disposers, setDisposers] = useState<Option[]>([]);
  const [physicalStates, setPhysicalStates] = useState<Option[]>([]);
  const [storageMethods, setStorageMethods] = useState<Option[]>([]);

  useEffect(() => {
    const loadRows = async () => {
      setLoading(true);
      setError(null);

      try {
        const flags = ["GWT-ALL", "GWT-VW"];
        let loadedRows: ViewRow[] = [];
        let lastError = "Failed to load records";

        for (const flag of flags) {
          const params = new URLSearchParams();
          params.set("flag", flag);
          const res = await fetch(`/api/auth/waste/view?${params.toString()}`, {
            method: "GET",
            cache: "no-store",
          });
          const payload = (await res.json()) as ApiResponse;
          if (!res.ok || !payload.success || !Array.isArray(payload.data)) {
            lastError = payload.message || payload.error || lastError;
            continue;
          }
          if (payload.data.length > 0) {
            loadedRows = payload.data;
            break;
          }
          loadedRows = payload.data;
        }

        setRows(loadedRows);
        if (loadedRows.length === 0) {
          setError(lastError);
        }
      } catch {
        setRows([]);
        setError("Request failed while loading records");
      } finally {
        setLoading(false);
      }
    };

    void loadRows();
  }, [refreshSeed]);

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

  const loadWasteByCategory = async (categoryId: string): Promise<Option[]> => {
    if (!categoryId) return [];
    try {
      const res = await fetch(
        `/api/auth/Waste/generate?type=drop-waste&wcid=${encodeURIComponent(categoryId)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );
      const payload = (await res.json()) as { success?: boolean; data?: Option[] };
      if (res.ok && payload.success && Array.isArray(payload.data)) {
        setAvailableWaste(payload.data);
        return payload.data;
      }
    } catch {
      // ignore
    }
    setAvailableWaste([]);
    return [];
  };

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => toText(value).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const onEdit = (row: ViewRow) => {
    setMessage(null);
    const wcName = toText(row.WC);
    const wwName = toText(row.WW);
    const wrName = toText(row.WR);
    const wdName = toText(row.WD);
    const psName = toText(row.PS);
    const smName = toText(row.SM);

    const category = categories.find((item) => normalize(item.name) === normalize(wcName));
    const receiver = receivers.find((item) => normalize(item.name) === normalize(wrName));
    const disposer = disposers.find((item) => normalize(item.name) === normalize(wdName));
    const physical = physicalStates.find(
      (item) => normalize(item.name) === normalize(psName),
    );
    const storage = storageMethods.find(
      (item) => normalize(item.name) === normalize(smName),
    );

    const nextState: EditState = {
      id: toText(row.ID),
      date: asDateValue(row.GD),
      categoryId: category?.id ?? "",
      wasteId: "",
      receiver: receiver?.id ?? "",
      disposer: disposer?.id ?? "",
      physicalState: physical?.id ?? "",
      storage: storage?.id ?? "",
      quantity: toText(row.WQ),
      disposalTarget: asDateValue(row.TD),
    };
    setEditState(nextState);

    if (nextState.categoryId) {
      void loadWasteByCategory(nextState.categoryId).then((wasteOptions) => {
        const waste = wasteOptions.find(
          (item) => normalize(item.name) === normalize(wwName),
        );
        if (waste) {
          setEditState((prev) =>
            prev ? { ...prev, wasteId: waste.id } : prev,
          );
        }
      });
    } else {
      setAvailableWaste([]);
    }
  };

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editState) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/waste/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editState),
      });
      const payload = (await res.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok || !payload.success) {
        setMessage(payload.message || payload.error || "Failed to update record");
        return;
      }

      setMessage(payload.message || "Record updated successfully");
      setEditState(null);
      setRefreshSeed((prev) => prev + 1);
    } catch {
      setMessage("Update request failed");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const categoryId = editState?.categoryId ?? "";
    if (!categoryId) {
      setAvailableWaste([]);
      return;
    }
    void loadWasteByCategory(categoryId);
  }, [editState?.categoryId]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Waste Edit</h1>
          <p className="mt-1 text-sm text-slate-600">
            Edit existing waste records from the database.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshSeed((x) => x + 1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search records..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-slate-700">{message}</p>
      )}

      {loading && <p className="mt-4 text-sm text-slate-600">Loading records...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <p className="mt-4 text-sm text-slate-600">
            Showing {pagedRows.length} of {filteredRows.length} records
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-xs font-semibold text-slate-700">
                    Code
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-xs font-semibold text-slate-700">
                    Category
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-xs font-semibold text-slate-700">
                    Waste
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-xs font-semibold text-slate-700">
                    Quantity
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-xs font-semibold text-slate-700">
                    Entry Date
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-xs font-semibold text-slate-700">
                    Target Date
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-xs font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pagedRows.map((row, index) => (
                  <tr key={`row-${(currentPage - 1) * PAGE_SIZE + index}`}>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {toText(row.ID)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {toText(row.WC)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {toText(row.WW)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {toText(row.WQ)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {toText(row.GD)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {toText(row.TD)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
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

      {editState && (
        <div className="fixed inset-x-3 top-2 z-50 mx-auto w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-2xl md:inset-x-auto md:right-4 md:left-auto md:w-[min(94vw,64rem)] md:p-4">
          <h3 className="text-sm font-semibold text-slate-800">Edit Entry</h3>
          <form onSubmit={onSave} className="mt-2 grid grid-cols-1 gap-2 md:mt-3 md:grid-cols-2 md:gap-3">
            <div className="md:col-span-2">
              <label className="mb-0.5 block text-xs font-semibold text-slate-700">
                Code
              </label>
              <input
                type="text"
                value={editState.id}
                readOnly
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-700">
                Date
              </label>
              <input
                type="date"
                required
                value={editState.date}
                onChange={(e) =>
                  setEditState((prev) =>
                    prev ? { ...prev, date: e.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-700">
                Category
              </label>
              <select
                required
                value={editState.categoryId}
                onChange={(e) =>
                  setEditState((prev) =>
                    prev
                      ? {
                        ...prev,
                        categoryId: e.target.value,
                        wasteId: "",
                      }
                      : prev,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
              >
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-700">
                Waste
              </label>
              <select
                required
                value={editState.wasteId}
                onChange={(e) =>
                  setEditState((prev) =>
                    prev ? { ...prev, wasteId: e.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
              >
                <option value="">Select waste</option>
                {availableWaste.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-700">
                Receiver
              </label>
              <select
                required
                value={editState.receiver}
                onChange={(e) =>
                  setEditState((prev) =>
                    prev ? { ...prev, receiver: e.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
              >
                <option value="">Select receiver</option>
                {receivers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-700">
                Disposer
              </label>
              <select
                required
                value={editState.disposer}
                onChange={(e) =>
                  setEditState((prev) =>
                    prev ? { ...prev, disposer: e.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
              >
                <option value="">Select disposer</option>
                {disposers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-700">
                Physical State
              </label>
              <select
                required
                value={editState.physicalState}
                onChange={(e) =>
                  setEditState((prev) =>
                    prev ? { ...prev, physicalState: e.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
              >
                <option value="">Select physical state</option>
                {physicalStates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-700">
                Method of Storage
              </label>
              <select
                required
                value={editState.storage}
                onChange={(e) =>
                  setEditState((prev) =>
                    prev ? { ...prev, storage: e.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
              >
                <option value="">Select storage method</option>
                {storageMethods.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-700">
                Target Date
              </label>
              <input
                type="date"
                required
                disabled
                value={editState.disposalTarget}
                onChange={(e) =>
                  setEditState((prev) =>
                    prev ? { ...prev, disposalTarget: e.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-700">
                Quantity
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={editState.quantity}
                onChange={(e) =>
                  setEditState((prev) =>
                    prev ? { ...prev, quantity: e.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#ff7b00ef] px-3 py-1.5 text-xs font-medium text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditState(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
