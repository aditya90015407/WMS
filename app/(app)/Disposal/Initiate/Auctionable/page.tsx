"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";



type Option = { id: string; name: string, email: string, vendorCode: string };
type Option1 = { ID: string; NAME: string };

export default function AuctionablePage() {
  // const [batchId, setBatchId] = useState("");
  const router = useRouter();

  const [auctionDate, setAuctionDate] = useState("");
  const [physicalOptions, setPhysicalOptions] = useState<Option1[]>([]);
  const [wasteCategory, setWasteCategory] = useState("");
  const [wasteOptions, setWasteOptions] = useState<Option[]>([]);
  const [selectedWasteId, setSelectedWasteId] = useState("");
  const [undisposedOptions, setUndisposedOptions] = useState<
    Array<{
      id: string;
      dept: string;
      qty: number;
      genDate: string;
      targetDate: string;
      todayDate: string;
      daysLeft: string;
      label: string;
      unit: string
      muid: string
    }>
  >([]);


  const [selectedUndisposedIds, setSelectedUndisposedIds] = useState<string[]>([]);
  const [loadingUndisposed, setLoadingUndisposed] = useState(false);

  const [vendorOptions, setVendorOptions] = useState<Option[]>([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [physicalForm, setPhysicalForm] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);

  type PlantUnit = {
    ID: string
    NAME: string
  }

  const [plantUnit, setPlantUnit] = useState<PlantUnit[]>([])
  const [selectedPlantUnit, setSelectedPlantUnit] = useState("")

  async function GetPlantUnits() {

    const res = await fetch("/api/GetData/GetUnit")
    const data = await res.json()
    // console.log(data)

    setPlantUnit(data)
  }

  useEffect(() => {
    GetPlantUnits()
  }, [])

  // kept to avoid removing old element references
  const [waste, setWaste] = useState("");
  const [vendor, setVendor] = useState("");

  const [remarks, setRemarks] = useState("");
  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingWaste, setLoadingWaste] = useState(false);

  const [undisposedDropdownOpen, setUndisposedDropdownOpen] = useState(false);
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
        email: String(row.Email ?? row.email ?? ""),
        vendorCode: String(row.VendorCode ?? row.vendorCode ?? ""),
      }));
    } catch (err) {
      console.error("fetchVendor failed", err);
      return [];
    }
  }

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
        setSelectedWasteId("");
        setWaste("");
        return;
      }

      setLoadingWaste(true);
      try {
        const res = await fetch(
          `/api/auth/Waste/generate?type=drop-waste-for-plantunit&wcid=${encodeURIComponent(wasteCategory)}&plantunitid=${encodeURIComponent(selectedPlantUnit)}`,
          { cache: "no-store" },
        );
        const payload = (await res.json()) as { success?: boolean; data?: Option[] };
        const data = payload.success && Array.isArray(payload.data) ? payload.data : [];
        setWasteOptions(data);
        setSelectedWasteId("");
        setWaste("");
      } catch {
        setWasteOptions([]);
        setSelectedWasteId("");
        setWaste("");
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
        const res = await fetch("/api/GetData/GetAllUndisposedWasteByUnit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flag: "GetAllUndisposedWaste",
            WCID: wasteCategory,
            WID: selectedWasteId,
            UID: selectedPlantUnit
          }),
        });

        const payload = await res.json();
        console.log(payload);
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
          const muid = row.MUID
          const genDate = String(row.GenerationDate ?? "").split("T")[0].trim();
          const targetDate = String(row.TargetDate ?? "").split("T")[0].trim();
          const todayDate = new Date().toISOString().split("T")[0];

          let daysLeft = "";
          if (targetDate) {
            const today = new Date(todayDate);
            const target = new Date(targetDate);
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
            muid,
            label: `${dept || "Dept"} - ${qtyLabel}  ${unit} - ${daysLeft} days left`,
            // label: `${dept || "Dept"} - ${qtyLabel} - ${daysLeft} -${unit}`,
          };
        });

        // console.log(options, "op")

        setUndisposedOptions(options);
        setSelectedUndisposedIds([]);
        setUndisposedDropdownOpen(false);
      } catch (err) {
        console.error("loadUndisposed failed", err);
        setUndisposedOptions([]);
        setSelectedUndisposedIds([]);
      } finally {
        setLoadingUndisposed(false);
      }
    };

    void loadUndisposed();
  }, [wasteCategory, selectedWasteId]);

  const displayVendorOptions = vendorOptions.filter((v) => v.name && v.name.trim().length > 0);

  const selectedVendorNames = displayVendorOptions
    .filter((v) => selectedVendorIds.includes(v.id))
    .map((v) => v.name);

  const selectedUndisposedItems = undisposedOptions.filter((item) =>
    selectedUndisposedIds.includes(item.id),
  );
  const totalSelectedQty = selectedUndisposedItems.reduce(
    (sum, item) => sum + (item.qty || 0),
    0,
  );
  // console.log(totalSelectedQty)
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !wasteCategory ||
      !selectedWasteId ||
      selectedUndisposedIds.length === 0
    ) {
      alert("Please fill all required fields and select at least one waste item and vendor.");
      return;
    }

    try {
      const res = await fetch("/api/SetData/InitiateDisposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          WCID: wasteCategory,
          WID: selectedWasteId,
          TotalQty: totalSelectedQty,
          MUID: undisposedOptions[0].muid,
          Auctionable: 1,
          AuctionDate: auctionDate,
          PSID: physicalForm,
          Remarks: remarks,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Save Failed");
        return;
      }

      const iddid = data?.data?.WRID;
      if (!iddid) {
        alert("IDDID missing in InitiateDisposal response");
        return;
      }

      const res2 = await fetch("/api/SetData/InsertAuctionWasteDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IDDID: iddid,
          WRID: selectedUndisposedIds,
        }),
      });

      const data2 = await res2.json();
      // console.log("InsertAuctionWasteDetails response:", data2);

      if (!res2.ok || !data2.success) {
        alert(data2.message || "InsertAuctionWasteDetails failed");
        return;
      }

      // const vendorInsertResults = await Promise.all(
      //   selectedVendorIds.map(async (vendorId) => {
      //     const vendorRes = await fetch("/api/SetData/InsertAuctionVendorDetails", {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify({
      //         IDDID: iddid,
      //         VID: vendorId,
      //       }),
      //     });

      //     const vendorData = await vendorRes.json();
      //     // console.log("InsertAuctionVendorDetails response:", vendorData);

      //     if (!vendorRes.ok || !vendorData.success) {
      //       throw new Error(vendorData.message || `Failed to insert vendor ${vendorId}`);
      //     }

      //     return vendorData;
      //   }),
      // );

      // console.log("Vendor insert results:", vendorInsertResults);
      alert(data.message || "Saved Successfully");

      router.back()
    } catch (error) {
      console.error("Submit Failed", error);
      alert("Something went wrong while saving");
    }
  };


  return (
    <section className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* <h1 className="text-2xl font-semibold text-teal-600 text-center">Auctionable Disposal</h1> */}
      <div className="relative">
        <h1 className="text-lg font-semibold text-teal-600 text-center">Auctionable Disposal</h1>

        <img src="/goback.png" alt="" className="h-5 absolute top-0 right-5" />

        <img src="/refresh.png" alt="" className="h-4.5 cursor-pointer absolute top-0.5 right-15"
          onClick={() => window.location.reload()} />

      </div>
      <form onSubmit={onSubmit} className="mt-6 ">

        <div className="space-y-4 grid grid-cols-2 space-x-10 mx-3">

          {/* <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Auction Details (Batch Id)
          </label>
          <input
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div> */}

          {/* <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Auction Date</label>
          <input
            type="date"
            value={auctionDate}
            onChange={(e) => setAuctionDate(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div> */}

          <div className="text-sm">
            <label className="mb-1 block text-xs font-semibold text-slate-700">Waste Disposal Unit </label>
            <select
              value={selectedPlantUnit}
              onChange={(e) => {
                setSelectedPlantUnit(e.target.value);
              }}
              className="w-full rounded border border-slate-300 px-3 py-2"
              disabled={loadingBase}
            >
              <option value="">{loadingBase ? "Loading..." : "Select Plant Unit"}</option>
              {plantUnit.map((item) => (
                <option key={item.ID} value={item.ID}>
                  {item.NAME}
                </option>
              ))}
            </select>
          </div>


          <div className="text-sm">
            <label className="mb-1 block text-xs font-semibold text-slate-700">Waste Category</label>
            <select
              value={wasteCategory}
              onChange={(e) => {
                setWasteCategory(e.target.value);
              }}
              className="w-full rounded border border-slate-300 px-3 py-2"
              disabled={loadingBase || !selectedPlantUnit}
            >
              <option value="">{loadingBase ? "Loading..." : !selectedPlantUnit ? "Select Unit First" : "Select Waste Category"}</option>
              {categoryOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm">
            <label className="mb-1 block text-xs font-semibold text-slate-700">Waste List</label>
            <select
              value={selectedWasteId}
              onChange={(e) => {
                setSelectedWasteId(e.target.value);
                const name =
                  wasteOptions.find((w) => w.id === e.target.value)?.name ?? "";
                setWaste(name);
              }}
              className="w-full rounded border border-slate-300 px-3 py-2"
              disabled={!wasteCategory || loadingWaste}
            >
              <option value="">
                {loadingWaste ? "Loading..." : "Select Waste Item"}
              </option>
              {wasteOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative text-sm">
            <label className="mb-1 block text-xs font-semibold text-slate-700">
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
                  : "Select Dept - Quantity - Days left"}
            </button>

            {undisposedDropdownOpen && (
              <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-300 bg-white p-2 shadow">
                {undisposedOptions.length === 0 ? (
                  <p className="px-2 py-1 text-xs text-slate-500">No undisposed waste</p>
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
                            {item.dept || "Dept"} - {item.qty.toFixed(2)}{" "}{item.unit || "N/A"}
                          </span>
                          <span className="text-sm font-semibold text-red-600">
                            {item.daysLeft ? `${item.daysLeft} days left` : "N/A"}{" "}

                          </span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </div>


          <div className="text-sm">
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Total Quantity
            </label>
            <div
              className="w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 text-xs"
            >
              {Number.isFinite(totalSelectedQty) ? totalSelectedQty.toFixed(2) : "0.00"}{" "}{undisposedOptions[0]?.unit}
            </div>
            {/* <input
            type="text"
            readOnly
            value={Number.isFinite(totalSelectedQty) ? totalSelectedQty.toFixed(2) : "0.00"}
            className="w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 text-xs"
          /> */}
          </div>


          <div className="text-sm">
            <label className="block text-xs font-semibold text-slate-700">Physical Form</label>
            <select
              value={physicalForm}
              onChange={(e) => setPhysicalForm(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            >
              <option value="">Select</option>
              {physicalOptions.map((opt) => (
                <option key={opt.ID} value={opt.ID}>
                  {opt.NAME}
                </option>
              ))}
            </select>
          </div>

          {/*
        <div className="relative">
          <label className="mb-1 block text-xs font-semibold text-slate-700">Vendor List</label>

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
                <p className="px-2 py-1 text-xs text-slate-500">No vendor options</p>
              ) : (
                <>
                  <label className="flex items-center gap-2 rounded px-2 py-1 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={
                        displayVendorOptions.length > 0 &&
                        selectedVendorIds.length === displayVendorOptions.length
                      }
                      onChange={(e) => {
                        const nextIds = e.target.checked
                          ? displayVendorOptions.map((v) => v.id)
                          : [];
                        setSelectedVendorIds(nextIds);

                        const names = displayVendorOptions
                          .filter((v) => nextIds.includes(v.id))
                          .map((v) => v.name)
                          .join(", ");
                        setVendor(names);
                      }}
                    />
                    <span className="text-sm font-semibold text-slate-700">Select All Vendors</span>
                  </label>

                  {displayVendorOptions.map((item) => {
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
                          }}
                        />
                        <span className="text-sm text-slate-700">
                          {(item.name || "Dept")} {item.vendorCode ? `- ${item.vendorCode}` : ""}
                        </span>
                        <span className="text-sm font-semibold">
                          {item.email || "-"}
                        </span>
                      </label>
                    );
                  })}
                </>
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
      */}

          <div className="w-[95%]  col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-700">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-sm rounded border border-slate-300 px-3 py-2"
              rows={1}
            />
          </div>
        </div>
        <button
          type="submit"
          className="text-sm place-self-center block cursor-pointer rounded bg-emerald-700 mt-2 px-3 py-2 text-white hover:bg-emerald-800"
        >
          Submit
        </button>
      </form>
    </section >
  );
}