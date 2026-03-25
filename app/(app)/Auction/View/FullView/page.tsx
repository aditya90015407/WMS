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

    type AuctionParticipant = {
        ID: string
        NAME: string
        EMAIL: string
        StsCode: string
        CrBy: string
        CrDt: string
        UpBy: string
        UpDt: string
        IsActive: string
    }

    type AuctionParticipantLine = {
        ID: string
        APID: string
        CTO_AttachPath: string
        OSPCB_HW_Auth_AttachPath: string
        SPCB_HW_Auth_AttachPath: string
        BlueBook_AttachPath: string
        EPR_Cert_AttachPath: string
        Remarks: string
        CrBy: string
        CrDt: string
        IsActive: string
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

    const [auctionParticipant, setAuctionParticipant] = useState<AuctionParticipant>()
    const [auctionParticipantLine, setAuctionParticipantLine] = useState<AuctionParticipantLine[]>([])

    const [approvalRejectionHistory, setApprovalRejectionHistory] = useState<ApprovalRejectionHistory[]>([])

    const [remarks, setRemarks] = useState("")
    const [acceptance, setAcceptance] = useState("")


    async function fetchDetails() {

        const encoded = params.id;
        const id = await decrypt(encoded!)

        const res = await fetch("/api/GetData/GetAuctionParticipantDetails", {
            method: "POST",
            body: JSON.stringify({ "ID": id })
        })

        const rawData = await res.json()
        console.log(rawData)
        const HeaderData = rawData.HeaderDetails.map(normalizeData)
        setAuctionParticipant(HeaderData[0])

        const LineData = rawData.LineDetails.map(normalizeData)
        setAuctionParticipantLine(LineData)

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

        const res = await fetch("/api/SetData/SetAuctionApproval", {
            method: "POST",
            body: JSON.stringify({
                "WRID": auctionParticipant?.ID,
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
                    Participant's Details
                </div>
                <Link href="./">

                    <img src="/goback.png" alt="" className="h-6 absolute top-4 right-10" />
                </Link>
            </div>

            <form onSubmit={handleSubmit} action="">
                <div className="grid grid-cols-2 text-sm">
                    <div className="px-2 py-2 font-semibold text-xs">ID : <span className="font-normal text-sm"> {auctionParticipant?.ID}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Name : <span className="font-normal text-sm"> {auctionParticipant?.NAME}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Email : <span className="font-normal text-sm"> {auctionParticipant?.EMAIL}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Applied On : <span className="font-normal text-sm"> {auctionParticipant?.CrDt?.split('T')[0]} {auctionParticipant?.CrDt?.split('T')[1]?.split('.')[0]} </span></div>
                    {/* <div className="px-2 py-2 font-semibold text-xs">CTO for respective SPCB : <span className="font-normal text-sm"> {auctionParticipant?.CTO_AttachPath}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">HW authorization from OSPCB : <span className="font-normal text-sm"> {auctionParticipant?.OSPCB_HW_Auth_AttachPath}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">HW authorization from respective SPCB : <span className="font-normal text-sm"> {auctionParticipant?.SPCB_HW_Auth_AttachPath}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">Copy of blue book : <span className="font-normal text-sm"> {auctionParticipant?.BlueBook_AttachPath}</span></div>
                    <div className="px-2 py-2 font-semibold text-xs">EPR registration certificate for Plastic/oil/tyre : <span className="font-normal text-sm"> {auctionParticipant?.EPR_Cert_AttachPath}</span></div> */}
                </div>

                <hr className="border border-gray-200 my-4" />

                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                    <div className="py-1 text-center text-sm">Documents Upload History</div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr >
                                {/* <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                >ID</th> */}
                                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                >ID</th>
                                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                >CTO for respective SPCB</th>
                                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                >HW authorization from OSPCB</th>
                                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                >HW authorization from respective SPCB</th>
                                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                >Copy of blue book</th>
                                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                >EPR registration certificate for Plastic/oil/tyre</th>
                                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                >Admin Remarks</th>
                                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                >Rejection Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {auctionParticipantLine?.map((row, index) => (
                                <tr key={index}>
                                    <td
                                        className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                    >{row.ID}
                                    </td>
                                    <td
                                        className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                    >{row.CTO_AttachPath}
                                    </td>
                                    <td
                                        className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                    >{row.OSPCB_HW_Auth_AttachPath}
                                    </td>
                                    <td
                                        className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                    >{row.SPCB_HW_Auth_AttachPath}
                                    </td>
                                    <td
                                        className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                    >{row.BlueBook_AttachPath}
                                    </td>
                                    <td
                                        className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                    >{row.EPR_Cert_AttachPath}
                                    </td>
                                    <td
                                        className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                    >{row.Remarks}
                                    </td>
                                    {/* <td
                                        className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                    >{row.IsActive}
                                    </td> */}
                                    <td
                                        className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                    >{row.CrDt?.split("T")[0]}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>



                {/* <hr className="border border-gray-200 my-4" />

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
                </button> */}

            </form>
        </div>
    );
}
