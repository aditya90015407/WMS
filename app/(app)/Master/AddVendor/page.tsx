'use client'
import React, { useState } from "react"
import toast, { Toaster } from "react-hot-toast";

type VendorCodeRow = {
    VendorCode?: string
    VCode?: string
    Code?: string
    [key: string]: unknown
}

export default function Vendor() {
    const [vendorName, setVendorName] = useState("")
    const [vendorEmail, setVendorEmail] = useState("")
    const [vendorCode, setVendorCode] = useState("")
    const [isGeneratingVendorCode, setIsGeneratingVendorCode] = useState(false)

    const getExistingVendorCodes = async () => {
        const res = await fetch(`/api/Master/GetData/GetVendorCode`, {
            method: "GET",
            cache: "no-store",
        });

        const payload = await res.json();

        if (!res.ok || !payload?.success || !Array.isArray(payload?.data)) {
            throw new Error(payload?.message || "Failed to fetch vendor codes");
        }

        return new Set(
            (payload.data as VendorCodeRow[])
                .map((row) =>
                    String(
                        row?.VendorCode ??
                        row?.VCode ??
                        row?.Code ??
                        ""
                    ).trim()
                )
                .filter(Boolean)
        );
    };

    const generateUniqueVendorId = async () => {
        setIsGeneratingVendorCode(true);

        try {
            const existingCodes = await getExistingVendorCodes();
            let nextId = "";
            let attempts = 0;

            while (attempts < 50) {
                const candidate = Math.floor(10000000 + Math.random() * 90000000).toString();

                if (!existingCodes.has(candidate)) {
                    nextId = candidate;
                    break;
                }

                attempts += 1;
            }

            if (!nextId) {
                toast.error("Could not generate a unique Vendor ID. Please try again.");
                setVendorCode("");
                return;
            }

            setVendorCode(nextId);
            toast.success("Unique Vendor ID generated");
        } catch (error) {
            toast.error("Failed to verify Vendor ID uniqueness");
            setVendorCode("");
        } finally {
            setIsGeneratingVendorCode(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (vendorName === "" || vendorEmail === "" || vendorCode === "") {
            toast.error("Please fill all required fields")
            return
        }

        try {
            const existingCodes = await getExistingVendorCodes();

            if (existingCodes.has(vendorCode.trim())) {
                toast.error("Vendor ID already exists. Please generate the vendor code again.");
                return;
            }

            const payload = {
                VendorName: vendorName,
                VendorEmail: vendorEmail,
                VendorCode: vendorCode
            }

            const res = await fetch(`/api/Master/SetData/AddVendor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.status === 200) {
                toast.success("Vendor Added Succesfully")
                window.location.reload()
                return;
            }

            toast.error("Failed to add vendor");
        } catch {
            toast.error("Unable to validate Vendor ID");
        }
    };

    return (
        <>
            <div className="flex mx-auto w-[50%]">
                <Toaster />

                <div>
                    <div className="w-full mt-1">
                        <div className="text-lg text-center font-semibold text-cyan-600">
                            Add Vendor
                        </div>
                    </div>

                    <div className="text-sm mt-4 place-self-center border border-blue-100 rounded-lg p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-[150px_250px] gap-y-3 gap-x-3 items-start">
                            <label className="font-semibold">
                                Name <span className="text-red-600 font-semibold text-sm">*</span>
                            </label>
                            <input
                                onChange={(e) => { setVendorName(e.target.value) }}
                                type="text"
                                className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />

                            <label className="font-semibold">
                                Email <span className="text-red-600 font-semibold text-sm">*</span>
                            </label>
                            <input
                                onChange={(e) => { setVendorEmail(e.target.value) }}
                                className="bg-gray-50 border border-gray-200 p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                            />

                            <label className="mt-2 font-semibold">
                                Generate Vendor ID <span className="text-red-600 font-semibold text-sm">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={generateUniqueVendorId}
                                disabled={isGeneratingVendorCode}
                                className="w-fit bg-slate-700 cursor-pointer text-white px-2 py-2 rounded-lg text-sm disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isGeneratingVendorCode ? "Generating..." : "Generate"}
                            </button>

                            {vendorCode && (
                                <>
                                    <label className="font-semibold">Vendor ID</label>
                                    <div className="bg-gray-100 border border-gray-200 p-2 rounded-lg text-sm">
                                        {vendorCode}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="text-sm place-self-center">
                        <div className="flex">
                            <button
                                onClick={handleSubmit}
                                type="submit"
                                className="bg-blue-600 cursor-pointer text-white px-6 py-2 mx-1 rounded-lg mt-4 text-md"
                            >
                                Add
                            </button>

                            <div
                                onClick={() => window.location.reload()}
                                className="bg-cyan-700 cursor-pointer text-white px-6 py-2 mx-2 rounded-lg mt-4 text-md"
                            >
                                Reset
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}