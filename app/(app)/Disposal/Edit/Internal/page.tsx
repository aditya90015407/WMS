"use client";

import React, { useEffect, useMemo, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import decrypt from "@/components/Decrypt";
import encrypt from "@/components/Encrypt";

type Option = { id: string; name: string };
type Option1 = { ID: string; NAME: string };

type UndisposedOption = {
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
};

export default function InternalPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const router = useRouter();

  const params = React.use(searchParams);
  // const iddid = params.id;

  const encryptedIddid = params.id;

  const [iddid, setIddid] = useState("")


  async function decryptId() {
    // const id1 = await encrypt("124") ; const id2 = await encrypt("100") ; const id3 = await encrypt("1")
    // console.log(id1) ; console.log(id2) ;console.log(id3)

    const decryptedId = await decrypt(encryptedIddid!)

    setIddid(decryptedId)
  }

  useEffect(() => {
    if (!encryptedIddid) return
    decryptId()
  }, [encryptedIddid])

  const [disposalDate, setDisposalDate] = useState("");
  const [wasteCategory, setWasteCategory] = useState("");
  const [selectedWasteId, setSelectedWasteId] = useState("");
  const [waste, setWaste] = useState("");
  const [physicalForm, setPhysicalForm] = useState("");
  const [remarks, setRemarks] = useState("");

  const [physicalOptions, setPhysicalOptions] = useState<Option1[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [wasteOptions, setWasteOptions] = useState<Option[]>([]);

  const [undisposedOptions, setUndisposedOptions] = useState<UndisposedOption[]>([]);
  const [selectedUndisposedIds, setSelectedUndisposedIds] = useState<string[]>([]);
  const [alreadySelectedUndisposedIds, setAlreadySelectedUndisposedIds] = useState<string[]>([]);
  const [savedUndisposedIds, setSavedUndisposedIds] = useState<string[]>([]);

  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingWaste, setLoadingWaste] = useState(false);
  const [loadingUndisposed, setLoadingUndisposed] = useState(false);
  const [undisposedDropdownOpen, setUndisposedDropdownOpen] = useState(false);


  const [refreshSeed, setRefreshSeed] = useState(0);

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

  const { data: session } = useSession();


  useEffect(() => {
    const loadEditDetails = async () => {
      if (!iddid) return;

      try {
        const res = await fetch("/api/GetData/GetAllInitiateDisposalDetailbyIDNI", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: iddid }),
        });

        const payload = await res.json();

        if (!res.ok || !payload.success) {
          console.error("Failed to load internal edit details", payload);
          return;
        }

        const detailRow = Array.isArray(payload.data) ? payload.data[0] : payload.data;
        if (!detailRow) return;

        // setDisposalDate(String(detailRow.AuctionDate ?? detailRow.DisposalDate ?? "").split("T")[0]);
        setWasteCategory(String(detailRow.WCID ?? ""));
        setSelectedWasteId(String(detailRow.WID ?? ""));
        setPhysicalForm(String(detailRow.PSID ?? ""));
        // setRemarks(String(detailRow.Remarks ?? ""));
      } catch (error) {
        console.error("loadEditDetails failed", error);
      }
    };

    void loadEditDetails();
  }, [refreshSeed, iddid]);

  useEffect(() => {
    const loadWaste = async () => {
      if (!wasteCategory) {
        setWasteOptions([]);
        setSelectedWasteId("");
        setWaste("");
        return;
      }

      const sessionUid = String(session?.user?.uid ?? "").trim();
      if (!sessionUid) return;
      setLoadingWaste(true);

      try {
        const res = await fetch(
          `/api/auth/Waste/generate?type=drop-waste-for-unit&wcid=${encodeURIComponent(wasteCategory)}&uid=${encodeURIComponent(sessionUid!)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );
        const payload = (await res.json()) as { success?: boolean; data?: Option[] };
        const data = payload.success && Array.isArray(payload.data) ? payload.data : [];
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
          const todayDate = new Date().toISOString().split("T")[0];

          const targetDate = String(row.TargetDate ?? "").split("T")[0].trim();
          const muid = row.MUID
          const unit = String(row.MUnit ?? "").trim();



          let daysLeft = "";
          if (targetDate) {
            const today = new Date(todayDate);
            const target = new Date(targetDate);
            const diffTime = target.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysLeft = String(diffDays);
          }


          return {
            id: String(row.WRID ?? row.Id ?? row.ID ?? "").trim(),
            dept: String(row.DeptDesc ?? row.Dept ?? "Previously Selected").trim(),
            qty,
            genDate,
            targetDate: "",
            todayDate,
            daysLeft,
            unit,
            muid,
            label: `${String(row.DeptDesc ?? row.Dept ?? "Previously Selected").trim()} - ${qty.toFixed(2)} ${unit} - ${daysLeft ?? "N/A"} days left`,
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
        const res = await fetch("/api/GetData/GetAllUndisposedWasteByDept", {
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
          const dept = String(row.Dept ?? row.DeptDesc ?? "").trim();
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
            label: `${dept || "Dept"} - ${qtyLabel} ${unit} - ${daysLeft} days left`,
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
        setAlreadySelectedUndisposedIds([])
      } finally {
        setLoadingUndisposed(false);
      }
    };

    void loadUndisposed();
  }, [wasteCategory, selectedWasteId]);

  useEffect(() => {
    if (undisposedOptions.length === 0 || savedUndisposedIds.length === 0) return;

    const matchedIds = undisposedOptions
      .map((item) => item.id)
      .filter((id) => savedUndisposedIds.includes(id));

    setSelectedUndisposedIds(matchedIds);
    setAlreadySelectedUndisposedIds(matchedIds)
  }, [undisposedOptions, savedUndisposedIds]);

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



  async function CancelDisposal() {
    const res = await fetch("/api/SetData/CancelDisposal", {
      method: "POST",
      body: JSON.stringify({ "IDDID": iddid })
    })
    const data = await res.json()
    redirect("./")
  }

  const [submitClicked, setSubmitClicked] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitClicked(true)

    // if (!disposalDate) {
    //   alert("Please select the Date");
    //   setSubmitClicked(false)
    //   return;
    // }

    if (!wasteCategory || !selectedWasteId) {
      alert("Please select waste category and waste item.");
      setSubmitClicked(false)
      return;
    }

    if (selectedUndisposedIds.length === 0) {
      alert("Please select at least one undisposed waste item.");
      setSubmitClicked(false)
      return;
    }

    try {
      const res = await fetch("/api/SetData/UpdateDisposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          WCID: wasteCategory,
          WID: selectedWasteId,
          TotalQty: totalSelectedQty,
          MUID: undisposedOptions[0].muid,
          Auctionable: 3,
          PSID: physicalForm,
          AuctionDate: disposalDate,
          // Remarks: remarks,
          IDDID: iddid
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Save Failed");
        redirect("./")
      }

      // const wrid = data?.data?.WRID;
      // if (!wrid) {
      //   alert("WRID missing from InitiateDisposal response");
      //   return;
      // }
      const newSelectedIds = undisposedOptions
        .map((item) => item.id)
        .filter((id) => selectedUndisposedIds.includes(id))
        .filter((id) => !alreadySelectedUndisposedIds.includes(id))


      // console.log(alreadySelectedUndisposedIds, "already")
      // console.log(selectedUndisposedIds, "saved")
      // console.log(newSelectedIds, "new ")
      // console.log(undisposedOptions, "undisposed")

      if (newSelectedIds.length > 0) {
        const res2 = await fetch("/api/SetData/InsertAuctionWasteDetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            IDDID: iddid,
            WRID: newSelectedIds,
          }),
        });

        const data2 = await res2.json();
        if (!res2.ok || !data2.success) {
          setSubmitClicked(false)
          router.back()
          return alert(data2.message || "InsertAuctionWasteDetails failed");
        }

      }

      alert("Saved Successfully");
      router.back();
      setSubmitClicked(false)
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <section className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="relative">
        <h1 className="text-lg font-semibold text-teal-600 text-center">Internal Disposal</h1>

        <Link href="./">
          <img src="/goback.png" alt="" className="h-5 absolute top-0 right-15" />
        </Link>

        <img src="/refresh.png" alt="" className="h-4.5 ms-3 cursor-pointer  absolute top-0.5 right-5"
          onClick={() => setRefreshSeed((x) => x + 1)}
        />
      </div>

      <form onSubmit={onSubmit} className="mt-6  text-sm">

        <div className="">

          <div className="grid grid-cols-2">

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

            <div className="px-4 py-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Waste Category</label>
              <select
                value={wasteCategory}
                onChange={(e) => setWasteCategory(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2"
                disabled  //={loadingBase}
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
                disabled  //={!wasteCategory || loadingWaste}
              >
                <option value="">{loadingWaste ? "Loading..." : "Select Waste Item"}</option>
                {wasteOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>


          <hr className="col-span-2 mt-4 mb-3 border border-gray-200 w-[97%] mx-auto" />

          <div className="grid grid-cols-2">



            {/* <div className="px-4 py-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Date of Disposal</label>
              <input
                type="date"
                value={disposalDate}
                onChange={(e) => setDisposalDate(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </div> */}

            <div className="relative px-4 py-1">
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
                    : "Select Dept - Quantity - Days Left"}
              </button>

              {undisposedDropdownOpen && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-300 bg-white p-2 shadow">
                  {sortedUndisposedOptions.length === 0 ? (
                    <p className="px-2 py-1 text-sm text-slate-500">No undisposed waste</p>
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
                            <span className="text-sm text-slate-700">
                              {item.dept || "Dept"} - {item.qty.toFixed(2)}{item.unit || "N/A"}
                            </span>
                            <span className="text-sm font-semibold text-red-600">
                              {item.daysLeft ? `${item.daysLeft} days left` : "N/A"}

                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="px-4 py-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Total Quantity
              </label>
              <div
                className="w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 text-sm"
              >
                {Number.isFinite(totalSelectedQty) ? totalSelectedQty.toFixed(2) : "0.00"}{" "}{sortedUndisposedOptions[0]?.unit}
              </div>
              {/* <input
            type="text"
            readOnly
            value={totalSelectedQty.toFixed(2)}
            className="w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 text-sm"
          /> */}
            </div>

            <div className="px-4 py-1">
              <label className="block text-xs font-semibold text-slate-700">Physical Form</label>
              <select
                value={physicalForm}
                onChange={(e) => setPhysicalForm(e.target.value)}
                className="mt-1 text-sm w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select</option>
                {physicalOptions.map((opt) => (
                  <option key={opt.ID} value={opt.ID}>
                    {opt.NAME}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="px-4 py-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2"
                rows={1}
              />
            </div> */}


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

      <div className="text-sm text-slate-700 mt-8">
        Do you want to cancel this disposal and revert the status of the included waste items?
        <span
          className="ms-5 place-self-center cursor-pointer rounded bg-rose-700 px-3 py-2 text-md text-white hover:bg-red-800"
          onClick={CancelDisposal}
        >
          Yes, Cancel Disposal
        </span>
      </div>

    </section>
  );
}
