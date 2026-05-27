"use client";

import { useSession } from "next-auth/react";
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
  unit: string;
  storageMethod: string
  smid: string
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

const findOption = (
  options: Option[],
  idValue: unknown,
  nameValue: unknown,
): Option | undefined => {
  const id = toText(idValue);
  const name = normalize(toText(nameValue));

  return options.find((item) => {
    if (id && item.id === id) return true;
    return name.length > 0 && normalize(item.name) === name;
  });
};

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
  const [units, setUnits] = useState<Option[]>([]);


  type RegisteredWaste = {
    ID: string
    UID: string
    Unit: string
    GenDeptID: string
    GenDept: string
    UnitDesc: string
    DeptID: string
    Dept: string
    ReferenceNo: string
    DateofIssuance: string
    UnitAuthDesc: string
    WasteCategory: string
    WCID: string
    Waste: string
    SapWasteCode: string
    Schedule: string
    Storage: string
    StorageMethod: string
    PhysicalState: string
    MUnit: string
    AID: string
    Receiver: string
    WasteQty: string
    GenerationDate: string
    TargetDate: string
    CreatedBy: string
    CrBy: string
    CrDt: string
  }

  const [waste, setWaste] = useState<RegisteredWaste[]>([])

  const { data: session } = useSession()

  async function fetchWaste() {
    const res = await fetch("/api/GetData/GetWasteGeneratedByDept", {
      method: "POST"
    })
    const data = await res.json()
    setWaste(data)
    // console.log(data)
  }
  useEffect(() => {
    fetchWaste()
  }, [refreshSeed])

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
          unitRes,
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
          fetch("/api/auth/Waste/generate?type=drop-quantityunit", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/auth/Waste/generate?type=drop-rcvr", {
            method: "GET",
            cache: "no-store",
          }),

        ]);

        const [categoryPayload, disposerPayload, physicalPayload, storagePayload, unitPayload, receiverPayload] =
          (await Promise.all([
            categoryRes.json(),
            disposerRes.json(),
            physicalRes.json(),
            storageRes.json(),
            unitRes.json(),
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

        setUnits(
          unitPayload.success && Array.isArray(unitPayload.data)
            ? unitPayload.data
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
        setUnits([]);
        setReceivers([]);
      }
    };

    void loadBaseFilters();
  }, []);

  const [sessionUid, setSessionUid] = useState("")


  // const { data: session } = useSession()

  useEffect(() => {

    setSessionUid(session?.user.uid!)
  }, [session])

  const loadWasteByCategory = async (categoryId: string): Promise<Option[]> => {
    if (!categoryId) return [];
    try {

      // if (!sessionUid) return;

      const res = await fetch(
        `/api/auth/Waste/generate?type=drop-waste-for-unit&wcid=${encodeURIComponent(categoryId)}&uid=${encodeURIComponent(sessionUid)}`,
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
    // if (!q) return rows;
    // return rows.filter((row) =>
    //   Object.values(row).some((value) => toText(value).toLowerCase().includes(q)),
    // );

    if (!q) return waste;
    return waste.filter((row) =>
      Object.values(row).some((value) => toText(value).toLowerCase().includes(q)),
    );
  }, [waste, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query]);


  const [selectedWaste, setSelectedWaste] = useState<RegisteredWaste>()

  async function GetReceiver() {

    const receiverRes = await fetch("/api/auth/Waste/generate?type=drop-rcvr", {
      method: "GET",
      cache: "no-store",
    })
    const receiverPayload = await receiverRes.json()
    const receivers = receiverPayload.data
    // console.log(receiver, "up receiver")

    const res = await fetch(`/api/auth/Waste/generate?type=drop-item-select&WID=${encodeURIComponent(editState?.wasteId!)}&WAID=${encodeURIComponent(editState?.categoryId!)}&ID=${encodeURIComponent(editState?.id!)}`, {
      method: "GET",
      cache: "no-store",
    })

    const payload = await res.json()
    const data = payload.data

    // console.log(data, "rece")


    const matchedReceivers = receivers.filter(
      (el: any) => data.some((item: any) => item.AID == el.id)
    );
    // console.log(receivers, "receivers")
    // console.log(matchedReceivers, "matched receivers up")

    setReceivers(matchedReceivers);

    setEditState((prev) =>
      prev ? { ...prev, receiver: String(selectedWaste?.AID) ?? "" } : prev,
    );



  }

  useEffect(() => {

    // console.log(waste, "waste")

    GetReceiver()

    const deptId = String(session?.user?.deptId)
    // console.log(disposers, "disposers")
    const matchedDisposers = disposers.filter(
      (item) => item.id == '20' || item.id == deptId
    );
    // console.log(matchedDisposers, "macthe")

    setDisposers(matchedDisposers);

  }, [editState?.wasteId])

  const onEdit = (row: ViewRow) => {
    setMessage(null);
    const wcName = toText(row.WasteCategory || row.WC);
    const wwName = toText(row.Waste || row.WW);
    const wrName = toText(row.Receiver || row.WR);
    const wdName = toText(row.Dept || row.Disposer || row.WD);
    const psName = toText(row.PhysicalState || row.PS);
    const smName = toText(row.StorageMethod || row.Storage || row.SM);
    const unitName = toText(row.MUnit || row.Unit || row.UnitDesc);

    const category = findOption(categories, row.WCID, wcName);
    const receiver = findOption(receivers, row.AID, wrName);
    const disposer = findOption(disposers, row.DID || row.DeptID, wdName);
    const physical = findOption(physicalStates, row.PSID, psName);
    const storage = findOption(storageMethods, row.SMID, smName);
    const storageMethod = smName;
    const unit = findOption(units, row.MUID || row.WTID, unitName);


    const nextState: EditState = {
      id: toText(row.ID),
      date: asDateValue(row.GenerationDate || row.GD),
      categoryId: category?.id ?? "",
      wasteId: toText(row.WID),
      receiver: receiver?.id ?? "",
      disposer: disposer?.id ?? "",
      physicalState: physical?.id ?? "",
      storage: storage?.id ?? "",
      quantity: toText(row.WasteQty || row.WQ),
      disposalTarget: asDateValue(row.TargetDate || row.TD),
      unit: unit?.id ?? "",
      storageMethod: smName,
      smid: ""
    };
    setEditState(nextState);

    if (nextState.categoryId) {
      void loadWasteByCategory(nextState.categoryId).then((wasteOptions) => {
        if (nextState.wasteId) return;

        const selectedWaste = wasteOptions.find(
          (item) => normalize(item.name) === normalize(wwName),
        );
        if (selectedWaste) {
          setEditState((prev) =>
            prev ? { ...prev, wasteId: selectedWaste.id } : prev,
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
      // console.log(payload)

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
        <div className="w-full">
          <h1 className="text-xl font-semibold text-teal-600 text-center">Edit Generated Waste</h1>
          {/* <p className="mt-1 text-sm text-slate-600 text-center">
            Edit existing waste records.
          </p> */}
        </div>
        {/* <button
          type="button"
          onClick={() => setRefreshSeed((x) => x + 1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button> */}
        <img src="/refresh.png" alt="" className="cursor-pointer h-5 "
          onClick={() => setRefreshSeed((x) => x + 1)}
        />

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
                    ID
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
                    Gen Dept
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-xs font-semibold text-slate-700">
                    Gen Date
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-xs font-semibold text-slate-700">
                    Targetted Disposal Date
                  </th>
                  <th className="whitespace-nowrap px-2 py-1 text-left text-xs font-semibold text-slate-700">
                    Generated By
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
                      {toText(row.WasteCategory)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {toText(row.Waste)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {toText(row.WasteQty)}{" "}{row.MUnit}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {toText(row.GenDept)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {toText(row.GenerationDate)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {toText(row.TargetDate)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      {toText(row.CreatedBy)}{" ("}{row.CrBy}{")"}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                      <button
                        type="button"
                        onClick={() => { onEdit(row); setSelectedWaste(row) }}
                        className="cursor-pointer rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
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

      {editState && (
        <div className="fixed inset-x-3 top-2 z-50 mx-auto w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-2xl md:inset-x-auto md:right-4 md:left-auto md:w-[min(94vw,64rem)] md:p-4">
          <h3 className="text-md font-semibold text-teal-600 text-center">Edit Waste Entry</h3>
          <form onSubmit={onSave} className="mt-2 grid grid-cols-1 gap-2 md:mt-3 md:grid-cols-2 md:gap-3">
            <div className="md:col-span-2">
              <label className="mb-0.5 block text-xs font-semibold text-slate-700">
                ID
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
                onChange={(e) => {
                  // console.log(e.target.value)
                  setEditState((prev) =>
                    prev ? { ...prev, receiver: String(e.target.value) } : prev,
                  )
                }
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
                onChange={(e) => {
                  // console.log(e.target.value)
                  const smethod = storageMethods.find(el => el.id == e.target.value)?.name
                  // console.log(smethod)
                  setEditState((prev) =>
                    prev ? { ...prev, storage: e.target.value, smid: e.target.value, storageMethod: smethod! } : prev,
                  )
                }
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

            {
              editState.smid == '4' &&
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Storage Method</label>
                <input
                  type="text"
                  value={(editState.smid == '4' && editState.storageMethod == "Others") ? "" : editState.storageMethod}
                  onChange={(e) =>
                    setEditState((prev) =>
                      prev ? { ...prev, storageMethod: e.target.value } : prev,
                    )
                  }
                  className="w-[60%] rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-500"
                  placeholder="Enter Storage Method"
                  required
                />
              </div>
            }
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-700">
                Targetted Disposal Date
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
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-700">
                Unit
              </label>
              <select
                required
                value={editState.unit}
                onChange={(e) =>
                  setEditState((prev) =>
                    prev ? { ...prev, unit: e.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
              >
                <option value="">Select Unit</option>
                {units.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer rounded-lg bg-[#ff7b00ef] px-3 py-1.5 text-xs font-medium text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditState(null)}
                className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
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
