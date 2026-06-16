"use client";

import decrypt from "@/components/Decrypt";
import React, { use, useEffect, useMemo, useState } from "react";
import { redirect } from 'next/navigation';
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function WasteApproval({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const params = React.use(searchParams);

    const router = useRouter()

    function normalizeData<T extends Record<string, any>>(row: T) {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => {
                if (value === null || value === undefined) {
                    return [key, "NA"];
                }

                if (typeof value === "object") {
                    // return [key, JSON.stringify(value)];
                    return [key, "NA"];
                }

                return [key, value];
            })
        );
    }

    type WasteData = {
        ID: string
        UID: string
        Unit: string
        DeptID: string
        Dept: string
        WasteCategory: string
        // WasteType: string
        Waste: string
        StorageMethod: string
        PhysicalState: string
        Disposer: string
        Receiver: string
        WasteQty: string
        GenerationDate: string
        TargetDate: string
        AprvType: string
        AprvStage: string
        AprvStageDesc: string
        Approver: string
        CreatedBy: string
        Status: string
        GenDept: string
        GenDeptID: string
        WCID: string
        WID: string
        // WTID: string
        PSID: string
        DID: string
        SMID: string
        AID: string
        MUnit: string
        MUID: string
    }

    type ApprovalRejectionHistory = {
        ID: string
        AprvType: string
        Remarks: string
        AprvStage: string
        AprvStageDesc: string
        LastApprvRejBy: string
        CreatedBy: string
        CreatedDate: string
        Status: string
    }

    type DropdownData = {
        ID: string
        NAME: string
    }

    type ReceiverDropdown = {
        AID: string
        Receiver: string
    }

    const [wasteData, setWasteData] = useState<WasteData>()

    const [approvalRejectionHistory, setApprovalRejectionHistory] = useState<ApprovalRejectionHistory[]>([])

    const [wasteCategory, setWasteCategory] = useState<DropdownData[]>([])
    const [waste, setWaste] = useState<DropdownData[]>([])
    const [physicalState, setPhysicalState] = useState<DropdownData[]>([])
    const [storageMethod, setStorageMethod] = useState<DropdownData[]>([])
    const [receiver, setReceiver] = useState<ReceiverDropdown[]>([])
    const [disposer, setDisposer] = useState<DropdownData[]>([])

    const [submitClicked, setSubmitClicked] = useState(false)


    async function fetchDetails() {

        const encoded = params.id;
        const id = await decrypt(encoded!)

        const res = await fetch("/api/GetData/GetWasteDetails", {
            method: "POST",
            body: JSON.stringify({ "ID": id })
        })

        const rawData = await res.json()
        const data = rawData.map(normalizeData)
        setWasteData(data[0])

        // console.log(rawData)
        // console.log(data[0])

    }

    async function fetchHistory() {

        const encoded = params.id;
        const id = await decrypt(encoded!)

        const res = await fetch("/api/GetData/GetApprovalRejectionHistory", {
            method: "POST",
            body: JSON.stringify({ "ID": id })
        })

        const rawData = await res.json()
        const data = rawData.map(normalizeData)

        setApprovalRejectionHistory(data)

        // console.log(rawData)
        // console.log(data[0])

    }



    async function fetchWasteCategoryDropdown() {
        const res = await fetch("/api/GetData/GetWasteCategoryDropdown", {
            method: "POST",
        })

        const rawData = await res.json()
        const data = rawData.map(normalizeData)
        setWasteCategory(data)
    }

    async function fetchWasteDropdown() {
        const res = await fetch("/api/GetData/GetWasteDropdown", {
            method: "POST",
            body: JSON.stringify({
                "WCID": wasteData?.WCID
            })
        })
        const rawData = await res.json()
        const data = rawData.map(normalizeData)
        setWaste(data)
    }

    async function fetchPhysicalStateDropdown() {
        const res = await fetch("/api/GetData/GetPhysicalStateDropdown", {
            method: "POST",
        })

        const rawData = await res.json()
        const data = rawData.map(normalizeData)
        setPhysicalState(data)
    }

    async function fetchStorageMethodDropdown() {
        const res = await fetch("/api/GetData/GetStorageMethodDropdown", {
            method: "POST",
        })

        const rawData = await res.json()
        const data = rawData.map(normalizeData)
        setStorageMethod(data)
    }

    async function fetchReceiverDropdown() {
        const res = await fetch("/api/GetData/GetReceiverDropdown", {
            method: "POST",
            body: JSON.stringify({ "WID": wasteData?.WID, "UID": wasteData?.UID })
        })

        const rawData = await res.json()
        const data = rawData.map(normalizeData)
        // console.log(data)
        setReceiver(data)
    }




    async function fetchDisposerDropdown() {
        const res = await fetch("/api/GetData/GetDisposerDropdown", {
            method: "POST",
            body: JSON.stringify({ "WCID": wasteData?.WCID, "WID": wasteData?.WID, "UID": wasteData?.UID })
        })

        const rawData = await res.json()
        const data = rawData.map(normalizeData)
        const matchedDisposers = data.filter(
            (item: any) => item.ID == '20' || item.ID == wasteData?.GenDeptID
        );
        // console.log(data, "data")
        // console.log(data, "data")
        // console.log(wasteData, "wastedata")
        // console.log(matchedDisposers)
        setDisposer(matchedDisposers)
    }

    useEffect(() => {
        fetchReceiverDropdown()
        fetchDisposerDropdown()
    }, [wasteData])


    useEffect(() => {
        fetchDetails()
        fetchHistory()
        fetchWasteCategoryDropdown()
        fetchStorageMethodDropdown()
        fetchPhysicalStateDropdown()
    }, [])

    useEffect(() => {
        fetchWasteDropdown()
    }, [wasteData?.WCID])


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitClicked(true)

        const res = await fetch("/api/SetData/UpdateWaste", {
            method: "POST",
            body: JSON.stringify({
                "WRID": wasteData?.ID,
                "WCID": wasteData?.WCID,
                "WID": wasteData?.WID,
                // "WTID": wasteData?.WTID,
                "PSID": wasteData?.PSID,
                "DID": wasteData?.DID,
                "SMID": wasteData?.SMID,
                "StorageMethod": wasteData?.StorageMethod,
                "AID": wasteData?.AID,
                "WasteQty": wasteData?.WasteQty,
                "MUnit": wasteData?.MUnit,
                "TargetDate": wasteData?.TargetDate,
            })
        })

        const data = await res.json()
        // console.log(data)



        if (data.STATUS == 'Updated Successfully !') {
            toast.success("Updated Successfully !")
            redirect("./")
            return
        }

        else {
            toast.success("Some error occured !")
            // redirect("./")
            return
        }
        setSubmitClicked(false)

    }

    return (

        <div className="bg-white h-fit px-8 py-4 relative">
            <Toaster />
            {/* <div className="text-center text-sm">Act on Waste</div> */}

            <div>
                <div className="text-center font-semibold text-teal-600 mb-5">
                    Waste Details
                </div>
                <div>
                    <img src="/refresh.png" alt="" className="absolute top-4 right-15 h-4.5 me-3 cursor-pointer"
                        onClick={() => window.location.reload()}
                    />
                    <img src="/goback.png" alt="" className="h-4.5 absolute top-4 right-10 cursor-pointer"
                        onClick={() => router.back()}
                    />

                </div>
            </div>

            <form onSubmit={handleSubmit} action="">
                <div className="grid grid-cols-2 text-sm">
                    <div className="px-2 py-2 font-semibold text-xs">ID : <span className="font-normal text-sm"> {wasteData?.ID}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Generating Unit : <span className="font-normal text-sm"> {wasteData?.Unit}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Generating Department : <span className="font-normal text-sm"> {wasteData?.GenDept}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Generated By : <span className="font-normal text-sm"> {wasteData?.CreatedBy}</span></div>
                    {/* <div className="px-2 py-2 font-semibold text-xs">Waste Type : <span className="font-normal text-sm"> {wasteData?.WasteType}</span></div> */}
                    <div className="px-2 py-2 font-semibold text-xs">Generation Date : <span className="font-normal text-sm"> {wasteData?.GenerationDate}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Targetted Disposal Date : <span className="font-normal text-sm"> {wasteData?.TargetDate}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Status : <span className="font-normal text-sm"> {wasteData?.Status}</span></div>

                    {/* <div className="px-2 py-2 font-semibold text-xs">Waste : <span className="font-normal text-sm"> {wasteData?.Waste}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Waste Category : <span className="font-normal text-sm"> {wasteData?.WasteCategory}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Storage Method : <span className="font-normal text-sm"> {wasteData?.StorageMethod}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Physical State : <span className="font-normal text-sm"> {wasteData?.PhysicalState}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Waste Disposer : <span className="font-normal text-sm"> {wasteData?.Disposer}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Waste Receiver : <span className="font-normal text-sm"> {wasteData?.Receiver}</span></div> */}



                    <div className="px-2 py-2 font-semibold text-xs">
                        <label htmlFor="">Waste Category</label>
                        <select name="" id=""
                            required
                            value={wasteData?.WCID}
                            onChange={(e) => {
                                setWasteData(prev => {
                                    if (!prev) return prev;
                                    return {
                                        ...prev,
                                        WCID: e.target.value
                                    };
                                });
                            }}
                            className="font-normal border border-gray-200 cursor-pointer p-2 mt-1 rounded-lg w-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-400">

                            <option value="">Select Waste Category</option>
                            {wasteCategory.map((item, i) => (
                                <option value={item.ID}>{item.NAME}</option>
                            ))}
                        </select>

                    </div>


                    <div className="px-2 py-2 font-semibold text-xs">
                        <label htmlFor="">Waste</label>
                        <select name="" id=""
                            required
                            value={wasteData?.WID}
                            onChange={(e) => {
                                setWasteData(prev => {
                                    if (!prev) return prev;
                                    return {
                                        ...prev,
                                        WID: e.target.value
                                    };
                                });
                            }}
                            className="font-normal border border-gray-200 cursor-pointer p-2 mt-1 rounded-lg w-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-400">

                            <option value="">Select Waste</option>
                            {waste.map((item, i) => (
                                <option value={item.ID}>{item.NAME}</option>
                            ))}
                        </select>

                    </div>



                    <div className="px-2 py-2 font-semibold text-xs">
                        <label htmlFor="">Physical State</label>
                        <select name="" id=""
                            required
                            value={wasteData?.PSID}
                            onChange={(e) => {
                                setWasteData(prev => {
                                    if (!prev) return prev;
                                    return {
                                        ...prev,
                                        PSID: e.target.value
                                    };
                                });
                            }}
                            className="font-normal border border-gray-200 cursor-pointer p-2 mt-1 rounded-lg w-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-400">

                            <option value="">Select Physical State</option>
                            {physicalState.map((item, i) => (
                                <option value={item.ID}>{item.NAME}</option>
                            ))}
                        </select>

                    </div>


                    <div className="px-2 py-2 font-semibold text-xs">
                        <label htmlFor="">Storage Method</label>
                        <select name="" id=""
                            required
                            value={wasteData?.SMID}
                            onChange={(e) => {

                                const smethod = storageMethod.find(el => el.ID == e.target.value)?.NAME
                                // console.log(smethod)
                                setWasteData(prev => {
                                    if (!prev) return prev;
                                    return {
                                        ...prev,
                                        SMID: e.target.value,
                                        StorageMethod: smethod!
                                    };
                                });
                            }}
                            className="font-normal border border-gray-200 cursor-pointer p-2 mt-1 rounded-lg w-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-400">

                            <option value="">Select Storage Method</option>
                            {storageMethod.map((item, i) => (
                                <option value={item.ID}>{item.NAME}</option>
                            ))}
                        </select>

                    </div>

                    {
                        wasteData?.SMID == '4' &&
                        <div className="px-2 py-2 font-semibold text-xs">
                            <label htmlFor="">Other Storage Method</label>
                            <input type="text" name="" id=""
                                required
                                value={wasteData.StorageMethod == "Others" ? "" : wasteData.StorageMethod}
                                onChange={(e) => {
                                    setWasteData(prev => {
                                        if (!prev) return prev;
                                        return {
                                            ...prev,
                                            StorageMethod: e.target.value
                                        };
                                    });
                                }}
                                placeholder="Enter Storage Method"
                                className="font-normal border border-gray-200 cursor-pointer p-2 mt-1 rounded-lg w-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />
                        </div>
                    }


                    <div className="px-2 py-2 font-semibold text-xs">
                        <label htmlFor="">Disposer</label>
                        <select name="" id=""
                            required
                            value={wasteData?.DID}
                            onChange={(e) => {
                                setWasteData(prev => {
                                    if (!prev) return prev;
                                    return {
                                        ...prev,
                                        DID: e.target.value
                                    };
                                });
                            }}
                            className="font-normal border border-gray-200 cursor-pointer p-2 mt-1 rounded-lg w-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-400">

                            <option value="">Select Disposer</option>
                            {disposer.map((item, i) => (
                                <option value={item.ID}>{item.NAME}</option>
                            ))}
                        </select>

                    </div>



                    <div className="px-2 py-2 font-semibold text-xs">
                        <label htmlFor="">Receiver</label>
                        <select name="" id=""
                            required
                            value={wasteData?.AID}
                            onChange={(e) => {
                                setWasteData(prev => {
                                    if (!prev) return prev;
                                    return {
                                        ...prev,
                                        AID: e.target.value
                                    };
                                });
                            }}
                            className="font-normal border border-gray-200 cursor-pointer p-2 mt-1 rounded-lg w-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-400">

                            <option value="">Select Receiver</option>
                            {receiver.map((item, i) => (
                                <option value={item.AID}>{item.Receiver}</option>
                            ))}
                        </select>

                    </div>


                    <div className="px-2 py-2 font-semibold text-xs">
                        <label htmlFor="">WasteQty :</label>
                        <input
                            required
                            type="text"
                            value={wasteData?.WasteQty}
                            onChange={(e) => {
                                setWasteData(prev => {
                                    if (!prev) return prev;
                                    return {
                                        ...prev,
                                        WasteQty: e.target.value
                                    };
                                });
                            }}
                            className="font-normal border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>

                    <div className="px-2 py-2 font-semibold text-xs">
                        <label htmlFor="">Measurement Unit : </label>
                        <span
                            className="font-normal p-0 mt-1 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                            {wasteData?.MUnit}
                        </span>
                    </div>
                    {/* <div className="px-2 py-2 font-semibold text-xs">Approver : <span className="font-normal text-sm"> {wasteData?.Approver}</span></div> */}
                </div>

                <hr className="border border-gray-200 my-4" />

                {approvalRejectionHistory.length > 0 &&
                    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                        <div className="py-1 text-center text-sm">Action History</div>
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr >
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                    >Action ID</th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                    >Rejected By</th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                    >Remarks</th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                    >Rejection Date & Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {approvalRejectionHistory?.map((row, index) => (
                                    <tr key={index}>
                                        <td
                                            className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                        >{row.ID}
                                        </td>
                                        <td
                                            className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                        >{row.CreatedBy}
                                        </td>
                                        <td
                                            className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                        >{row.Remarks}
                                        </td>
                                        <td
                                            className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                        >{row.CreatedDate?.split("T")[0]} {row.CreatedDate?.split("T")[1]?.split(".")[0]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }


                <hr className="border border-gray-200 my-4" />

                {
                    !submitClicked && <button
                        type="submit"
                        className="text-sm cursor-pointer px-4 py-1.5 rounded-md bg-green-700 text-white hover:bg-green-800"
                    >
                        Submit
                    </button>
                }
                {
                    submitClicked && <div
                        className="text-sm cursor-pointer px-4 py-1.5 w-fit rounded-md bg-green-700 text-white hover:bg-green-800"
                    >
                        Submitting
                    </div>
                }
            </form>
        </div>
    );
}
