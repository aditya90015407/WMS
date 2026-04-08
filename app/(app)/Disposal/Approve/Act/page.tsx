"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import decrypt from "@/components/Decrypt";


export default function AuctionApply() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auctionId = searchParams.get("id");
    const [showTransportForm, setShowTransportForm] = useState(false);

    const [recyclerName, setRecyclerName] = useState("");
    const [vendorId, setVendorId] = useState("");
    const [recyclerEmail, setRecyclerEmail] = useState("");
    const [remarks, setRemarks] = useState("");
    const [hwAuthSpcbFile, setHwAuthSpcbFile] = useState<File | null>(null);

    const { data: session } = useSession();
    const empCode = session?.user?.id ?? "";

    const [ctoFile, setCtoFile] = useState<File | null>(null);
    const [hwAuthFile, setHwAuthFile] = useState<File | null>(null);
    const [blueBookFile, setBlueBookFile] = useState<File | null>(null);
    const [eprFile, setEprFile] = useState<File | null>(null);

    const [acceptance, setAcceptance] = useState("")


    const [transportForm, setTransportForm] = useState({
        APID: "",
        TransporterName: "",
        TransporterAddress: "",
        TransporterPhone: "",
        TransporterEmail: "",
        VTID: "",
        TransporterRegNo: "",
        VehicleRegNo: "",
        ReceiverName: "",
        ReceiverAddress: "",
        ReceiverAuthNo: "",
    });


    const [vehicleTypes, setVehicleTypes] = useState<Array<{ id: string; name: string }>>([]);


    const [auctionDetails, setAuctionDetails] = useState<{
        ID: string
        AuctionDate: string;
        WasteCategory: string;
        Remarks: string;
        CrDt: string;
    } | null>(null);

    useEffect(() => {
        if (!auctionId) return;

        const loadDetails = async () => {
            const res = await fetch("/api/GetData/GetAuctionDetailsById", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    flag: "GetAuctionDetailsByID",
                    id: auctionId,
                }),
            });

            const payload = await res.json();
            // console.log(payload)
            if (payload.success) {
                setAuctionDetails(payload.data);
            }
        };

        loadDetails();
    }, [auctionId]);

    const [wasteDetails, setWasteDetails] = useState<Array<{ WasteType: string }>>(
        []
    );

    useEffect(() => {
        if (!auctionId) return;

        const loadWaste = async () => {
            const res = await fetch("/api/GetData/GetWasteDetailsByAuctionId", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: auctionId }),
            });

            const payload = await res.json();
            if (payload.success) {
                const data = payload.data;
                setWasteDetails(Array.isArray(data) ? data : data ? [data] : []);
            }
        };

        loadWaste();
    }, [auctionId]);


    useEffect(() => {
        const loadVT = async () => {
            const res = await fetch("/api/GetData/GetVehicleType", { method: "POST" });
            const payload = await res.json();
            // console.log("vehicle type payload:", payload);

            if (payload.success) {
                const data = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];
                const list = data.map((v: any) => ({
                    id: String(v.VTID ?? v.id),
                    name: String(v.VehicleType ?? v.name),
                }));
                setVehicleTypes(list);
            }
        };
        loadVT();
    }, []);


    const allFilesReady = Boolean(
        ctoFile && hwAuthFile && hwAuthSpcbFile && blueBookFile && eprFile
    );


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();


        const headerRes = await fetch("/api/SetData/SetDisposalApproval", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                IDDID: auctionDetails?.ID,
                Remarks: remarks,
                Acceptance: acceptance
            }),
        });

        toast.success("Saved successfully!");
    }

    async function handleTransportSubmit(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/SetData/SetTransportationDetails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transportForm),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            toast.error(data.message || "Failed to save transporter details");
            return;
        }

        toast.success("Transporter details saved!");
    }



    return (
        <div className="bg-white h-fit px-8 py-4 relative">
            <Toaster />

            <div>
                <div className="text-center text-orange-600 mb-5 text-2xl font-bold">
                    Approve Disposal
                </div>
                <Link href="./">
                    <img src="/goback.png" alt="" className="h-6 absolute top-4 right-10" />
                </Link>
            </div>

            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="text-sm font-semibold text-slate-800 mb-3">
                    Disposal Details
                </h2>

                <div className="grid grid-cols-2 gap-4 text-sm">

                    <div>
                        <p className="text-xs text-slate-500">ID</p>
                        <p className="font-medium text-slate-800">
                            {auctionDetails?.ID}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Auction Date</p>
                        <p className="font-medium text-slate-800">
                            {auctionDetails?.AuctionDate ?? "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">Posted On</p>
                        <p className="font-medium text-slate-800">
                            {auctionDetails?.CrDt?.split("T")[0] ?? "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">Waste Category</p>
                        <p className="font-medium text-slate-800">
                            {auctionDetails?.WasteCategory ?? "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">Remarks</p>
                        <p className="font-medium text-slate-800">
                            {auctionDetails?.Remarks ?? "N/A"}
                        </p>
                    </div>
                </div>

                <p className="text-xs text-slate-500 mb-1">Waste Type</p>
                <div className="flex flex-wrap gap-2">
                    {wasteDetails.length > 0 ? (
                        wasteDetails.map((w, i) => (
                            <span
                                key={i}
                                className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                            >
                                {w.WasteType}
                            </span>
                        ))
                    ) : (
                        <span className="text-slate-500">N/A</span>
                    )}
                </div>

            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 text-sm">
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

                    <div className="mt-4">
                        <label className="font-semibold">Remarks</label>
                        <textarea
                            rows={1}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter Remarks"
                            className="mt-2 border border-gray-200 p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className={`mt-6 text-sm px-4 py-1.5 rounded-md text-white  bg-green-700 hover:bg-green-800 cursor-pointer`}
                >
                    Submit
                </button>
            </form>


        </div>
    );
}
