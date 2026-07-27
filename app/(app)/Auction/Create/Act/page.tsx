"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import decrypt from "@/components/Decrypt";
import { rows } from "mssql";



type Option = { id: string; name: string, email: string, vendorCode: string };
type Option1 = { ID: string; NAME: string };

export default function AuctionablePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
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

    // kept to avoid removing old element references
    const [waste, setWaste] = useState("");
    const [vendor, setVendor] = useState("");

    const [remarks, setRemarks] = useState("");
    const [loadingBase, setLoadingBase] = useState(false);
    const [loadingWaste, setLoadingWaste] = useState(false);

    const [undisposedDropdownOpen, setUndisposedDropdownOpen] = useState(false);
    const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);


    // const params = useSearchParams();
    const [id, setId] = useState("");
    const [ready, setReady] = useState(false);

    const params = React.use(searchParams);
    const encryptedId = params.id ?? "";
    useEffect(() => {
        const handleDecrypt = async () => {
            const decryptedId: string = encryptedId ? (await decrypt(encryptedId)) ?? "" : "";
            setId(decryptedId);
            setReady(true);
        };

        void handleDecrypt();
    }, [encryptedId]);


    type WasteList = {
        IDDID: string
        WRID: string
        GenerationDate: string
        WasteQty: string
        MUnit: string
        Waste: string
        Unit: string
        Dept: string
        CrDt: string
        CrBy: string
        UpBy: string
        UpDt: string
        DeptDesc: string
        TargetDate: string
        CreatedBy: string
    }
    const [wasteList, setWasteList] = useState<WasteList[]>([])

    type VendorList = {
        IDDID: string
        VID: string
        Name: string
        Email: string
        VendorCode: string
        CrDt: string
        CrBy: string
    }
    const [vendorList, setVendorList] = useState<VendorList[]>([])

    type DisposalDetails = {
        ID: string
        DisType: string
        DisposalType: string
        Waste: string
        AuctionDate: string
        WCID: string
        WasteCategory: string
        TotalQty: string
        MUnit: string
        Remarks: string
        StsCode: string
        Status: string
        PhysicalState: string
        VID: string
        VendorCode: string
        VendorName: string
        VendorEmail: string
        CrDt: string
        CrBy: string
        IsActive: string
        CreatedBy: string
    }
    const [disposalDetails, setDisposalDetails] = useState<DisposalDetails>()


    async function GetWasteList() {
        if (!id) return
        const res = await fetch("/api/GetData/GetWasteListByIDDID", {
            method: "POST",
            body: JSON.stringify({ "id": id })
        })

        const data = await res.json()
        // console.log(data.data)
        const wasteItems = data.data
        setWasteList(data.data)

    }

    async function GetVendorList() {
        if (!id) return
        const res = await fetch("/api/GetData/GetVendorListByIDDID", {
            method: "POST",
            body: JSON.stringify({ "id": id })
        })

        const data = await res.json()
        // console.log(data.data, "Vendors")
        const vendors = data.data
        setVendorList(data.data)
    }


    async function GetDisposalDetails() {
        if (!id) return
        const res = await fetch("/api/GetData/GetDisposalDetailsByID", {
            method: "POST",
            body: JSON.stringify({ "id": id })
        })

        const data = await res.json()
        // console.log(data)
        // const vendors = data.data
        setDisposalDetails(data)
    }

    useEffect(() => {
        GetWasteList()
        GetVendorList()
        GetDisposalDetails()
    }, [id])




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
                    `/api/auth/Waste/generate?type=drop-waste&wcid=${encodeURIComponent(wasteCategory)}`,
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
                // console.log(payload);
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

    const [submitClicked, setSubmitClicked] = useState(false)

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitClicked(true)

        if (!ready) return

        if (
            !auctionDate ||
            selectedVendorIds.length === 0
        ) {
            alert("Please fill all required fields and select at least one vendor.");
            setSubmitClicked(false)
            return;
        }

        try {
            const res = await fetch("/api/SetData/UpdateAuction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    IDDID: id,
                    AuctionDate: auctionDate
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                alert(data.message || "Save Failed");
                setSubmitClicked(false)
                return;
            }

            const iddid = id
            if (!iddid) {
                alert("IDDID missing in InitiateDisposal response");
                setSubmitClicked(false)
                return;
            }

            for (const VendorId of selectedVendorIds) {
                const vendorRes = await fetch("/api/SetData/InsertAuctionVendorDetails", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        IDDID: iddid,
                        VID: VendorId,
                    }),
                });

                const vendorData = await vendorRes.json();
                // console.log("InsertAuctionVendorDetails response:", vendorData);

                if (!vendorRes.ok || !vendorData.success) {
                    throw new Error(vendorData.message || `Failed to insert vendor ${VendorId}`);
                }

                const resEmail = await fetch("/api/SendMail/Auction/Create", {
                    method: "POST",
                    body: JSON.stringify({
                        IDDID: iddid,
                        VID: VendorId,
                        AuctionDate: auctionDate,
                        Waste: disposalDetails?.Waste,
                        TotalQty: disposalDetails?.TotalQty,
                        MUnit: disposalDetails?.MUnit,
                    })
                })
                // const data = await resEmail.json()

                // console.log(data)

            }


            // console.log("Vendor insert results:", vendorInsertResults);
            alert(data.message || "Saved Successfully");

            router.back()
            setSubmitClicked(false)
        } catch (error) {
            console.error("Submit Failed", error);
            alert("Something went wrong while saving");
        }
    };


    return (

        <div>



            <section className="rounded-2xl mb-6 border border-slate-200 bg-white p-6 pt-2 shadow-sm">
                <div className="relative">
                    <h1 className="text-lg font-semibold text-teal-600 text-center">Create Auction </h1>


                    <img src="/goback.png" alt="" className="cursor-pointer h-5  absolute top-0 right-5"
                        onClick={() => router.back()} />

                    <img src="/refresh.png" alt="" className="h-4.5 cursor-pointer absolute top-0.5 right-15"
                        onClick={() => window.location.reload()}
                    />
                </div>

                <div className="border border-gray-200 rounded-xl px-5 py-2 mt-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ">
                        <div className="w-full ">
                            <h1 className="text-sm font-semibold text-cyan-600 text-center">
                                Disposal Details
                            </h1>
                        </div>

                        {/* <img src="/goback.png" onClick={() => router.back()} alt="" className="relative cursor-pointer h-5 absolute top-0 right-10" /> */}
                    </div>


                    <div className="mt-2.5 grid gap-3 md:grid-cols-2 text-sm ">
                        <div className=""> <span className="text-xs mr-1 font-semibold ">Disposal ID  : </span> {disposalDetails?.ID}</div>
                        <div className=""><span className="text-xs mr-1 font-semibold ">Waste Category : </span> {disposalDetails?.WasteCategory}</div >
                        < div className="" > <span className="text-xs mr-1 font-semibold ">Waste : </span > {disposalDetails?.Waste}</div >
                        {/* <div className=""><span className="text-xs mr-1 font-semibold ">Disposal Type : </span> {disposalDetails?.DisType}</div> */}
                        {/* {disposalDetails?.DisposalType == '1' && <div className=""><span className="text-xs mr-1 font-semibold ">Auction Date : </span> {disposalDetails?.AuctionDate}</div>} */}
                        {/* {disposalDetails?.DisposalType == '1' && <div className=""><span className="text-xs mr-1 font-semibold ">Selected Vendor: </span> {disposalDetails?.VendorName} ({disposalDetails.VendorCode})</div >} */}
                        <div className=""><span className="text-xs mr-1 font-semibold ">Physical State : </span> {disposalDetails?.PhysicalState}</div >
                        {/* <div className=""><span className="text-xs mr-1 font-semibold ">Approval Status : </span> {disposalDetails?.Status}</div > */}
                        <div className=""><span className="text-xs mr-1 font-semibold ">Initiator Remarks : </span> {disposalDetails?.Remarks}</div >
                        <div className=""><span className="text-xs mr-1 font-semibold ">Total Quantity : </span> {disposalDetails?.TotalQty}{" "}{disposalDetails?.MUnit}</div >
                        {/* <div className="">ID : </span> {disposalDetails?.WCID}</div> */}
                        {/* <div className=""><span className="text-xs mr-1 font-semibold ">Created By : </span> {disposalDetails?.CreatedBy}{" "} ( {disposalDetails?.CrBy})</div > */}
                        <div className=""><span className="text-xs mr-1 font-semibold ">Created On : </span> {disposalDetails?.CrDt?.split("T")[0]}</div >
                    </div >
                </div>
                {/* <div className="mt-6">
                    <p className="text-sm font-semibold text-cyan-700  my-2">Selected Wastes List</p>
                    {wasteList.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white max-h-70 max-w-4xl">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-emerald-600">
                                    <tr>
                                        <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                            ID
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                            Waste
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                            Waste Qty
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                            Generation Date
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                            Target Date
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                            Gen Unit
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                            Gen Dept
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                            Generated By
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {wasteList.map((w, i) => (
                                        <tr key={String(i)}>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                                {w.WRID}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                                {w.Waste}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                                {w.WasteQty} {w.MUnit}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                                {w.GenerationDate.split("T")[0]}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                                {w.TargetDate.split("T")[0]}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                                {w.Unit}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                                {w.Dept}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                                {w.CreatedBy}( {w.CrBy})
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <span className="text-slate-500">N/A</span>
                    )}
                </div> */}



                {/* <h1 className="text-2xl font-semibold text-teal-600 text-center">Auctionable Disposal</h1> */}

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div className=" grid grid-cols-3">
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
                                className="w-[90%] rounded border border-slate-300 px-3 py-2"
                            />
                        </div>

                        {/* <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Waste Category</label>
                        <select
                            value={wasteCategory}
                            onChange={(e) => {
                                setWasteCategory(e.target.value);
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

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Waste List</label>
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
                                    : "Select Dept - Quantity - Days left"}
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

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">
                            Total Quantity
                        </label>
                        <div
                            className="w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 text-sm"
                        >
                            {Number.isFinite(totalSelectedQty) ? totalSelectedQty.toFixed(2) : "0.00"}{" "}{undisposedOptions[0]?.unit}
                        </div>
                        <input
                            type="text"
                            readOnly
                            value={Number.isFinite(totalSelectedQty) ? totalSelectedQty.toFixed(2) : "0.00"}
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
                    </div> */}

                        <div className="relative  col-span-2">
                            <label className="mb-1 text-sm font-semibold text-slate-700">Vendor List</label>

                            <button
                                type="button"
                                onClick={() => setVendorDropdownOpen((prev) => !prev)}
                                disabled={loadingBase}
                                className="cursor-pointer w-[90%] rounded border border-slate-300 px-3 py-2 text-left disabled:cursor-not-allowed disabled:bg-slate-100"
                            >
                                {selectedVendorNames.length > 0
                                    ? selectedVendorNames.join(", ")
                                    : loadingBase
                                        ? "Loading..."
                                        : "Select Vendor(s)"}
                            </button>

                            {vendorDropdownOpen && (
                                <div className="absolute z-20 mt-1 max-h-56 w-[90%] overflow-auto rounded border border-slate-300 bg-white p-2 shadow">
                                    {displayVendorOptions.length === 0 ? (
                                        <p className="px-2 py-1 text-sm text-slate-500">No vendor options</p>
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

                            {/* {selectedVendorNames.length > 0 && (
                                <p className="mt-1 text-xs text-slate-600">
                                    Selected Vendors: {selectedVendorNames.join(", ")}
                                </p>
                            )} */}

                            {!loadingBase && displayVendorOptions.length === 0 && (
                                <p className="mt-1 text-xs text-red-600">
                                    Vendor names are empty from API response. Please fix vendor name mapping in backend.
                                </p>
                            )}
                        </div>

                        {/* <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Remarks</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-2"
                            rows={3}
                        />
                    </div> */}
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
            </section>
        </div >

    );
}