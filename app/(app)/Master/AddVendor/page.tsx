'use client'
import React, { useEffect, useState } from "react"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast";

export default function Vendor() {
    const [showConfirm, setShowConfirm] = useState(false)
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


    type Vendor = {
        ID: string,
        NAME: string
        DESC: string
        STATUS: string
    }

    const [Vendor, setVendor] = useState<Vendor[]>([])
    const [selectedVendorId, setSelectedVendorId] = useState("")

    const [vendorName, setVendorName] = useState("")
    const [vendorEmail, setVendorEmail] = useState("")
    const [vendorCode, setVendorCode] = useState("")


    // async function fetchVendor() {
    //     try {
    //         const res = await fetch(`/api/Master/GetVendorDesc`, {
    //             method: "POST"
    //         });
    //         const rawdata = await res.json();
    //         const data = rawdata.map(normalizeData)
    //         setVendor(data);
    //     } catch (error) {
    //         console.error("Error fetching data:", error);
    //     }
    // }

    // useEffect(() => {
    //     fetchVendor()
    // }, [])

    // async function updateVendor(AFID: any, keyname: any, status: any) {
    //     try {
    //         const res = await fetch(`/api/Master/UpdateVendor`, {
    //             method: "POST",
    //             body: JSON.stringify({
    //                 "keyname": keyname,
    //                 "AFID": AFID,
    //                 "STATUS": status
    //             })
    //         });
    //         const data = await res.json();
    //         // console.log(data)
    //         // setVendor(data);
    //         window.location.reload()
    //     } catch (error) {
    //         console.error("Error setting status:", error);
    //     }
    // }

    const handleSubmit = async (e: React.FormEvent) => {

        // if (!e.target.checkValidity()) return;
        e.preventDefault();

        if (vendorName == "" || vendorEmail == "" || vendorCode == "") {
            toast.error("Please fill all required fields")
            // console.log("hajakdkjs")
            return
        }


        // setNewComplaint((prev) => ({ ...prev, items: rows }))

        const payload =
        {
            "VendorName": vendorName,
            "VendorEmail": vendorEmail,
            "VendorCode": vendorCode
        }
        // console.log(payload)

        const res = await fetch(`/api/Master/SetData/AddVendor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });


        const data = await res.json()
        const status = await res.status

        if (status == 200) {
            // redirect('./Vendor')
            window.location.reload()
        }

    };



    return (
        <>
            <div className="flex mx-auto w-[50%]">

                <Toaster />
                <div className="">
                    <div className="w-full mt-1">
                        <div className="text-md text-center font-semibold ">
                            Add Vendor
                        </div>
                    </div>

                    <div className="text-sm mt-4 place-self-center border border-blue-100 rounded-lg p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-[150px_250px] gap-y-3 gap-x-3 items-start">
                            <label className="font-semibold ">Name  <span className="text-red-600 font-semibold text-sm">*</span></label>
                            <input
                                onChange={(e) => { setVendorName(e.target.value) }}
                                type="text"
                                className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />

                            <label className="font-semibold">Email  <span className="text-red-600 font-semibold text-sm">*</span></label>
                            <textarea
                                onChange={(e) => { setVendorEmail(e.target.value) }}
                                rows={2}
                                className="bg-gray-50 border border-gray-200 p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                            />

                            <label className="font-semibold ">Vendor Code <span className="text-red-600 font-semibold text-sm">*</span></label>
                            <input
                                onChange={(e) => { setVendorCode(e.target.value) }}
                                type="text"
                                className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />
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


                {/* <hr className="border-gray-200 mt-4 w-[95%] mx-auto " /> */}

                {/* <div className="place-self-center mt-6 overflow-x-auto mb-2 max-h-100 ">
                    <table className="border border-gray-200 rounded-lg text-sm">
                        <thead className="bg-gray-100">
                            <tr>

                                <th className="px-4 py-2 text-left font-semibold ">
                                    Id
                                </th>

                                <th className="px-4 py-2 text-left font-semibold ">
                                    Finish
                                </th>
                                <th className="px-4 py-2 text-left font-semibold ">
                                    Description
                                </th>
                                <th className="px-4 py-2 text-left font-semibold ">
                                    Status
                                </th>
                                <th className="px-4 py-2 text-center font-semibold  w-24 whitespace-nowrap">
                                    Action
                                </th>

                            </tr>
                        </thead>

                        <tbody className="text-xs">
                            {Vendor?.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50  border border-gray-200">
                                    <td className="px-4 py-0.5 ">{item.ID}</td>
                                    <td className="px-4 py-0.5 ">{item.NAME}</td>
                                    <td className="px-4 py-0.5 ">{item.DESC}</td>
                                    <td className="px-4 py-0.5  text-center">
                                        {(item.STATUS == '0') &&
                                            <button
                                                onClick={() => { updateVendor(item.ID, item.NAME, true) }}
                                                className="cursor-pointer bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded-md text-xs"
                                            >
                                                Activate
                                            </button>
                                        }

                                        {(item.STATUS == '1') &&
                                            <button
                                                onClick={() => { updateVendor(item.ID, item.NAME, false) }}
                                                className="cursor-pointer bg-rose-700 hover:bg-red-800 text-white px-3 py-1 rounded-md text-xs"
                                            >
                                                Deactivate
                                            </button>
                                        }
                                    </td>

                                </tr>

                            ))}

                        </tbody>
                    </table>
                </div> */}


                {/* {showConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-4 w-[80%] sm:w-[20%]  shadow-lg">

                            <p className="text-sm text-gray-600 mb-5">
                                Do you really want to Deactivate?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="cursor-pointer px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => {
                                        setShowConfirm(false)
                                    }}
                                    className="cursor-pointer px-4 py-2 text-sm rounded-md bg-rose-700 text-white hover:bg-red-800"
                                >
                                    Deactivate
                                </button>
                            </div>
                        </div>
                    </div>
                )} */}

            </div >
        </>
    )
}
