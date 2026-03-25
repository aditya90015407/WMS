"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useSession } from "next-auth/react";


type Option = {
  id: string;
  name: string;
  wid?: string;
  waid?: string;
  receiverId?: string;
  disposerId?: string;
};

type GenerateFormProps = {
  loginDate: string;
  minAllowedDate: string;
};

type GenerateFormState = {
  date: string;
  categoryId: string;
  wasteId: string;
  receiver: string;
  disposer: string;
  physicalState: string;
  storage: string;
  disposalTarget: string;
  UID: string
  DeptID: string
  DID: string
  quantity: string;
};

const initialState: GenerateFormState = {
  date: "",
  categoryId: "",
  wasteId: "",
  receiver: "",
  disposer: "",
  physicalState: "",
  storage: "",
  disposalTarget: "",
  UID: "",
  DeptID: "",
  DID: "",
  quantity: "",
};

const formatDate = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const mergeOptions = (primary: Option[], secondary: Option[]): Option[] => {
  const map = new Map<string, Option>();
  for (const item of secondary) {
    const key = String(item.id ?? "").trim();
    if (key) map.set(key, item);
  }
  for (const item of primary) {
    const key = String(item.id ?? "").trim();
    if (key) map.set(key, item);
  }
  return Array.from(map.values());
};

const normalizeText = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

