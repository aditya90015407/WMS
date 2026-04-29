"use client";

import { useEffect, useState } from "react";

type WasteOption = {
  id: string;
  dept: string;
  qty: number;
  genDate: string;
  targetDate: string;
  todayDate: string;
  daysLeft: string;
  label: string;
  unit: string
};


type Option = { id: string; name: string };
type Option1 = { ID: string; NAME: string };
export default function NonAuctionablePage() {
  const [wasteCategory, setWasteCategory] = useState("");
  const [waste, setWaste] = useState("");
  const [Date, setDate] = useState("");
  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingWaste, setLoadingWaste] = useState(false);
  const [physicalOptions, setPhysicalOptions] = useState<Option1[]>([]);
  const [loadingUndisposed, setLoadingUndisposed] = useState(false);
  const [physicalForm, setPhysicalForm] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [wasteOptions, setWasteOptions] = useState<Option[]>([]);

  const [selectedWasteId, setSelectedWasteId] = useState("");

  const [undisposedOptions, setUndisposedOptions] = useState<WasteOption[]>([]);
  const [selectedUndisposedIds, setSelectedUndisposedIds] = useState<string[]>([]);
  const [undisposedDropdownOpen, setUndisposedDropdownOpen] = useState(false);

  const [remarks, setRemarks] = useState("");
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [physicalRes] = await Promise.all([

          fetch("/api/GetData/GetPhysicalForm", { cache: "no-store" }),
        ]);

        const physicalPayload = await physicalRes.json();



        setPhysicalOptions(
          physicalPayload.success && Array.isArray(physicalPayload.data)
            ? physicalPayload.data
            : [],
        );
      } catch {

        setPhysicalOptions([]);
      }
    };

    void loadDropdowns();
  }, []);
  useEffect(() => {
    const loadBase = async () => {
      setLoadingBase(true);
      try {
        const wcRes = await fetch("/api/auth/Waste/generate?type=drop-wc", {
          cache: "no-store",
        });
        const wcPayload = (await wcRes.json()) as { success?: boolean; data?: Option[] };

        setCategoryOptions(
          wcPayload.success && Array.isArray(wcPayload.data) ? wcPayload.data : [],
        );
      } catch (err) {
        console.error("loadBase failed", err);
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
        setWaste("");
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
        const payload = (await res.json()) as { success?: boolean; data?: Option[] };
        const data = payload.success && Array.isArray(payload.data) ? payload.data : [];
        setWasteOptions(data);
        setSelectedWasteId("");
        setWaste("");
        setUndisposedOptions([]);
        setSelectedUndisposedIds([]);
      } catch {
        setWasteOptions([]);
        setSelectedWasteId("");
        setWaste("");
        setUndisposedOptions([]);
        setSelectedUndisposedIds([]);
      } finally {
        setLoadingWaste(false);
      }
    };

    void loadWaste();
  }, [wasteCategory]);

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
          const rawQty = String(row.WasteQty ?? "").replace(",", ".");
          const qtyNum = Number.parseFloat(rawQty);
          const qty = Number.isFinite(qtyNum) ? qtyNum : 0;
          const unit = String(row.MUnit ?? "").trim();

          const genDate = String(row.GenerationDate ?? "").split("T")[0].trim();
          const targetDate = String(row.TargetDate ?? "").split("T")[0].trim();
          const todayDate = new globalThis.Date().toISOString().split("T")[0];

          let daysLeft = "";
          if (targetDate) {
            const today = new globalThis.Date(todayDate);
            const target = new globalThis.Date(`${targetDate}`);

            const diffTime = target.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysLeft = String(diffDays);
          }

          const qtyLabel = qty.toFixed(2);
          const id = String(row.WRID ?? row.Id ?? row.ID ?? index);

          return {
            id,
            dept,
            qty,
            genDate,
            targetDate,
            todayDate,
            daysLeft,
            unit,
            label: `${dept || "Dept"} - ${qtyLabel} - ${daysLeft} -${unit}`,
          };
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
  const totalSelectedQty = selectedUndisposedItems.reduce(
    (sum, item) => sum + (item.qty || 0),
    0,
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!Date) {
      alert("Please select the Date");
      return;
    }

    if (!wasteCategory || !selectedWasteId) {
      alert("Please select waste category and waste item.");
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
          TotalQty: totalSelectedQty,
          Auctionable: 2,
          PSID: physicalForm,
          AuctionDate: Date,
          Remarks: remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return alert(data.message || "Save Failed");
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
        return alert(data2.message || "InsertAuctionWasteDetails failed");
      }

      alert("Saved Successfully");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Non Auctionable Disposal</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Date</label>
          <input
            type="date"
            value={Date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Waste Category</label>
          <select
            value={wasteCategory}
            onChange={(e) => setWasteCategory(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
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
          <label className="mb-1 block text-sm font-semibold text-slate-700">Waste List</label>
          <select
            value={selectedWasteId}
            onChange={(e) => {
              setSelectedWasteId(e.target.value);
              const name = wasteOptions.find((w) => w.id === e.target.value)?.name ?? "";
              setWaste(name);
            }}
            className="w-full rounded border border-slate-300 px-3 py-2"
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
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Undisposed Waste (Dept - Quantity - Days Left)
          </label>
          <button
            type="button"
            onClick={() => setUndisposedDropdownOpen((prev) => !prev)}
            disabled={!wasteCategory || !selectedWasteId || loadingUndisposed}
            className="w-full rounded border border-slate-300 px-3 py-2 text-left disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {selectedUndisposedItems.length > 0
              ? selectedUndisposedItems.map((x) => x.label).join(", ")
              : loadingUndisposed
                ? "Loading..."
                : "Select Dept - Quantity - Days Left"}
          </button>

          {undisposedDropdownOpen && (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-300 bg-white p-2 shadow">
              {undisposedOptions.length === 0 ? (
                <p className="px-2 py-1 text-sm text-slate-500">No undisposed waste</p>
              ) : (
                undisposedOptions.map((item) => {
                  const checked = selectedUndisposedIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 rounded px-2 py-1 hover:bg-slate-50"
                    >
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
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700">
                          {item.dept || "Dept"} - {item.qty.toFixed(2)}
                        </span>
                        <span className="text-sm font-semibold text-red-600">
                          {item.daysLeft ? `${item.daysLeft} days left` : "N/A"} -{" "}
                          {item.unit || "N/A"}
                        </span>
                      </div>

                    </label>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Total Quantity
          </label>
          <input
            type="text"
            readOnly
            value={totalSelectedQty.toFixed(2)}
            className="w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 text-sm"
          />
        </div>
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
          <label className="mb-1 block text-sm font-semibold text-slate-700">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
        >
          Submit
        </button>
      </form>
    </section>
  );
}