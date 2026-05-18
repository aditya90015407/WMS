"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import decrypt from "@/components/Decrypt";
type Form10Row = {
  ReceiverName?: string;
  ReceiverAddress?: string;
  ReceiverAuthNo?: string;

  TransporterName?: string;
  TransporterAddress?: string;
  TransporterPhone?: string;
  TransporterEmail?: string;

  VehicleType?: string;
  TransporterRegNo?: string;
  VehicleRegNo?: string;

  ManifestDocumentNo?: string;
};


type FinalDisposalRow = Record<string, string | number | boolean | null>;

const fields = [
    ["ID", "Final Disposal Ref No."],
    ["IDDID", "Original Disposal ID"],
    ["WasteCategory", "Waste Category"],
    ["Waste", "Waste Description"],
    ["TotalQty", "Total Quantity"],
    // ["NAME", "Recycler / Vendor Name"],
    // ["EMAIL", "Recycler Email"],
    ["TransporterName", "Transporter Name"],
    ["TransporterAddress", "Transporter Address"],
    ["TransporterPhone", "Transporter Phone"],
    ["TransporterEmail", "Transporter Email"],
    ["TransporterRegNo", "Transporter Registration No."],
    ["VehicleRegNo", "Vehicle Registration No."],
    ["ReceiverName", "Receiver Name"],
    ["ReceiverAddress", "Receiver Address"],
    ["ReceiverAuthNo", "Receiver Auth No."],
    ["Status", "Current Status"],
    ["CrDt", "Created On"],
    ["UpDt", "Updated On"],
] as const;

export default function DisposalApproveNonHazardousPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const router = useRouter();
    // const params = React.use(searchParams)
    // const id = params.id;
    // const id = params.get("id") ?? "";
    const [row, setRow] = useState<FinalDisposalRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [remarks, setRemarks] = useState("");
    const [decision, setDecision] = useState("");
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<FinalDisposalRow>({});
    
      const [values, setValues] = useState<Form10Row>({});
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);


    const [id, setId] = useState("");
    const [ready, setReady] = useState(false);

    const params = React.use(searchParams);
    const encryptedId = params.id ?? "";
    // const id = encryptedId ? await decrypt(encryptedId) : "";
    useEffect(() => {
        const handleDecrypt = async () => {
            const decryptedId: string = encryptedId ? (await decrypt(encryptedId)) ?? "" : "";
            setId(decryptedId);
            setReady(true);
            // use id here (set state, etc.)
        };

        void handleDecrypt();
    }, [encryptedId]);



    async function UpdateDisposedWaste() {
        const res = await fetch("/api/GetData/GetWasteListByIDDID", {
            method: "POST",
            body: JSON.stringify({ "id": row?.IDDID })
        })

        const data = await res.json()
        // console.log(data.data)
        const wasteItems = data.data
        // setWasteList(data.data)

        // console.log("i am disposing waste")
        // if (!wasteList) return
        // console.log("i am here to disposing waste")
        // console.log(wasteList)
        wasteItems?.map(async (item: any) => {
            const res = await fetch("/api/SetData/UpdateDisposedWaste", {
                method: "POST",
                body: JSON.stringify({ "WRID": item.WRID })
            })

            const data = await res.json()

            // console.log(data)
        })
    }
     
    const handleChange = (
                key: string,
                value: string
            ) => {
                setFormData((prev) => ({
                    ...prev,
                    [key]: value,
                }));
            };


    const onSubmit=async(e : React.FormEvent)=>{
        e.preventDefault();

        const payload={
             ID: id,
        TransporterName: formData.TransporterName ?? "",
        TransporterAddress: formData.TransporterAddress ?? "",
        TransporterPhone: formData.TransporterPhone ?? "",
        TransporterEmail: formData.TransporterEmail ?? "",
        VTID: formData.VehicleType ?? "",
        TransporterRegNo: formData.TransporterRegNo ?? "",
        VehicleRegNo: formData.VehicleRegNo ?? "",
        ReceiverName:formData.ReceiverName ?? "",
        ReceiverAddress: formData.ReceiverAddress ?? "",
        ReceiverAuthNo: formData.ReceiverAuthNo ?? "",
        }
        const res = await fetch("/api/SetData/UpdateFinalDisposalDetails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                    });

                    const data = await res.json();

                    // console.log(data);
                

    }


    // const saveDecision = async (stsCode: 3 | 5, label: "Accepted" | "Rejected") => {
    //     if (!row?.ID) {
    //         setDecision("Invalid row ID");
    //         return;
    //     }

    //     setSaving(true);


    //     if (stsCode == 3) {
    //         UpdateDisposedWaste()
    //     }

    //     try {
    //         console.log("Saving:", {
    //             id: row.ID,
    //             remarks,
    //             stsCode
    //         });

    //         const res = await fetch("/api/SetData/SetDisposalApproval", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 FDDID: Number(row.ID),
    //                 StsCode: stsCode,
    //                 Remarks: remarks,
    //             }),
    //         });

    //         const payload = await res.json();

    //         if (!res.ok) {
    //             setDecision(payload.message || "Failed to save disposal approval");
    //             return;
    //         }

    //         setDecision(`${label}${remarks.trim() ? ` with remarks: ${remarks.trim()}` : ""}`);

    //         if (stsCode === 3) {
    //             router.back();
    //         }

    //     } catch (err) {
    //         console.error(err);
    //         setDecision("Failed to save disposal approval");
    //     } finally {
    //         setSaving(false);
    //     }
    // };

 const iddid = row?.IDDID;


   
   useEffect(() => {
   const loadDetails = async () => {
      if (!iddid) return;

      const res = await fetch("/api/GetData/GetForm10Details", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ ID: iddid }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) return;

      const rowData = Array.isArray(data.data)
         ? data.data[0]
         : data.data;

      setRow(rowData);

      setFormData({
         ...rowData,

         TransporterName: rowData.TransporterName ?? "",
         TransporterAddress: rowData.TransporterAddress ?? "",
         TransporterPhone: rowData.TransporterPhone ?? "",
         TransporterEmail: rowData.TransporterEmail ?? "",
         TransporterRegNo: rowData.TransporterRegNo ?? "",
         VehicleType: rowData.VTID ?? "",
         VehicleRegNo: rowData.VehicleRegNo ?? "",
         ReceiverName: rowData.ReceiverName ?? "",
         ReceiverAddress: rowData.ReceiverAddress ?? "",
         ReceiverAuthNo: rowData.ReceiverAuthNo ?? "",
      });
   };

   void loadDetails();
}, [iddid]);


    useEffect(() => {
        const loadRow = async () => {
            if (!ready) return;
            if (!id) {
                setLoading(false);
                setError("Missing record id");
                return;
            }
            try {
                const res = await fetch("/api/GetData/GetAllFinalRejectedDisposalList", {
                    method: "GET",
                    cache: "no-store",
                });
                const rawData = await res.json();
                const rows = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.data) ? rawData.data : [];
                const match = rows.find((item: Record<string, unknown>) => String(item?.IDDID ?? "") === id) ?? null;
                setRow(match);
                setFormData(match || {});
                // console.log(match,"MATCH");
                if (!match) setError("Submitted disposal form not found");
            } catch {
                setError("Failed to load submitted disposal form");
            } finally {
                setLoading(false);
            }
        };

        void loadRow();
    }, [id, ready]);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full text-center">
                    <h1 className="text-2xl font-semibold text-teal-600">Disposal Approval - Non Hazardous</h1>
                    <p className="mt-2 text-sm text-slate-600">Verify the submitted non-hazardous disposal form before taking action.</p>
                </div>
                <button type="button" onClick={() => router.push("/Disposal/Approve")} className="rounded border border-slate-300 px-1 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    Back to Queue
                </button>
            </div>

            {loading && <p className="mt-4 text-sm text-slate-600">Loading submitted form...</p>}
            {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {!loading && !error && row && (
                <>
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="min-w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="border border-slate-200 px-3 py-2 text-left">Field Name</th>
                                    <th className="border border-slate-200 px-3 py-2 text-left">Submitted Value</th>
                                </tr>
                            </thead>
                            <tbody>
                {fields.map(([key, label]) => (
                    <tr key={key}>
                        <td className="border border-slate-200 px-3 py-2 align-top">
                            {label}
                        </td>

                        <td className="border border-slate-200 px-3 py-2">
                                            <input
                                                type="text"
                                                value={String(formData[key] ?? "")}
                                                onChange={(e) =>
                                                    handleChange(key, e.target.value)
                                                }
                                                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                                                    </table>
                                </div>

                    <div className="mt-4 flex justify-center">
                            <button
                                onClick={onSubmit}
                                type="submit"
                                className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
                            >
                                Submit
                            </button>
                     </div>
                </>
            )}
        </section>
    );
}