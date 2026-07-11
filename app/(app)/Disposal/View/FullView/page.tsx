"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import decrypt from "@/components/Decrypt";


export default function DisposalApproveHazardousPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const router = useRouter();
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
        ActualDateofDisposal: string
    }
    const [disposalDetails, setDisposalDetails] = useState<DisposalDetails>()


    type FinalDisposalList = {
        ID: string
        IDDID: string
        DateOfDisposal: string
        UID: string
        Unit: string
        UnitDesc: string
        ManifestDocumentNo: string
        TransporterName: string
        TransporterAddress: string
        TransporterPhone: string
        TransporterEmail: string
        VTID: string
        VehicleType: string
        TransporterRegNo: string
        VehicleRegNo: string
        ReceiverName: string
        ReceiverAddress: string
        ReceiverAuthNo: string
        TotalQty: string
        NoOfContainers: string
        MUID: string
        MUnit: string
        PSID: string
        PhysicalState: string
        SpecialHandlingInstructions: string
        Form8Form9: string
        AID: string
        IRName: string
        InternalReceiver: string
        StsCode: string
        Status: string
        ApproverRemarks: string
        ActualDateofDisposal: string
        CrBy: string
        CrDt: string
        UpBy: string
        UpDt: string
        IsActive: string
    }

    const [finalDisposals, setFinalDisposals] = useState<FinalDisposalList[]>([])

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

    async function GetFinalDisposalList() {
        if (!id) return
        const res = await fetch("/api/GetData/GetFinalDisposalListByIDDID", {
            method: "POST",
            body: JSON.stringify({ "id": id })
        })
        const rawdata = await res.json()
        const data = await rawdata.data
        // console.log(data)
        setFinalDisposals(data)
    }

    useEffect(() => {
        GetWasteList()
        GetVendorList()
        GetDisposalDetails()
        GetFinalDisposalList()
    }, [id])






    // useEffect(() => {
    //     const loadForm10Details = async () => {
    //         if (!id) return;

    //         try {
    //             const res = await fetch("/api/GetData/GetForm10Details", {
    //                 method: "POST",
    //                 headers: { "Content-Type": "application/json" },
    //                 body: JSON.stringify({ ID: String(id) }),
    //             });

    //             const payload = await res.json();
    //             //   console.log("GetForm10Details payload:", payload);



    //         } catch (error) {
    //             console.error("Failed to load Form 10 details", error);

    //         }
    //     };

    //     void loadForm10Details();
    // }, [id]);



    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full ">
                    <h1 className="text-lg font-semibold text-teal-600 text-center">
                        Disposal Details
                    </h1>
                </div>

                <img src="/goback.png" onClick={() => router.back()} alt="" className="relative cursor-pointer h-5 absolute top-0 right-10" />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm mt-7">
                <div className=""> <span className="text-xs mr-1 font-semibold ">ID  : </span> {disposalDetails?.ID}</div>
                <div className=""><span className="text-xs mr-1 font-semibold ">Disposal Type : </span> {disposalDetails?.DisType}</div>
                {disposalDetails?.DisposalType == '1' && <div className=""><span className="text-xs mr-1 font-semibold ">Auction Date : </span> {disposalDetails?.AuctionDate}</div>}
                {disposalDetails?.DisposalType == '1' && <div className=""><span className="text-xs mr-1 font-semibold ">Selected Vendor: </span>
                    {disposalDetails?.VendorName && <>{disposalDetails?.VendorName} ({disposalDetails.VendorCode}) </>}
                    {!disposalDetails?.VendorName && <>N/A </>}
                </div >}
                <div className=""><span className="text-xs mr-1 font-semibold ">Physical State : </span> {disposalDetails?.PhysicalState}</div >
                <div className=""><span className="text-xs mr-1 font-semibold ">Approval Status : </span> {disposalDetails?.Status}</div >
                <div className=""><span className="text-xs mr-1 font-semibold ">Initiator Remarks : </span> {disposalDetails?.Remarks}</div >
                <div className=""><span className="text-xs mr-1 font-semibold ">Total Quantity : </span> {disposalDetails?.TotalQty}{" "}{disposalDetails?.MUnit}</div >
                {/* <div className="">ID : </span> {disposalDetails?.WCID}</div> */}
                < div className="" > <span className="text-xs mr-1 font-semibold ">Waste : </span > {disposalDetails?.Waste}</div >
                <div className=""><span className="text-xs mr-1 font-semibold ">Waste Category : </span> {disposalDetails?.WasteCategory}</div >
                <div className=""><span className="text-xs mr-1 font-semibold ">Created By : </span> {disposalDetails?.CreatedBy}{" "} ( {disposalDetails?.CrBy})</div >
                {/* <div className=""><span className="text-xs mr-1 font-semibold ">Created On : </span> {disposalDetails?.CrDt.split("T")[0]}</div > */}
                <div className=""><span className="text-xs mr-1 font-semibold ">Disposed On: </span> {disposalDetails?.ActualDateofDisposal?.split("T")[0] ?? "N/A"}</div >
            </div >

            <div className="mt-6">
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
            </div>

            {
                vendorList.length > 0 &&
                <div className="mt-6">
                    <p className="text-sm font-semibold text-cyan-700 my-2">Invited Vendors List</p>
                    {vendorList.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white max-h-70">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-emerald-600">
                                    <tr>
                                        {/* <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                                        ID
                                    </th> */}
                                        <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                            Vendor Code
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                            Name
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                            Email
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {vendorList.map((w, i) => (
                                        <tr key={String(i)}>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                                {w.VendorCode}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                                {w.Name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                                {w.Email}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <span className="text-slate-500">N/A</span>
                    )}
                </div>
            }

            <div className="mt-6">
                <p className="text-sm font-semibold text-cyan-700  my-2">Final Disposals</p>
                {finalDisposals.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white max-h-70 max-w-4xl">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-emerald-600">
                                <tr>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        ID
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        Unit
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        ManifestDocumentNo
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        TransporterName
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        TransporterAddress
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        TransporterPhone
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        TransporterEmail
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        VehicleType
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        TransporterRegNo
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        VehicleRegNo
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        ReceiverName
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        ReceiverAddress
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        ReceiverAuthNo
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        TotalQty
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        NoOfContainers
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        PhysicalState
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        SpecialHandlingInstructions
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        Form8Form9
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        Receiver
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        Status
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        ApproverRemarks
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        ActualDateofDisposal
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        Created By
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-50">
                                        Created On
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {finalDisposals.map((w, i) => (
                                    <tr key={String(i)}>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.ID}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.Unit}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.ManifestDocumentNo}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.TransporterName}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.TransporterAddress}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.TransporterPhone}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.TransporterEmail}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.VehicleType}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.TransporterRegNo}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.VehicleRegNo}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.ReceiverName}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.ReceiverAddress}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.ReceiverAuthNo}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.TotalQty}{w.MUnit}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.NoOfContainers}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.PhysicalState}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.SpecialHandlingInstructions}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.Form8Form9 == '1' ? "Yes" : "No"}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.InternalReceiver}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.Status}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.ApproverRemarks}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.ActualDateofDisposal}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.CrBy}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                                            {w.CrDt}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <span className="text-slate-500">N/A</span>
                )}
            </div>

        </section >
    );
}
