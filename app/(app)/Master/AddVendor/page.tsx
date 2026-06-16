'use client'
import { reportWebVitals } from "next/dist/build/templates/pages";
import React, { useEffect, useState } from "react"
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

    type Vendor = {
        VID: string
        Name: string
        Email: string
        CrBy: string
        CrDt: string
        UpBy: string
        UpDt: string
        IsActive: boolean
        VendorCode: string
    }

    const [vendors, SetVendors] = useState<Vendor[]>([])
    const [vendorsFiltered, SetVendorsFiltered] = useState<Vendor[]>([])

    const [submitClicked, setSubmitClicked] = useState(false)

    const [filter, setFilter] = useState("")

    const emailRegex = /^(?=.{12,})[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


    async function isValidEmail(email: any) {
        // console.log(username, password)
        // const pass = await decryptPassword(password);
        // console.log(pass)
        return emailRegex.test(email);
        // return usernameRegex.test(username);
    }


    async function GetVendorList() {
        const res = await fetch("/api/Master/GetData/GetAllVendors", {
            method: "POST"
        })
        const data = await res.json()
        // console.log(data)
        SetVendors(data)
        SetVendorsFiltered(data)
    }

    useEffect(() => {
        GetVendorList()
    }, [])

    const handleFilter = async () => {
        var comp = vendors;
        // console.log(date)



        if (filter && filter.trim() !== "") {
            const f = filter.trim().toUpperCase();

            comp = comp.filter(u =>
                u.VendorCode.toUpperCase().includes(f) ||
                u.Name.toUpperCase().includes(f) ||
                u.Email.toUpperCase().includes(f)
            );
        }
        SetVendorsFiltered(comp)
    }

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
                const candidate = Math.floor(100000000 + Math.random() * 900000000).toString();

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

    async function updateVendor(VID: string, Status: number, VendorCode: string) {
        const res = await fetch("/api/Master/SetData/UpdateVendor", {
            method: "POST",
            body: JSON.stringify({
                VID: VID,
                Status: Status,
                VendorCode: VendorCode
            })
        })
        const data = await res.json()
        window.location.reload()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setSubmitClicked(true)

        if (vendorName === "" || vendorEmail === "" || vendorCode === "") {
            toast.error("Please fill all required fields")
            setSubmitClicked(false)
            return
        }

        if (!await isValidEmail(vendorEmail)) {
            toast.error("Invalid Email", {
                position: "top-right"
            })
            setSubmitClicked(false)
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
            setSubmitClicked(false)
        } catch {
            toast.error("Unable to validate Vendor ID");
        }
    };

    return (
        <>
            <div className="flex mx-auto w-full">
                <Toaster />

                <div className="flex w-full">
                    <div className="w-full">
                        <div className="w-full mt-1">
                            <div className="text-lg text-center font-semibold text-teal-600">
                                Add New Vendor
                            </div>
                        </div>

                        <div className="text-sm mt-4 place-self-center border border-blue-100 rounded-lg p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-[150px_200px] gap-y-3 gap-x-3 items-start">
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
                                    Generate Vendor Code <span className="text-red-600 font-semibold text-sm">*</span>
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
                                        <label className="font-semibold">Vendor Code</label>
                                        <div className="bg-gray-100 border border-gray-200 p-2 rounded-lg text-sm">
                                            {vendorCode}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="text-sm place-self-center">
                            <div className="flex">
                                {!submitClicked &&
                                    <button
                                        onClick={handleSubmit}
                                        type="submit"
                                        className="bg-blue-800 cursor-pointer text-white px-6 py-2 mx-1 rounded-lg mt-4 text-md"
                                    >
                                        Add
                                    </button>
                                }
                                {submitClicked &&
                                    <div
                                        className="bg-blue-800 cursor-pointer text-white px-6 py-2 w-fit mx-1 rounded-lg mt-4 text-md"
                                    >
                                        Adding ...
                                    </div>
                                }
                                <div
                                    onClick={() => window.location.reload()}
                                    className="bg-cyan-700 cursor-pointer text-white px-6 py-2 mx-2 rounded-lg mt-4 text-md"
                                >
                                    Reset
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full mx-5 mt-2">
                        <div className="text-cyan-700 font-semibold text-center w-full">
                            Vendors List
                        </div>
                        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 max-h-[320px] overflow-auto">
                            <table className="min-w-full divide-y divide-slate-200 ">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr >

                                        <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                        >Vendor Code</th>
                                        <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                        >Name</th>
                                        <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                        >Email</th>
                                        <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                        >Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {vendorsFiltered?.map((row, index) => (
                                        <tr key={index}
                                            // onClick={async () => {
                                            //     const encryptedID = await encrypt(row.ID!.toString());
                                            //     router.push(`./Applicants/Act?id=${encryptedID}`);
                                            // }}
                                            className=""
                                        >
                                            <td
                                                className="whitespace-nowrap px-2 py-2 text-xs text-slate-700"
                                            >{row.VendorCode}
                                            </td>
                                            <td
                                                className="whitespace-nowrap px-2 py-2 text-xs text-slate-700"
                                            >{row.Name}
                                            </td>
                                            <td
                                                className="whitespace-nowrap px-2 py-2 text-xs text-slate-700"
                                            >{row.Email}
                                            </td>
                                            {
                                                row.IsActive == true &&
                                                <td
                                                    className="whitespace-nowrap px-2 py-2 text-xs text-slate-50 bg-red-700 rounded-lg cursor-pointer"
                                                    onClick={() => updateVendor(row.VID, 0, row.VendorCode)}
                                                >Deactivate
                                                </td>
                                            }
                                            {
                                                row.IsActive == false &&
                                                <td
                                                    className="whitespace-nowrap px-2 py-2 text-xs text-slate-50 bg-green-500 rounded-lg cursor-pointer"
                                                    onClick={() => updateVendor(row.VID, 1, row.VendorCode)}
                                                >Activate
                                                </td>
                                            }

                                        </tr>
                                    ))}
                                    {/* {pagedRows.map((row, index) => (
                                    <tr key={`row-${(currentPage - 1) * pageSize + index}`}
                                        onClick={async () => {
                                            const encryptedID = await encrypt(row.ID!.toString());
                                            router.push(`./Approve/Act?id=${encryptedID}`);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        {headers.map((header) => (
                                            <td
                                                key={`${index}-${header}`}
                                                className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                            >
                                                {toText(row[header]) || "-"}
                                            </td>
                                        ))}
                                    </tr>
                                ))} */}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-center items-center w-full xs:grid xs:grid-cols-2 xs:gap-5 xs:w-full">
                            <input placeholder="Search Filters" className="w-fit text-center bg-gray-50 text-md  sm:px-2 py-1 rounded-md border text-black border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 sm:m-2 placeholder:text-xs " onChange={(e) => { setFilter(e.target.value) }} />

                            <button className="cursor-pointer flex bg-gray-700 text-white px-0 sm:px-2 sm:m-2 py-1 rounded-lg border hover:bg-gray-800" onClick={handleFilter}>
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}