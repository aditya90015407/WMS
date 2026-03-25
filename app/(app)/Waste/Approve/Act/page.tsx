"use client";

import decrypt from "@/components/Decrypt";
import React, { useEffect, useMemo, useState } from "react";
import { redirect } from 'next/navigation';
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";


export default function WasteApproval({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const params = React.use(searchParams);

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
        WasteType: string
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

    const [wasteData, setWasteData] = useState<WasteData>()

    const [approvalRejectionHistory, setApprovalRejectionHistory] = useState<ApprovalRejectionHistory[]>([])

    const [remarks, setRemarks] = useState("")
    const [acceptance, setAcceptance] = useState("")


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


    useEffect(() => {
        fetchDetails()
        fetchHistory()
    }, [])


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        const res = await fetch("/api/SetData/SetWasteApproval", {
            method: "POST",
            body: JSON.stringify({
                "WRID": wasteData?.ID,
                "Remarks": remarks,
                "Acceptance": acceptance
            })
        })

        const data = await res.json()
        // console.log(data)

        if (data.STATUS == 'Approved Successfully !') {
            toast.success("Approved Successfully !")
            redirect("./")
            return
        }

        else {
            toast.success("Some error occured !")
            // redirect("./")
            return
        }

    }

    return (

        <div className="bg-white h-fit px-8 py-4 relative">
            <Toaster />
            {/* <div className="text-center text-sm">Act on Waste</div> */}

            <div>
                <div className="text-center text-orange-600 mb-5">
                    Waste Details
                </div>
                <Link href="./">

                    <img src="/goback.png" alt="" className="h-6 absolute top-4 right-10" />
                </Link>
            </div>

            <form onSubmit={handleSubmit} action="">
                <div className="grid grid-cols-2 text-sm">
                    <div className="px-2 py-2 font-semibold text-xs">ID : <span className="font-normal text-sm"> {wasteData?.ID}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Waste : <span className="font-normal text-sm"> {wasteData?.Waste}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Waste Category : <span className="font-normal text-sm"> {wasteData?.WasteCategory}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Waste Quantity : <span className="font-normal text-sm"> {wasteData?.WasteQty}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Generating Unit : <span className="font-normal text-sm"> {wasteData?.Unit}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Generating Department : <span className="font-normal text-sm"> {wasteData?.GenDept}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Generated By : <span className="font-normal text-sm"> {wasteData?.CreatedBy}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Waste Type : <span className="font-normal text-sm"> {wasteData?.WasteType}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Storage Method : <span className="font-normal text-sm"> {wasteData?.StorageMethod}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Physical State : <span className="font-normal text-sm"> {wasteData?.PhysicalState}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Waste Disposer : <span className="font-normal text-sm"> {wasteData?.Dept}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Waste Receiver : <span className="font-normal text-sm"> {wasteData?.Receiver}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Generation Date : <span className="font-normal text-sm"> {wasteData?.GenerationDate}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Target Date : <span className="font-normal text-sm"> {wasteData?.TargetDate}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Status : <span className="font-normal text-sm"> {wasteData?.Status}</span></div>
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
                                    >ID</th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                    >Rejected By</th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                    >Remarks</th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                    >Rejection Date</th>
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
                                        >{row.CreatedDate?.split("T")[0]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }

                <hr className="border border-gray-200 my-4" />

                <div className="grid grid-cols-2 text-sm">

                    <div>
                        <label className="font-semibold">Action <span className="text-red-600 font-semibold text-sm pr-2">* </span></label>
                        <select
                            required
                            onChange={(e) => setAcceptance(e.target.value)}
                            className="w-[40%] border border-gray-200 cursor-pointer p-2 mt-1 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-400">
                            <option value="">Select </option>
                            <option value="1">Approve</option>
                            <option value="2">Revert</option>
                        </select>


                    </div>

                    <div>
                        <label className="font-semibold">Remarks</label>
                        <textarea
                            // type="text"
                            rows={1}
                            placeholder=""
                            // value={complaint.date}
                            // readOnly
                            onChange={(e) => { setRemarks(e.target.value) }}
                            className=" border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>

                </div>
                <button
                    type="submit"
                    className="text-sm cursor-pointer px-4 py-1.5 rounded-md bg-green-700 text-white hover:bg-green-800"
                >
                    Submit
                </button>
            </form >
        </div >
    );
}
