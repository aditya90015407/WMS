"use client";

import { useEffect, useState } from "react";

type Option = { id: string; name: string };

export default function AuctionablePage() {
  // const [batchId, setBatchId] = useState("");
  const [auctionDate, setAuctionDate] = useState("");

  const [wasteCategory, setWasteCategory] = useState("");
  const [wasteOptions, setWasteOptions] = useState<Option[]>([]);
  const [selectedWasteIds, setSelectedWasteIds] = useState<string[]>([]);

  const [vendorOptions, setVendorOptions] = useState<Option[]>([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);

  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);

  // kept to avoid removing old element references
  const [waste, setWaste] = useState("");
  const [vendor, setVendor] = useState("");

  const [remarks, setRemarks] = useState("");
  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingWaste, setLoadingWaste] = useState(false);

  const [wasteDropdownOpen, setWasteDropdownOpen] = useState(false);
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);

  async function fetchVendor(): Promise<Option[]> {
    try {
      const res = await fetch("/api/GetData/GetVendor", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const payload = await res.json();
      setVendorOptions(payload.success ? payload.data ?? [] : []);
      const raw =
        (Array.isArray(payload?.data) && payload.data) ||
        (Array.isArray(payload?.recordset) && payload.recordset) ||
        (Array.isArray(payload) && payload) ||
        [];

      return raw.map((row: any) => ({
        id: String(row.id ?? row.ID ?? row.VID ?? row.VendorID ?? row.VENDORID ?? ""),
        name: String(
          row.name ??
          row.NAME ??
          row.VENDORNAME ??
          row.VendorName ??
          row.VENDOR ??
          row["Vendor Name"] ??
          row["VENDOR NAME"] ??
          row.VENDNAME ??
          row.VNAME ??
          ""
        ).trim(),
      }));
    } catch (err) {
      console.error("fetchVendor failed", err);
      return [];
    }
  }

  useEffect(() => {
    const loadBase = async () => {
      setLoadingBase(true);
      try {
        const wcRes = await fetch("/api/auth/Waste/generate?type=drop-wc", {
          cache: "no-store",
        });
        const wcPayload = (await wcRes.json()) as { success?: boolean; data?: Option[] };

        const vendors = await fetchVendor();

        setCategoryOptions(
          wcPayload.success && Array.isArray(wcPayload.data) ? wcPayload.data : [],
        );
        setVendorOptions(vendors);
      } catch (err) {
        console.error("loadBase failed", err);
        setCategoryOptions([]);
        setVendorOptions([]);
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
        setSelectedWasteIds([]);
        setWaste("");
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
        setSelectedWasteIds([]);
        setWaste("");
      } catch {
        setWasteOptions([]);
        setSelectedWasteIds([]);
        setWaste("");
      } finally {
        setLoadingWaste(false);
      }
    };

    void loadWaste();
  }, [wasteCategory]);

  const selectedWasteNames = wasteOptions
    .filter((w) => selectedWasteIds.includes(w.id))
    .map((w) => w.name);

  const displayVendorOptions = vendorOptions.filter((v) => v.name && v.name.trim().length > 0);

  const selectedVendorNames = displayVendorOptions
    .filter((v) => selectedVendorIds.includes(v.id))
    .map((v) => v.name);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      // !batchId ||
      !auctionDate ||
      !wasteCategory ||
      selectedWasteIds.length === 0 ||
      selectedVendorIds.length === 0
    ) {
      alert("Please fill all required fields and select at least one waste item and vendor.");
      return;
    }

    try {

      const res = await fetch("/api/SetData/SetAuctionableDisposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          {
            Auctionable: 1,
            AuctionDate: auctionDate,
            wasteCategoryId: wasteCategory,
            wasteIds: selectedWasteIds,
            vendorIds: selectedVendorIds,
            Remarks: remarks,
          }
        ),

      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Save Failed");
        return;
      }
      const a1 = data.data?.a1 ?? [];
      const a2 = data.data?.a2 ?? [];
      const a3 = data.data?.a3 ?? [];
      alert(data.message || "Saved Successfully");

    }


    // setBatchId("");
    // setAuctionDate("");
    // setWasteCategory("");
    // setSelectedWasteIds([]);
    //   setSelectedVendorIds([]);
    //   setWaste("");
    //   setVendor("");
    //   setRemarks("");
    catch (error) {

      console.error("Submit Failed", error);
      alert("Something went wrong while saving");
    }
  };

  return (
    <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Auctionable Disposal</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {/* <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Auction Details (Batch Id)
          </label>
          <input
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div> */}

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Auction Date</label>
          <input
            type="date"
            value={auctionDate}
            onChange={(e) => setAuctionDate(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Waste Category</label>
          <select
            value={wasteCategory}
            onChange={(e) => {
              setWasteCategory(e.target.value);
              setWasteDropdownOpen(false);
            }}
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

        <div className="relative">
          <label className="mb-1 block text-sm font-semibold text-slate-700">Waste List</label>

          <button
            type="button"
            onClick={() => setWasteDropdownOpen((prev) => !prev)}
            disabled={!wasteCategory || loadingWaste}
            className="w-full rounded border border-slate-300 px-3 py-2 text-left disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {selectedWasteNames.length > 0
              ? selectedWasteNames.join(", ")
              : loadingWaste
                ? "Loading..."
                : "Select Waste Items"}
          </button>

          {wasteDropdownOpen && (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-300 bg-white p-2 shadow">
              {wasteOptions.length === 0 ? (
                <p className="px-2 py-1 text-sm text-slate-500">No waste options</p>
              ) : (
                wasteOptions.map((item) => {
                  const checked = selectedWasteIds.includes(item.id);
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
                            ? [...selectedWasteIds, item.id]
                            : selectedWasteIds.filter((id) => id !== item.id);

                          setSelectedWasteIds(nextIds);

                          const names = wasteOptions
                            .filter((w) => nextIds.includes(w.id))
                            .map((w) => w.name)
                            .join(", ");
                          setWaste(names);

                          setWasteDropdownOpen(false);
                        }}
                      />
                      <span className="text-sm text-slate-700">{item.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          )}

          {selectedWasteNames.length > 0 && (
            <p className="mt-1 text-xs text-slate-600">
              Selected: {selectedWasteNames.join(", ")}
            </p>
          )}
        </div>

        <div className="relative">
          <label className="mb-1 block text-sm font-semibold text-slate-700">Vendor List</label>

          <button
            type="button"
            onClick={() => setVendorDropdownOpen((prev) => !prev)}
            disabled={loadingBase}
            className="w-full rounded border border-slate-300 px-3 py-2 text-left disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {selectedVendorNames.length > 0
              ? selectedVendorNames.join(", ")
              : loadingBase
                ? "Loading..."
                : "Select Vendor(s)"}
          </button>

          {vendorDropdownOpen && (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-300 bg-white p-2 shadow">
              {displayVendorOptions.length === 0 ? (
                <p className="px-2 py-1 text-sm text-slate-500">No vendor options</p>
              ) : (
                displayVendorOptions.map((item) => {
                  const checked = selectedVendorIds.includes(item.id);
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
                            ? [...selectedVendorIds, item.id]
                            : selectedVendorIds.filter((id) => id !== item.id);

                          setSelectedVendorIds(nextIds);

                          const names = displayVendorOptions
                            .filter((v) => nextIds.includes(v.id))
                            .map((v) => v.name)
                            .join(", ");
                          setVendor(names);

                          setVendorDropdownOpen(false);
                        }}
                      />
                      <span className="text-sm text-slate-700">{item.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          )}

          {selectedVendorNames.length > 0 && (
            <p className="mt-1 text-xs text-slate-600">
              Selected Vendors: {selectedVendorNames.join(", ")}
            </p>
          )}

          {!loadingBase && displayVendorOptions.length === 0 && (
            <p className="mt-1 text-xs text-red-600">
              Vendor names are empty from API response. Please fix vendor name mapping in backend.
            </p>
          )}
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
