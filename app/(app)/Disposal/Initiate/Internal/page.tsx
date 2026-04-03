"use client";

import { useEffect, useState } from "react";

type Option = { id: string; name: string };
type Option1 = { ID: string; NAME: string };
type Option2 = { IRID: string; IRName: string };

export default function DisposalRecycleForm() {
  const [disposalDate, setDisposalDate] = useState("");
  const [disposedTo, setDisposedTo] = useState("");
  const [physicalForm, setPhysicalForm] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [disposedOptions, setDisposedOptions] = useState<Option2[]>([]);
  const [physicalOptions, setPhysicalOptions] = useState<Option1[]>([]);


  const [wasteCategory, setWasteCategory] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [wasteOptions, setWasteOptions] = useState<Option[]>([]);
  const [selectedWasteId, setSelectedWasteId] = useState("");

  const [undisposedOptions, setUndisposedOptions] = useState<
    Array<{ id: string; dept: string; qty: number; label: string }>
  >([]);
  const [selectedUndisposedIds, setSelectedUndisposedIds] = useState<string[]>([]);
  const [undisposedDropdownOpen, setUndisposedDropdownOpen] = useState(false);

  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingWaste, setLoadingWaste] = useState(false);
  const [loadingUndisposed, setLoadingUndisposed] = useState(false);

  useEffect(() => {
    const loadBase = async () => {
      setLoadingBase(true);
      try {
        const wcRes = await fetch("/api/auth/Waste/generate?type=drop-wc", { cache: "no-store" });
        const wcPayload = await wcRes.json();
        setCategoryOptions(
          wcPayload.success && Array.isArray(wcPayload.data) ? wcPayload.data : [],
        );
      } catch {
        setCategoryOptions([]);
      } finally {
        setLoadingBase(false);
      }
    };
    void loadBase();
  }, []);

  useEffect(() => {
    const loadWaste = async () => {
      if (!wasteCategory) {
        setWasteOptions([]);
        setSelectedWasteId("");
        setUndisposedOptions([]);
        setSelectedUndisposedIds([]);
        return;
      }

      setLoadingWaste(true);
      try {
        const res = await fetch(
          `/api/auth/Waste/generate?type=drop-waste&wcid=${encodeURIComponent(wasteCategory)}`,
          { cache: "no-store" },
        );
        const payload = await res.json();
        setWasteOptions(payload.success && Array.isArray(payload.data) ? payload.data : []);
        setSelectedWasteId("");
        setUndisposedOptions([]);
        setSelectedUndisposedIds([]);
      } catch {
        setWasteOptions([]);
        setSelectedWasteId("");
        setUndisposedOptions([]);
        setSelectedUndisposedIds([]);
      } finally {
        setLoadingWaste(false);
      }
    };

    void loadWaste();
  }, [wasteCategory]);

  useEffect(() => {
  const loadDropdowns = async () => {
            try {
            const [disposedRes, physicalRes] = await Promise.all([
                fetch("/api/GetData/GetInternalReciever", { cache: "no-store" }),
                fetch("/api/GetData/GetPhysicalForm", { cache: "no-store" }),
            ]);

            const disposedPayload = await disposedRes.json();
            const physicalPayload = await physicalRes.json();
            console.log(physicalPayload)
            console.log(disposedPayload)
            setDisposedOptions(
                disposedPayload.success && Array.isArray(disposedPayload.data)
                ? disposedPayload.data
                : [],
            );

            setPhysicalOptions(
                physicalPayload.success && Array.isArray(physicalPayload.data)
                ? physicalPayload.data
                : [],
            );
            } catch {
            setDisposedOptions([]);
            setPhysicalOptions([]);
            }
        };

        void loadDropdowns();
        }, []);

  

  useEffect(() => {
    const loadUndisposed = async () => {
      if (!wasteCategory || !selectedWasteId) {
        setUndisposedOptions([]);
        setSelectedUndisposedIds([]);
        return;
      }

      setLoadingUndisposed(true);
      try {
        const res = await fetch("/api/GetData/GetAllUndisposedWaste", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flag: "GetAllUndisposedWaste",
            WCID: wasteCategory,
            WID: selectedWasteId,
          }),
        });

        const payload = await res.json();
        const raw =
          (Array.isArray(payload?.data?.Rows) && payload.data.Rows) ||
          (Array.isArray(payload?.data) && payload.data) ||
          (Array.isArray(payload?.recordset) && payload.recordset) ||
          (Array.isArray(payload) && payload) ||
          [];

        const options = raw.map((row: any, index: number) => {
          const dept = String(row.Dept ?? "").trim();
          const qty = Number(row.WasteQty ?? 0);
          const id = String(row.WRID ?? row.Id ?? row.ID ?? index);
          return { id, dept, qty, label: `${dept || "Dept"} - ${qty}` };
        });

        setUndisposedOptions(options);
        setSelectedUndisposedIds([]);
      } catch {
        setUndisposedOptions([]);
        setSelectedUndisposedIds([]);
      } finally {
        setLoadingUndisposed(false);
      }
    };

    void loadUndisposed();
  }, [wasteCategory, selectedWasteId]);

  const selectedUndisposedItems = undisposedOptions.filter((item) =>
    selectedUndisposedIds.includes(item.id),
  );
  const totalQty = selectedUndisposedItems.reduce((sum, item) => sum + (item.qty || 0), 0);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!disposalDate || !wasteCategory || !selectedWasteId) {
      alert("Please fill Date, Waste Category and Waste.");
      return;
    }

    try {
      // 1) Initiate Disposal
      const res = await fetch("/api/SetData/InitiateDisposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          WCID: wasteCategory,
          WID: selectedWasteId,
          TotalQty: totalQty,
          Auctionable: 3,
          AuctionDate: disposalDate,
          PSID:physicalForm,
          AID:disposedTo,
          Remarks: "",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Save Failed");
        return;
      }

      const wrid = data?.data?.WRID;
      if (!wrid) {
        alert("WRID missing from InitiateDisposal response");
        return;
      }

      // 2) Insert Auction Waste Details for ALL selected WRIDs
      const res2 = await fetch("/api/SetData/InsertAuctionWasteDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IDDID: wrid,
          WRID: selectedUndisposedIds,
        }),
      });

      const data2 = await res2.json();
      if (!res2.ok || !data2.success) {
        alert(data2.message || "InsertAuctionWasteDetails failed");
        return;
      }

      alert("Saved Successfully");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <section className="max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Disposal / Recycling</h1>
        <p className="mt-1 text-sm text-slate-600">
          Fill the form below for internal disposal & recycling approval.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Date of Disposal</label>
            <input
              type="date"
              value={disposalDate}
              onChange={(e) => setDisposalDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Disposed To</label>
           <select
                    value={disposedTo}
                    onChange={(e) => setDisposedTo(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                    <option value="">Select</option>
                    {disposedOptions.map((opt) => (
                        <option key={opt.IRID} value={opt.IRID}>
                        {opt.IRName}
                        </option>
                    ))}
                    </select>

          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Waste Category</label>
          <select
            value={wasteCategory}
            onChange={(e) => setWasteCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={loadingBase}
          >
            <option value="">{loadingBase ? "Loading..." : "Select Waste Category"}</option>
            {categoryOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Waste List</label>
          <select
            value={selectedWasteId}
            onChange={(e) => setSelectedWasteId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={!wasteCategory || loadingWaste}
          >
            <option value="">{loadingWaste ? "Loading..." : "Select Waste Item"}</option>
            {wasteOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="block text-sm font-semibold text-slate-700">
            Undisposed Waste (Dept - Quantity)
          </label>
          <button
            type="button"
            onClick={() => setUndisposedDropdownOpen((prev) => !prev)}
            disabled={!wasteCategory || !selectedWasteId || loadingUndisposed}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-left disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {selectedUndisposedItems.length > 0
              ? selectedUndisposedItems.map((x) => x.label).join(", ")
              : loadingUndisposed
              ? "Loading..."
              : "Select Dept - Quantity"}
          </button>

          {undisposedDropdownOpen && (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-300 bg-white p-2 shadow">
              {undisposedOptions.length === 0 ? (
                <p className="px-2 py-1 text-sm text-slate-500">No undisposed waste</p>
              ) : (
                undisposedOptions.map((item) => {
                  const checked = selectedUndisposedIds.includes(item.id);
                  return (
                    <label key={item.id} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const nextIds = e.target.checked
                            ? [...selectedUndisposedIds, item.id]
                            : selectedUndisposedIds.filter((id) => id !== item.id);
                          setSelectedUndisposedIds(nextIds);
                        }}
                      />
                      <span className="text-sm text-slate-700">{item.label}</span>
                    </label>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Total Quantity</label>
          <input
            type="text"
            value={totalQty.toFixed(2)}
            readOnly
            className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Physical Form</label>
            <select
                value={physicalForm}
                onChange={(e) => setPhysicalForm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                <option value="">Select</option>
                {physicalOptions.map((opt) => (
                    <option key={opt.ID} value={opt.ID}>
                    {opt.NAME}
                    </option>
                ))}
                </select>

          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Document Proof</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            type="submit"
            className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Submit
          </button>
        </div>
      </form>
    </section>
  );
}
