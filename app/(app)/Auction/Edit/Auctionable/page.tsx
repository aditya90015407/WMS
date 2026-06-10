"use client";

import React, { useEffect, useMemo, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import decrypt from "@/components/Decrypt";

type Option = { id: string; name: string; email: string; vendorCode: string };
type Option1 = { ID: string; NAME: string };

type VendorOption = {
  id: string; name: string, email: string, vendorCode: string
};

type UndisposedOption = {
  id: string;
  dept: string;
  qty: number;
  genDate: string;
  targetDate: string;
  todayDate: string;
  daysLeft: string;
  label: string;
  unit: string;
  muid: string
};

export default function AuctionablePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const router = useRouter();
  // const params = useSearchParams();


  const params = React.use(searchParams);
  const encryptediddid = params.id;

  const [iddid, setIddid] = useState("")

  const [auctionDate, setAuctionDate] = useState("");
  const [physicalOptions, setPhysicalOptions] = useState<Option1[]>([]);
  const [wasteCategory, setWasteCategory] = useState("");
  const [wasteOptions, setWasteOptions] = useState<Option[]>([]);
  const [selectedWasteId, setSelectedWasteId] = useState("");
  const [undisposedOptions, setUndisposedOptions] = useState<UndisposedOption[]>([]);
  const [selectedUndisposedIds, setSelectedUndisposedIds] = useState<string[]>([]);
  const [alreadySelectedUndisposedIds, setAlreadySelectedUndisposedIds] = useState<string[]>([]);
  const [savedUndisposedIds, setSavedUndisposedIds] = useState<string[]>([]);
  const [loadingUndisposed, setLoadingUndisposed] = useState(false);
  const [alreadySelectedVendorIds, setAlreadySelectedVendorIds] = useState<string[]>([]);

  const [physicalForm, setPhysicalForm] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);

  const [waste, setWaste] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingWaste, setLoadingWaste] = useState(false);

  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);

  const [undisposedDropdownOpen, setUndisposedDropdownOpen] = useState(false);
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);


  async function decryptId() {
    const decryptedId = await decrypt(encryptediddid!)
    setIddid(decryptedId)
  }

  useEffect(() => {
    if (!encryptediddid) return
    decryptId()
  }, [encryptediddid])

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const physicalRes = await fetch("/api/GetData/GetPhysicalForm", { cache: "no-store" });
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
        // console.log(data)
        setWasteOptions(data);
      } catch {
        setWasteOptions([]);
      } finally {
        setLoadingWaste(false);
      }
    };

    void loadWaste();
  }, [wasteCategory]);

  useEffect(() => {
    const loadEditDetails = async () => {
      if (!iddid) return;

      try {
        const res = await fetch("/api/GetData/GetAllInitiateDisposalDetailbyID", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: iddid }),
        });

        const payload = await res.json();
        if (!res.ok || !payload.success) {
          console.error("Failed to load edit details", payload);
          return;
        }

        const detailRow = Array.isArray(payload.data) ? payload.data[0] : payload.data;
        if (!detailRow) return;

        setAuctionDate(String(detailRow.AuctionDate ?? "").split("T")[0]);
        setWasteCategory(String(detailRow.WCID ?? ""));
        setSelectedWasteId(String(detailRow.WID ?? ""));
        setPhysicalForm(String(detailRow.PSID ?? ""));
        setRemarks(String(detailRow.Remarks ?? ""));
      } catch (error) {
        console.error("loadEditDetails failed", error);
      }
    };

    void loadEditDetails();
  }, [iddid]);

  useEffect(() => {
    if (!selectedWasteId) return;

    const selected = wasteOptions.find((w) => w.id === selectedWasteId);
    if (selected) {
      setWaste(selected.name);
    }
  }, [selectedWasteId, wasteOptions]);

  useEffect(() => {
    const loadSelectedWaste = async () => {
      if (!iddid) return;

      try {
        const wres = await fetch("/api/GetData/GetWasteListByIDDID", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: iddid }),
        });

        const payload = await wres.json();
        if (!payload.success || !wres.ok) {
          console.error("Failed to load selected waste", payload);
          return;
        }

        const rows = Array.isArray(payload.data)
          ? payload.data
          : payload.data
            ? [payload.data]
            : [];

        const selectedIds = rows
          .map((row: any) => String(row.WRID ?? row.Id ?? row.ID ?? "").trim())
          .filter(Boolean);

        const selectedRows: UndisposedOption[] = rows.map((row: any) => {
          const qty = Number(row.WasteQty ?? 0);
          const genDate = String(row.GenerationDate ?? "").split("T")[0].trim();
          const targetDate = String(row.TargetDate ?? "").split("T")[0].trim();
          const todayDate = new Date().toISOString().split("T")[0];
          const unit = String(row.MUnit ?? row.unit ?? "").trim();
          const muid = row.MUID


          let daysLeft = "";
          if (targetDate) {
            const today = new Date(todayDate);
            const target = new Date(targetDate);
            const diffTime = target.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysLeft = String(diffDays);
          }

          const dept = String(row.DeptDesc ?? row.Dept ?? "Previously Selected").trim();

          return {
            id: String(row.WRID ?? row.Id ?? row.ID ?? "").trim(),
            dept,
            qty,
            genDate,
            targetDate,
            todayDate,
            daysLeft,
            muid,
            unit,
            label: `${dept} - ${qty.toFixed(2)} ${unit} - ${daysLeft || "N/A"}  days left`,
          };
        });

        setSavedUndisposedIds(selectedIds);

        setUndisposedOptions((prev) => {
          const map = new Map(prev.map((item) => [item.id, item]));
          for (const item of selectedRows) {
            if (!map.has(item.id)) {
              map.set(item.id, item);
            }
          }
          return Array.from(map.values());
        });
      } catch (err) {
        console.error("loadSelectedWasteDetails failed", err);
      }
    };

    void loadSelectedWaste();
  }, [iddid]);

  useEffect(() => {
    const loadUndisposed = async () => {
      if (!wasteCategory || !selectedWasteId) {
        setUndisposedOptions([]);
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

        const options: UndisposedOption[] = raw.map((row: any, index: number) => {
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
            label: `${dept || "Dept"} - ${qtyLabel} ${unit} - ${daysLeft || "N/A"} days left`,
          };
        });

        setUndisposedOptions((prev) => {
          const map = new Map(prev.map((item) => [item.id, item]));
          for (const item of options) {
            map.set(item.id, item);
          }
          return Array.from(map.values());
        });

        setUndisposedDropdownOpen(false);
      } catch (err) {
        console.error("loadUndisposed failed", err);
        setUndisposedOptions([]);
        setSelectedUndisposedIds([]);
        setAlreadySelectedUndisposedIds([]);
      } finally {
        setLoadingUndisposed(false);
      }
    };

    void loadUndisposed();
  }, [wasteCategory, selectedWasteId]);

  useEffect(() => {
    const loadVendors = async () => {
      if (!iddid) return;

      try {
        const selectedRes = await fetch("/api/GetData/GetVendorDetailsEditbyIDDID", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: iddid }),
        });
        const selectedData = await selectedRes.json();
        const selectedRows = Array.isArray(selectedData?.data) ? selectedData.data : [];

        console.log(selectedData, "selected vendors")

        const selectedVendorRowsMapped: VendorOption[] = selectedRows.map((row: any, index: number) => ({
          id: String(row.VID ?? row.ID ?? row.id ?? index).trim(),
          name: String(row.NAME ?? row.VendorName ?? row.Name ?? "Vendor").trim(),
          email: String(row.Email ?? row.email ?? ""),
          vendorCode: String(row.VendorCode ?? row.vendorCode ?? ""),

        }));

        const selectedIds = selectedVendorRowsMapped.map((item) => item.id).filter(Boolean);
        setSelectedVendorIds(selectedIds);
        setAlreadySelectedVendorIds(selectedIds);

        console.log(selectedIds)


        const unselectedRes = await fetch("/api/GetData/GetVendor", {
          method: "POST",
          cache: "no-store"
        });
        const unselectedData = await unselectedRes.json();
        const unselectedRows = Array.isArray(unselectedData?.data) ? unselectedData.data : [];
        console.log(unselectedRows, "all vendors")

        const unselectedVendorRowsMapped: VendorOption[] = unselectedRows.map((row: any, index: number) => ({
          id: String(row.VID ?? row.ID ?? row.id ?? index).trim(),
          name: String(row.NAME ?? row.VendorName ?? row.name ?? "Vendor").trim(),
          email: String(row.Email ?? row.email ?? ""),
          vendorCode: String(row.VendorCode ?? row.vendorCode ?? ""),
        }));

        const mergedVendorOptions: VendorOption[] = [
          ...selectedVendorRowsMapped,
          ...unselectedVendorRowsMapped.filter(
            (item) => !selectedVendorRowsMapped.some((sel) => sel.id === item.id),
          ),
        ].filter((item) => item.id && item.name && item.email && item.vendorCode);

        console.log(mergedVendorOptions, "merged vendors")

        setVendorOptions(mergedVendorOptions);
      } catch (err) {
        console.error("Failed to load vendors", err);
        setVendorOptions([]);
        setSelectedVendorIds([]);
      }
    };

    void loadVendors();
  }, [iddid]);



  useEffect(() => {
    if (undisposedOptions.length === 0 || savedUndisposedIds.length === 0) return;

    const matchedIds = undisposedOptions
      .map((item) => String(item.id).trim())
      .filter((id) => savedUndisposedIds.map((x) => String(x).trim()).includes(id));

    setSelectedUndisposedIds(matchedIds);
    setAlreadySelectedUndisposedIds(matchedIds);
  }, [undisposedOptions, savedUndisposedIds]);


  const displayVendorOptions = vendorOptions.filter((v) => v.name);

  const selectedUndisposedItems = undisposedOptions.filter((item) =>
    selectedUndisposedIds.includes(item.id),
  );

  const sortedUndisposedOptions = useMemo(() => {
    return [...undisposedOptions].sort((a, b) => {
      const aChecked = selectedUndisposedIds.includes(a.id) ? 1 : 0;
      const bChecked = selectedUndisposedIds.includes(b.id) ? 1 : 0;
      return bChecked - aChecked;
    });
  }, [undisposedOptions, selectedUndisposedIds]);

  const totalSelectedQty = selectedUndisposedItems.reduce(
    (sum, item) => sum + (item.qty || 0),
    0,
  );


  // async function CancelDisposal() {
  //   const res = await fetch("/api/SetData/CancelDisposal", {
  //     method: "POST",
  //     body: JSON.stringify({ "IDDID": iddid })
  //   })
  //   const data = await res.json()
  //   redirect("./")
  // }

  const [submitClicked, setSubmitClicked] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitClicked(true)

    if (
      !wasteCategory ||
      !selectedWasteId
    ) {
      alert("Please fill all required fields and select at least one waste item and vendor.");
      setSubmitClicked(false)
      return;
    }

    try {
      // const res = await fetch("/api/SetData/UpdateDisposal", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     WCID: wasteCategory,
      //     WID: selectedWasteId,
      //     TotalQty: totalSelectedQty,
      //     MUID: undisposedOptions[0].muid,
      //     Auctionable: 1,
      //     AuctionDate: auctionDate,
      //     PSID: physicalForm,
      //     Remarks: remarks,
      //     IDDID: iddid,
      //   }),
      // });

      // const data = await res.json();

      // if (!res.ok || !data.success) {
      //   alert(data.message || "Save Failed");
      //   redirect("./")
      //   return;
      // }

      // const newSelectedIds = undisposedOptions
      //   .map((item) => String(item.id))
      //   .filter((id) => selectedUndisposedIds.map(String).includes(id))
      //   .filter((id) => !alreadySelectedUndisposedIds.map(String).includes(id));

      // if (newSelectedIds.length > 0) {
      //   const res2 = await fetch("/api/SetData/InsertAuctionWasteDetails", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       IDDID: iddid,
      //       WRID: newSelectedIds,
      //     }),
      //   });

      //   const data2 = await res2.json();

      //   if (!res2.ok || !data2.success) {
      //     alert(data2.message || "InsertAuctionWasteDetails failed");
      //     return;
      //   }
      // }


      const newVendorIds = selectedVendorIds.filter(
        (id) => !alreadySelectedVendorIds.includes(id)
      );

      if (newVendorIds.length > 0) {
        await Promise.all(
          newVendorIds.map(async (vendorId) => {
            const vendorRes = await fetch("/api/SetData/InsertAuctionVendorDetails", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                IDDID: iddid,
                VID: vendorId,
              }),
            });

            const vendorData = await vendorRes.json();

            if (!vendorRes.ok || !vendorData.success) {
              throw new Error(vendorData.message || `Failed to insert vendor ${vendorId}`);
            }

            return vendorData;
          }),
        );
      }

      alert("Saved Successfully");
      router.back()
      setSubmitClicked(false)
    } catch (error) {
      console.error("Submit Failed", error);
      alert("Something went wrong while saving");
    }
  };

  return (
    <section className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="relative">
        <h1 className="text-lg font-semibold text-teal-600 text-center">Auctionable Disposal</h1>

        <Link href="./">
          <img src="/goback.png" alt="" className="h-5 absolute top-0 right-15" />
        </Link>

        <img src="/refresh.png" alt="" className="h-4.5 ms-3 cursor-pointer  absolute top-0.5 right-5"
          onClick={() => window.location.reload()}
        />
      </div>
      <form onSubmit={onSubmit} className="mt-6 text-sm">
        <div className=" ">
          <div className=" grid grid-cols-2">

            <div className="px-4 py-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Disposal ID</label>
              <input
                // type="date"
                value={iddid}
                // onChange={(e) => setDisposalDate(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2"
                disabled
              />
            </div>

            {/* <div className="px-4 py-1">
          <label className="mb-1 block text-xs font-semibold text-slate-700">Auction Date</label>
          <input
            type="date"
            value={auctionDate}
            onChange={(e) => setAuctionDate(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div> */}

            <div className="px-4 py-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Waste Category</label>
              <select
                value={wasteCategory}
                onChange={(e) => setWasteCategory(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2"
                disabled
              >
                <option value="">{loadingBase ? "Loading..." : "Select Waste Category"}</option>
                {categoryOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="px-4 py-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Waste List</label>
              <select
                value={selectedWasteId}
                onChange={(e) => {
                  setSelectedWasteId(e.target.value);
                  const name = wasteOptions.find((w) => w.id === e.target.value)?.name ?? "";
                  setWaste(name);
                }}
                className="w-full rounded border border-slate-300 px-3 py-2"
                disabled
              >
                <option value="">{loadingWaste ? "Loading..." : "Select Waste Item"}</option>
                {wasteOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>


            {/* <div className="grid grid-cols-2 "> */}
            {/* <div className="relative px-4 py-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Undisposed Waste (Dept - Quantity - Days Left)
              </label>
              <button
                type="button"
                onClick={() => setUndisposedDropdownOpen((prev) => !prev)}
                disabled
                className="text-sm w-full rounded border border-slate-300 px-3 py-2 text-left "
              >
                {selectedUndisposedItems.length > 0
                  ? selectedUndisposedItems.map((x) => x.label).join(", ")
                  : loadingUndisposed
                    ? "Loading..."
                    : "Select Dept - Quantity - Days left"}
              </button>

              {undisposedDropdownOpen && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-300 bg-white p-2 shadow">
                  {sortedUndisposedOptions.length === 0 ? (
                    <p className="px-2 py-1 text-xs text-slate-500">No undisposed waste</p>
                  ) : (
                    sortedUndisposedOptions.map((item) => {
                      const checked = selectedUndisposedIds.includes(item.id);
                      const alreadyChecked = alreadySelectedUndisposedIds.includes(item.id);



                      return (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 rounded px-2 py-1 hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={alreadyChecked}
                            onChange={(e) => {
                              const nextIds = e.target.checked
                                ? [...selectedUndisposedIds, item.id]
                                : selectedUndisposedIds.filter((id) => id !== item.id);
                              setSelectedUndisposedIds(nextIds);
                            }}
                          />

                          <div className="flex flex-col">
                            <span className="text-xs text-slate-700">
                              {item.dept || "Dept"} - {item.qty.toFixed(2)} {item.unit}
                            </span>
                            <span className="text-xs font-semibold text-red-600">
                              {item.daysLeft ? `${item.daysLeft} days left` : "N/A"}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            </div> */}

            <div className="px-4 py-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Total Quantity</label>

              <div
                className="w-full rounded border border-slate-300 px-3 py-2 text-xs"
              >
                {Number.isFinite(totalSelectedQty) ? totalSelectedQty.toFixed(2) : "0.00"}{" "}{sortedUndisposedOptions[0]?.unit}
              </div>
              {/* <input
            type="text"
            readOnly
            value={Number.isFinite(totalSelectedQty) ? totalSelectedQty.toFixed(2) : "0.00"}{" "}{sortedUndisposedOptions[0]?.unit}
            className="w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 text-xs"
          /> */}
            </div>

            <div className="px-4 py-1">
              <label className="block text-xs font-semibold text-slate-700">Physical Form</label>
              <select
                disabled
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

            <div className="px-4 py-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Initiator Remarks</label>
              <textarea
                disabled
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full text-sm rounded border border-slate-300 px-3 py-2"
                rows={1}
              />
            </div>


            {/* </div> */}

            <hr className="col-span-2 mt-4 mb-3 border border-gray-200 w-[97%] mx-auto" />

            <div className="relative">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Vendor List</label>
              <button
                type="button"
                onClick={() => setVendorDropdownOpen((prev) => !prev)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-left text-sm"
              >
                {selectedVendorIds.length > 0
                  ? displayVendorOptions
                    .filter((v) => selectedVendorIds.includes(v.id)).length > 0
                    ? displayVendorOptions
                      .filter((v) => selectedVendorIds.includes(v.id))
                      .map((v) => v.name)
                      .join(", ")
                    : "Select vendor(s)"
                  : "Select vendor(s)"}
              </button>

              {vendorDropdownOpen && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-300 bg-white p-2 shadow">
                  {displayVendorOptions.length === 0 ? (
                    <p className="px-2 py-1 text-sm text-slate-500">No vendors found</p>
                  ) : (
                    displayVendorOptions.map((item) => {
                      // console.log(item, "item")
                      const checked = selectedVendorIds.includes(item.id);
                      const alreadyChecked = alreadySelectedVendorIds.includes(item.id);
                      return (
                        <label
                          key={item.id}
                          className={`flex items-center gap-2 rounded px-2 py-1 hover:bg-slate-50 ${alreadyChecked ? "cursor-not-allowed opacity-60" : ""
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={alreadyChecked}
                            onChange={(e) => {
                              const nextIds = e.target.checked
                                ? [...selectedVendorIds, item.id]
                                : selectedVendorIds.filter((id) => id !== item.id);
                              // console.log(nextIds)
                              setSelectedVendorIds(nextIds);
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
                    })
                  )}
                </div>
              )}
            </div>

          </div>


        </div>

        {
          !submitClicked &&
          <button
            type="submit"
            className="cursor-pointer rounded block place-self-center text-sm bg-emerald-700 px-3 py-2 text-white hover:bg-emerald-800"
          >
            Submit
          </button>
        }
        {
          submitClicked &&
          <div
            className="cursor-pointer rounded w-fit block place-self-center text-sm bg-emerald-700 px-3 py-2 text-white hover:bg-emerald-800"
          >
            Submitting ...
          </div>
        }
      </form>

      <hr className="col-span-2 mt-4 mb-1 border border-gray-100 w-[97%] mx-auto" />

      {/* <div className="text-sm text-slate-700 mt-8">
        Do you want to cancel this disposal and revert the status of the included waste items?
        <span
          className="ms-5 place-self-center cursor-pointer rounded bg-rose-700 px-3 py-2 text-md text-white hover:bg-red-800"
          onClick={CancelDisposal}
        >
          Yes, Cancel Disposal
        </span>
      </div> */}
    </section >
  );
}