export default function GenerateForm({
  loginDate,
  minAllowedDate,
}: GenerateFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<GenerateFormState>(initialState);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<Option[]>([]);
  const [availableWaste, setAvailableWaste] = useState<Option[]>([]);
  const [receivers, setReceivers] = useState<Option[]>([]);
  const [disposers, setDisposers] = useState<Option[]>([]);
  const [form3Search, setForm3Search] = useState("");

  const [physicalStates, setPhysicalStates] = useState<Option[]>([]);
  const [storageMethods, setStorageMethods] = useState<Option[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingWaste, setLoadingWaste] = useState(false);
  const [loadingReceivers, setLoadingReceivers] = useState(false);
  const [loadingDisposers, setLoadingDisposers] = useState(false);
  const [loadingPhysicalStates, setLoadingPhysicalStates] = useState(false);
  const [loadingStorageMethods, setLoadingStorageMethods] = useState(false);
  const [receiverError, setReceiverError] = useState<string | null>(null);
  const [disposerError, setDisposerError] = useState<string | null>(null);
  const [physicalStateError, setPhysicalStateError] = useState<string | null>(
    null,
  );
  const [storageMethodError, setStorageMethodError] = useState<string | null>(
    null,
  );
  const [showReview, setShowReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isMappedPairLocked, setIsMappedPairLocked] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch("/api/auth/Waste/generate?type=drop-wc", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await res.json()) as {
          success?: boolean;
          data?: Option[];
        };
        if (payload.success && Array.isArray(payload.data)) {
          setCategories(payload.data);
        } else {
          setCategories([]);
        }
      } catch {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    void loadCategories();
  }, []);

  useEffect(() => {
    const loadReceivers = async () => {
      setLoadingReceivers(true);
      setReceiverError(null);
      try {
        const res = await fetch("/api/auth/Waste/generate?type=drop-rcvr", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await res.json()) as {
          success?: boolean;
          data?: Option[];
          message?: string;
          error?: string;
        };
        if (!res.ok || !payload.success) {
          setReceivers([]);
          setReceiverError(
            payload.message || payload.error || "Failed to load receivers",
          );
          return;
        }
        if (Array.isArray(payload.data)) {
          setReceivers((prev) => mergeOptions(payload.data!, prev));
          if (payload.data.length === 0) {
            setReceiverError("No active receivers found");
          }
        } else {
          setReceivers([]);
          setReceiverError("Receiver API returned invalid data");
        }
      } catch {
        setReceivers([]);
        setReceiverError("Receiver API request failed");
      } finally {
        setLoadingReceivers(false);
      }
    };

    void loadReceivers();
  }, []);

  useEffect(() => {
    const loadDisposers = async () => {
      setLoadingDisposers(true);
      setDisposerError(null);
      try {
        const res = await fetch("/api/auth/Waste/generate?type=drop-dispo", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await res.json()) as {
          success?: boolean;
          data?: Option[];
          message?: string;
          error?: string;
        };
        if (!res.ok || !payload.success) {
          setDisposers([]);
          setDisposerError(
            payload.message || payload.error || "Failed to load disposers",
          );
          return;
        }
        if (Array.isArray(payload.data)) {
          setDisposers((prev) => mergeOptions(payload.data!, prev));
          if (payload.data.length === 0) {
            setDisposerError("No active disposers found");
          }
        } else {
          setDisposers([]);
          setDisposerError("Disposer API returned invalid data");
        }
      } catch {
        setDisposers([]);
        setDisposerError("Disposer API request failed");
      } finally {
        setLoadingDisposers(false);
      }
    };

    void loadDisposers();
  }, []);

  useEffect(() => {
    const loadPhysicalStates = async () => {
      setLoadingPhysicalStates(true);
      setPhysicalStateError(null);
      try {
        const res = await fetch("/api/auth/Waste/generate?type=drop-phstate", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await res.json()) as {
          success?: boolean;
          data?: Option[];
          message?: string;
          error?: string;
        };
        if (!res.ok || !payload.success) {
          setPhysicalStates([]);
          setPhysicalStateError(
            payload.message || payload.error || "Failed to load physical states",
          );
          return;
        }
        if (Array.isArray(payload.data)) {
          setPhysicalStates(payload.data);
          if (payload.data.length === 0) {
            setPhysicalStateError("No active physical states found");
          }
        } else {
          setPhysicalStates([]);
          setPhysicalStateError("Physical state API returned invalid data");
        }
      } catch {
        setPhysicalStates([]);
        setPhysicalStateError("Physical state API request failed");
      } finally {
        setLoadingPhysicalStates(false);
      }
    };

    void loadPhysicalStates();
  }, []);

  useEffect(() => {
    const loadStorageMethods = async () => {
      setLoadingStorageMethods(true);
      setStorageMethodError(null);
      try {
        const res = await fetch("/api/auth/Waste/generate?type=drop-smethod", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await res.json()) as {
          success?: boolean;
          data?: Option[];
          message?: string;
          error?: string;
        };
        if (!res.ok || !payload.success) {
          setStorageMethods([]);
          setStorageMethodError(
            payload.message || payload.error || "Failed to load storage methods",
          );
          return;
        }
        if (Array.isArray(payload.data)) {
          setStorageMethods(payload.data);
          if (payload.data.length === 0) {
            setStorageMethodError("No active storage methods found");
          }
        } else {
          setStorageMethods([]);
          setStorageMethodError("Storage method API returned invalid data");
        }
      } catch {
        setStorageMethods([]);
        setStorageMethodError("Storage method API request failed");
      } finally {
        setLoadingStorageMethods(false);
      }
    };

    void loadStorageMethods();
  }, []);

  const updateField = (key: keyof GenerateFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!form.date || !form.categoryId) {
      setForm((prev) => ({ ...prev, disposalTarget: "" }));
      return;
    }

    const selectedCategory = categories.find((c) => c.id === form.categoryId);
    const categoryName = (selectedCategory?.name ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const daysToAdd = categoryName.includes("hazardouswaste") ? 90 : 180;

    const base = new Date(`${form.date}T00:00:00`);
    base.setDate(base.getDate() + daysToAdd);
    const targetDate = formatDate(base);

    setForm((prev) => ({ ...prev, disposalTarget: targetDate }));
  }, [form.date, form.categoryId, categories]);


  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.uid && session?.user?.deptId) {
      setForm((prev) => ({
        ...prev,
        UID: String(session.user.uid),
        DeptID: String(session.user.deptId),
      }));
    }
  }, [session]);



  async function getDisposer(WID: any, UID: any, WCID: any) {
    // console.log("i am in getDisposer")
    const res = await fetch(
      `/api/auth/Waste/generate?type=getdisposer&wid=${encodeURIComponent(WID)}&uid=${encodeURIComponent(UID)}&wcid=${encodeURIComponent(WCID)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
    const rawdata = await res.json()
    const data = rawdata.data
    // if (data.length == 0) return
    // const dispId = await data[0].ID
    // console.log(dispId)
    if (!data || data.length == 0) return
    const dispId = data[0].ID
    // console.log(dispId)

    if (dispId == 1) {
      setForm((prev) => ({
        ...prev,
        disposer: '20',
      }));
    }
    else if (dispId == 2) {
      setForm((prev) => ({
        ...prev,
        disposer: String(session?.user?.deptId),
      }));
    }
  }

  useEffect(() => {
    if (form.wasteId == "" || form.categoryId == "" || form.UID == "") return;
    getDisposer(form.wasteId, form.UID, form.categoryId)
  }, [form.wasteId, form.UID, form.categoryId])



  const onCategoryChange = async (value: string) => {
    setForm((prev) => ({
      ...prev,
      categoryId: value,
      wasteId: "",
      receiver: "",
      disposer: "",
    }));
    setIsMappedPairLocked(false);
    setAvailableWaste([]);

    if (!value) return;

    setLoadingWaste(true);
    try {
      const res = await fetch(
        `/api/auth/Waste/generate?type=drop-waste&wcid=${encodeURIComponent(value)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );
      const payload = (await res.json()) as {
        success?: boolean;
        data?: Option[];
      };
      if (payload.success && Array.isArray(payload.data)) {
        setAvailableWaste(
          payload.data.map((item) => ({
            id: String(item.id ?? ""),
            name: String(item.name ?? ""),
            wid: item.wid,
            waid: item.waid,
            receiverId: item.receiverId,
            disposerId: item.disposerId,
          })),
        );
      }
    } catch {
      setAvailableWaste([]);
    } finally {
      setLoadingWaste(false);
    }
  };

  // "WID":wasteId

  //   useEffect(()=>{
  // fetchReceiver(form?.wasteId)
  //   },[form?.wasteId])

  const onWasteChange = async (value: string) => {
    const selectedWaste = availableWaste.find((item) => item.id === value);
    const quickReceiverId = String(selectedWaste?.receiverId ?? "").trim();
    const quickDisposerId = String(selectedWaste?.disposerId ?? "").trim();
    const hasQuickMapping =
      quickReceiverId.length > 0 && quickDisposerId.length > 0;

    if (hasQuickMapping) {
      setReceivers((prev) =>
        mergeOptions(
          [{ id: quickReceiverId, name: `Mapped Receiver (${quickReceiverId})` }],
          prev,
        ),
      );
      setDisposers((prev) =>
        mergeOptions(
          [{ id: quickDisposerId, name: `Mapped Disposer (${quickDisposerId})` }],
          prev,
        ),
      );
    }

    setForm((prev) => ({
      ...prev,
      wasteId: value,
      receiver: hasQuickMapping ? quickReceiverId : "",
      disposer: hasQuickMapping ? quickDisposerId : "",
    }));
    setIsMappedPairLocked(hasQuickMapping);
    const mappingWID = String(selectedWaste?.wid ?? value).trim();
    const mappingWAID = String(selectedWaste?.waid ?? value).trim();
    if (!value || !mappingWID) return;

    try {
      const res = await fetch(
        `/api/auth/Waste/generate?type=drop-item-select&WID=${encodeURIComponent(mappingWID)}&WAID=${encodeURIComponent(mappingWAID)}&ID=${encodeURIComponent(value)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );
      const payload = (await res.json()) as {
        success?: boolean;
        data?: {
          receiverId?: string;
          // disposerId?: string;
          receiverName?: string;
          // disposerName?: string;
        };
      };

      // console.log(payload)

      const mappedReceiverId = payload.data?.receiverId?.trim() ?? "";
      // const mappedDisposerId = payload.data?.disposerId?.trim() ?? "";
      const mappedReceiverName = payload.data?.receiverName?.trim() ?? "";
      // const mappedDisposerName = payload.data?.disposerName?.trim() ?? "";

      const receiverById = receivers.find((item) => item.id === mappedReceiverId);
      // const disposerById = disposers.find((item) => item.id === mappedDisposerId);
      const receiverByName =
        mappedReceiverName.length > 0
          ? receivers.find(
            (item) => normalizeText(item.name) === normalizeText(mappedReceiverName),
          )
          : undefined;
      // const disposerByName =
      //   mappedDisposerName.length > 0
      //     ? disposers.find(
      //       (item) => normalizeText(item.name) === normalizeText(mappedDisposerName),
      //     )
      //     : undefined;

      const resolvedReceiverId =
        receiverById?.id ?? receiverByName?.id ?? mappedReceiverId;

      // const resolvedDisposerId =
      //   disposerById?.id ?? disposerByName?.id ?? mappedDisposerId;

      const hasMapping =
        res.ok &&
        payload.success === true &&
        resolvedReceiverId.length > 0
      // && resolvedDisposerId.length > 0;

      if (!hasMapping) return;

      setReceivers((prev) =>
        mergeOptions(
          [
            {
              id: resolvedReceiverId,
              name: mappedReceiverName || `Mapped Receiver (${resolvedReceiverId})`,
            },
          ],
          prev,
        ),
      );
      // setDisposers((prev) =>
      //   mergeOptions(
      //     [
      //       {
      //         id: resolvedDisposerId,
      //         name: mappedDisposerName || `Mapped Disposer (${resolvedDisposerId})`,
      //       },
      //     ],
      //     prev,
      //   ),
      // );

      setForm((prev) => ({
        ...prev,
        receiver: resolvedReceiverId,
        // disposer: resolvedDisposerId,
      }));
      setIsMappedPairLocked(true);
    } catch {
      // Keep manual selection enabled if mapping request fails.
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setShowReview(true);
  };

  const getOptionName = (options: Option[], id: string) =>
    options.find((item) => item.id === id)?.name ?? "";

  const confirmSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/Waste/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await res.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
        refId?: string;
      };

      // console.log(payload)

      if (!res.ok || !payload.success) {
        setMessage(payload.message || payload.error || "Failed to save");
        return;
      }

      setShowReview(false);
      setMessage(
        payload.refId
          ? `${payload.message || "Saved successfully"} (Ref No: ${payload.refId})`
          : payload.message || "Saved successfully",
      );
      setForm(initialState);
      setIsMappedPairLocked(false);
    } catch {
      setMessage("Save request failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => updateField("date", e.target.value)}
          min={minAllowedDate}
          max={loginDate}
          className="w-[60%] rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-500"
          required
        />
      </div>
      <div />

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">Category</label>
        <select
          value={form.categoryId}
          onChange={(e) => {
            void onCategoryChange(e.target.value);
          }}
          className="w-[60%] rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-500"
          required
          disabled={loadingCategories}
        >
          <option value="">
            {loadingCategories ? "Loading categories..." : "Select category"}
          </option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">Waste</label>
        <select
          value={form.wasteId}
          onChange={(e) => onWasteChange(e.target.value)}
          className="w-[60%] rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-500"
          required
          disabled={!form.categoryId || loadingWaste}
        >
          <option value="">
            {!form.categoryId
              ? "Select category first"
              : loadingWaste
                ? "Loading waste..."
                : "Select waste"}
          </option>
          {availableWaste.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">Receiver</label>
        <select
          value={form.receiver}
          onChange={(e) => updateField("receiver", e.target.value)}
          className="w-[60%] rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-500"
          disabled={loadingReceivers || isMappedPairLocked}
          required
        >
          <option value="">
            {loadingReceivers ? "Loading receivers..." : "Select receiver"}
          </option>
          {receivers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        {receiverError && (
          <p className="mt-1 text-xs text-red-600">{receiverError}</p>
        )}
        {isMappedPairLocked && (
          <p className="mt-1 text-xs text-slate-500">
            Auto-mapped from selected category and waste.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">Disposer</label>
        <select
          value={form.disposer}
          onChange={(e) => updateField("disposer", e.target.value)}
          className="w-[60%] rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-500"
          disabled={loadingDisposers || isMappedPairLocked}
          required
        >
          <option value="">
            {loadingDisposers ? "Loading disposers..." : "Select disposer"}
          </option>
          {disposers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        {disposerError && (
          <p className="mt-1 text-xs text-red-600">{disposerError}</p>
        )}
        {isMappedPairLocked && (
          <p className="mt-1 text-xs text-slate-500">
            Auto-mapped from selected category and waste.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">Phy- State</label>
        <select
          value={form.physicalState}
          onChange={(e) => updateField("physicalState", e.target.value)}
          className="w-[60%] rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-500"
          disabled={loadingPhysicalStates}
          required
        >
          <option value="">
            {loadingPhysicalStates
              ? "Loading physical states..."
              : "Select physical state"}
          </option>
          {physicalStates.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        {physicalStateError && (
          <p className="mt-1 text-xs text-red-600">{physicalStateError}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">Storage</label>
        <select
          value={form.storage}
          onChange={(e) => updateField("storage", e.target.value)}
          className="w-[60%] rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-500"
          disabled={loadingStorageMethods}
          required
        >
          <option value="">
            {loadingStorageMethods
              ? "Loading storage methods..."
              : "Select storage method"}
          </option>
          {storageMethods.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        {storageMethodError && (
          <p className="mt-1 text-xs text-red-600">{storageMethodError}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">Dis-Target</label>
        <input
          type="date"
          value={form.disposalTarget}
          onChange={(e) => updateField("disposalTarget", e.target.value)}
          className="w-[60%] rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-500"
          readOnly
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">Quantity</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.quantity}
          onChange={(e) => updateField("quantity", e.target.value)}
          className="w-[60%] rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-500"
          placeholder="Enter quantity"
          required
        />
      </div>

      <div className="md:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-[#ff7b00ef] px-5 py-2 text-sm font-medium text-white"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700"
        >
          Back
        </button>
      </div>

      {message && <p className="md:col-span-2 mt-2 text-sm text-emerald-700">{message}</p>}

      {showReview && (
        <div className="fixed right-4 top-4 z-50 w-[min(92vw,19.6rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
          <h3 className="text-sm font-semibold text-slate-800">Review Details</h3>
          <div className="mt-3 grid grid-cols-1 gap-1 text-sm text-slate-700">
            <p><span className="font-medium">Date:</span> {form.date || "-"}</p>
            <p><span className="font-medium">Category:</span> {getOptionName(categories, form.categoryId) || "-"}</p>
            <p><span className="font-medium">Waste:</span> {getOptionName(availableWaste, form.wasteId) || "-"}</p>
            <p><span className="font-medium">Receiver:</span> {getOptionName(receivers, form.receiver) || "-"}</p>
            <p><span className="font-medium">Disposer:</span> {getOptionName(disposers, form.disposer) || "-"}</p>
            <p><span className="font-medium">Phy- State:</span> {getOptionName(physicalStates, form.physicalState) || "-"}</p>
            <p><span className="font-medium">Storage:</span> {getOptionName(storageMethods, form.storage) || "-"}</p>
            <p><span className="font-medium">Dis-Target:</span> {form.disposalTarget || "-"}</p>
            <p><span className="font-medium">Quantity:</span> {form.quantity || "-"}</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={confirmSave}
              disabled={saving}
              className="rounded-lg bg-[#ff7b00ef] px-4 py-2 text-sm font-medium text-white"
            >
              {saving ? "Saving..." : "Confirm Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowReview(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
