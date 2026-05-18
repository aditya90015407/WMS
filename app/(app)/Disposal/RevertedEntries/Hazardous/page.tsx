"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import decrypt from "@/components/Decrypt";

type FinalDisposalRow = Record<string, unknown>;

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

const toDisplayValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export default function DisposalApproveHazardousPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const router = useRouter();
  // const searchParams = useSearchParams();
  const params=React.use(searchParams)

  const encryptedId = params.id;

  const [id, setId] = useState("");
  const [ready, setReady] = useState(false);

  const [row, setRow] = useState<FinalDisposalRow | null>(null);

  const [form10Row, setForm10Row] = useState<Form10Row | null>(null);

  // editable values
  const [values, setValues] = useState<Form10Row>({});

  const [vendorDetail, setVendorDetails] =
    useState<Record<string, unknown> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [remarks, setRemarks] = useState("");
  const [decision, setDecision] = useState("");
  const [saving, setSaving] = useState(false);

  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  // decrypt id
  useEffect(() => {
    const handleDecrypt = async () => {
      const decryptedId = encryptedId
        ? (await decrypt(encryptedId)) ?? ""
        : "";

      setId(decryptedId);
      setReady(true);
    };

    void handleDecrypt();
  }, [encryptedId]);

  // load main row
  useEffect(() => {
    const loadRow = async () => {
      if (!ready) return;

      if (!id) {
        setLoading(false);
        setError("Missing record id");
        return;
      }

      try {
        const res = await fetch(
          "/api/GetData/GetAllFinalRejectedDisposalList",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const rawData = await res.json();

        const rows = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data)
          ? rawData.data
          : [];

        const match =
          rows.find(
            (item: Record<string, unknown>) =>
              String(item?.IDDID ?? "") === id
          ) ?? null;

        console.log("Page id:", id);
        console.log("Rows:", rows);
        console.log("Matched row:", match);

        setRow(match);

        if (!match) {
          setError("Submitted disposal form not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load submitted disposal form");
      } finally {
        setLoading(false);
      }
    };

    void loadRow();
  }, [id, ready]);

  // load form10 details
  useEffect(() => {
    const loadForm10Details = async () => {
      if (!row?.IDDID) return;

      try {
        const res = await fetch("/api/GetData/GetForm10Details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ID: String(row.IDDID),
          }),
        });

        const payload = await res.json();

        console.log("GetForm10Details payload:", payload);

        if (!res.ok || !payload.success) {
          setForm10Row(null);
          return;
        }

        const formRow = Array.isArray(payload.data)
          ? payload.data[0]
          : payload.data;

        setForm10Row(formRow ?? null);

       
        setValues(formRow ?? {});
      } catch (error) {
        console.error("Failed to load Form 10 details", error);
        setForm10Row(null);
      }
    };

    void loadForm10Details();
  }, [row?.IDDID]);

  // load vendor details
  useEffect(() => {
    const loadVendorDetails = async () => {
      if (!row?.IDDID) return;

      try {
        const res = await fetch(
          "/api/GetData/GetSelectedVendorDetails",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ID: String(row.IDDID),
            }),
          }
        );

        const payload = await res.json();

        if (!res.ok || !payload.success) {
          setVendorDetails(null);
          return;
        }

        const vendorRow = Array.isArray(payload.data)
          ? payload.data[0]
          : payload.data;

        setVendorDetails(vendorRow ?? null);
      } catch (error) {
        console.error("Failed to load vendor details", error);
        setVendorDetails(null);
      }
    };

    void loadVendorDetails();
  }, [row?.IDDID]);

  // update field helper
  const updateValue = (
    key: keyof Form10Row,
    value: string
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // update disposed waste
  async function UpdateDisposedWaste() {
    if (!row?.IDDID) return;

    try {
      const res = await fetch(
        "/api/GetData/GetWasteListByIDDID",
        {
          method: "POST",
          body: JSON.stringify({
            id: row.IDDID,
          }),
        }
      );

      const data = await res.json();

      const wasteItems = data.data ?? [];

      await Promise.all(
        wasteItems.map((item: any) =>
          fetch("/api/SetData/UpdateDisposedWaste", {
            method: "POST",
            body: JSON.stringify({
              WRID: item.WRID,
            }),
          })
        )
      );
    } catch (error) {
      console.error("Failed to update disposed waste", error);
    }
  }
  console.log(values)
  // submit
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     
    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("ID", id);

      formData.append(
        "TransporterName",
        String(values.TransporterName ?? "")
      );

      formData.append(
        "TransporterAddress",
        String(values.TransporterAddress ?? "")
      );

      formData.append(
        "TransporterPhone",
        String(values.TransporterPhone ?? "")
      );

      formData.append(
        "TransporterEmail",
        String(values.TransporterEmail ?? "")
      );

      formData.append(
        "VTID",
        String(values.VehicleType ?? "")
      );

      formData.append(
        "TransporterRegNo",
        String(values.TransporterRegNo ?? "")
      );

      formData.append(
        "VehicleRegNo",
        String(values.VehicleRegNo ?? "")
      );

      formData.append(
        "ReceiverName",
        String(values.ReceiverName ?? "")
      );

      formData.append(
        "ReceiverAddress",
        String(values.ReceiverAddress ?? "")
      );

      formData.append(
        "ReceiverAuthNo",
        String(values.ReceiverAuthNo ?? "")
      );

      const payload = {
        ID: id,
        TransporterName: values.TransporterName ?? "",
        TransporterAddress: values.TransporterAddress ?? "",
        TransporterPhone: values.TransporterPhone ?? "",
        TransporterEmail: values.TransporterEmail ?? "",
        VTID: values.VehicleType ?? "",
        TransporterRegNo: values.TransporterRegNo ?? "",
        VehicleRegNo: values.VehicleRegNo ?? "",
        ReceiverName: values.ReceiverName ?? "",
        ReceiverAddress: values.ReceiverAddress ?? "",
        ReceiverAuthNo: values.ReceiverAuthNo ?? "",
        };

    // console.log("Payload for submission:", payload);
      const res = await fetch(
        "/api/SetData/UpdateFinalDisposalDetails",
        {
          method: "POST",
           headers: {
            "Content-Type": "application/json",
            },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        alert(result.message );
        return;
      }

      alert("Saved successfully");

      console.log(result);
    } catch (error) {
      console.error("Submit failed", error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full ">
                    <h1 className="text-2xl font-semibold text-teal-600 text-center">
                        Disposal Approval - Hazardous
                    </h1>
                    <p className="mt-2 text-sm text-slate-600 text-center">
                        Verify the submitted hazardous disposal form before taking action.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => router.push("/Disposal/")}
                    className="rounded border border-slate-300 px-1 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                    <img src="/goback.png" alt="" className="h-6 absolute top-4 right-10" />
                </button>
            </div>

            {loading && <p className="mt-4 text-sm text-slate-600">Loading submitted form...</p>}
            {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {!loading && !error && row && (
                <>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <h2 className="text-sm font-semibold text-slate-900">Approval Summary</h2>
                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                                <p><span className="font-medium">Final Disposal Ref No.:</span> {toDisplayValue(row.ID)}</p>
                                <p><span className="font-medium">Original Disposal ID:</span> {toDisplayValue(row.IDDID)}</p>
                                <p><span className="font-medium">Current Status:</span> {toDisplayValue(row.Status)}</p>
                                <p><span className="font-medium">Created By:</span> {toDisplayValue(row.CrBy)}</p>
                                <p><span className="font-medium">Created On:</span> {toDisplayValue(row.CrDt)}</p>
                                <p><span className="font-medium">Updated By:</span> {toDisplayValue(row.UpBy)}</p>
                                <p><span className="font-medium">Updated On:</span> {toDisplayValue(row.UpDt)}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <h2 className="text-sm font-semibold text-slate-900">Waste Details</h2>
                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                                <p><span className="font-medium">Waste Category:</span> {toDisplayValue(row.WasteCategory)}</p>
                                <p><span className="font-medium">Waste:</span> {toDisplayValue(row.Waste)}</p>
                                <p><span className="font-medium">Total Quantity:</span> {toDisplayValue(row.TotalQty)}</p>
                                <p><span className="font-medium">Physical Form:</span> {toDisplayValue(row.PhysicalState)}</p>
                                <p><span className="font-medium">Waste Category ID:</span> {toDisplayValue(row.WCID)}</p>
                                <p><span className="font-medium">Waste ID:</span> {toDisplayValue(row.WID)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                       <div className="flex flex-col">
                            <h2 className="text-sm font-semibold text-slate-900">Vendor / Recycler Details</h2>
                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                                <p><span className="font-medium">Name:</span> {String(vendorDetail?.NAME ?? "-")}</p>
                                <p><span className="font-medium">Email:</span> {String(vendorDetail?.EMAIL ?? "-")}</p>
                                <p><span className="font-medium">Vendor ID:</span> {String(vendorDetail?.VID ?? "-")}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <h2 className="text-sm font-semibold text-slate-900">Receiver Details</h2>
                            <div className="flex flex-col">
                                <span className="font-medium">Receiver Name:</span> 
                                <input
                                  type="text"
                                  value = {form10Row?.ReceiverName}
                                  onChange={(e)=>
                                    setForm10Row({
                                        ...form10Row,
                                        ReceiverName : e.target.value,
                                    })
                                  }
                                   className="mt-1 rounded border border-slate-300 px-2 py-1"
                                />
                                
                                <span className="font-medium">Receiver Address:</span> 
                                <input
                                 type ="text"
                                 value ={form10Row?.ReceiverAddress}
                                 onChange={(e)=>
                                    setForm10Row({
                                        ...form10Row,
                                        ReceiverAddress : e.target.value,
                                    })
                                   }
                                   className="mt-1 rounded border border-slate-300 px-2 py-1"   
                                />
                                
                              
                                <span className="font-medium">Receiver Auth No.:</span> 
                                <input
                                type="text"
                                value ={form10Row?.ReceiverAuthNo}
                                onChange={(e)=>
                                    setForm10Row({
                                        ...form10Row,
                                        ReceiverAuthNo : e.target.value,
                                    })
                                }
                                />
                            </div>
                        </div>

                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <h2 className="text-sm font-semibold text-slate-900">
                            Transport Details
                        </h2>

                <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm text-slate-700">

                    <div className="flex flex-col">
                    <span className="font-medium">Transporter Name:</span>

                    <input
                        type="text"
                        value={form10Row?.TransporterName ?? ""}
                        onChange={(e) =>
                        setForm10Row({
                            ...form10Row,
                            TransporterName: e.target.value,
                        })
                        }
                        className="mt-1 rounded border border-slate-300 px-2 py-1"
                    />
                    </div>

                    <div className="flex flex-col">
                    <span className="font-medium">Transporter Address:</span>

                    <input
                        type="text"
                        value={form10Row?.TransporterAddress ?? ""}
                        onChange={(e) =>
                        setForm10Row({
                            ...form10Row,
                            TransporterAddress: e.target.value,
                        })
                        }
                        className="mt-1 rounded border border-slate-300 px-2 py-1"
                    />
                    </div>

                    <div className="flex flex-col">
                    <span className="font-medium">Transporter Phone:</span>

                    <input
                        type="text"
                        value={form10Row?.TransporterPhone ?? ""}
                        onChange={(e) =>
                        setForm10Row({
                            ...form10Row,
                            TransporterPhone: e.target.value,
                        })
                        }
                        className="mt-1 rounded border border-slate-300 px-2 py-1"
                    />
                    </div>

                    <div className="flex flex-col">
                    <span className="font-medium">Transporter Email:</span>

                    <input
                        type="email"
                        value={form10Row?.TransporterEmail ?? ""}
                        onChange={(e) =>
                        setForm10Row({
                            ...form10Row,
                            TransporterEmail: e.target.value,
                        })
                        }
                        className="mt-1 rounded border border-slate-300 px-2 py-1"
                    />
                    </div>

                    <div className="flex flex-col">
                    <span className="font-medium">Vehicle Type:</span>

                    <input
                        type="text"
                        value={form10Row?.VehicleType ?? ""}
                        onChange={(e) =>
                        setForm10Row({
                            ...form10Row,
                            VehicleType: e.target.value,
                        })
                        }
                        className="mt-1 rounded border border-slate-300 px-2 py-1"
                    />
                    </div>

                    <div className="flex flex-col">
                    <span className="font-medium">Transporter Reg No.:</span>

                    <input
                        type="text"
                        value={form10Row?.TransporterRegNo ?? ""}
                        onChange={(e) =>
                        setForm10Row({
                            ...form10Row,
                            TransporterRegNo: e.target.value,
                        })
                        }
                        className="mt-1 rounded border border-slate-300 px-2 py-1"
                    />
                    </div>

                    <div className="flex flex-col">
                    <span className="font-medium">Vehicle Reg No.:</span>

                    <input
                        type="text"
                        value={form10Row?.VehicleRegNo ?? ""}
                        onChange={(e) =>
                        setForm10Row({
                            ...form10Row,
                            VehicleRegNo: e.target.value,
                        })
                        }
                        className="mt-1 rounded border border-slate-300 px-2 py-1"
                    />
                    </div>

                    <div className="flex flex-col">
                    <span className="font-medium">Manifest Document No.:</span>

                    <input
                        type="text"
                        value={form10Row?.ManifestDocumentNo ?? ""}
                        onChange={(e) =>
                        setForm10Row({
                            ...form10Row,
                            ManifestDocumentNo: e.target.value,
                        })
                        }
                        className="mt-1 rounded border border-slate-300 px-2 py-1"
                    />
                    </div>

                </div>
                </div>


                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <h2 className="text-sm font-semibold text-slate-900">Full Submitted Record</h2>
                        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
                            <table className="min-w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="border border-slate-200 px-3 py-2 text-left">Field</th>
                                        <th className="border border-slate-200 px-3 py-2 text-left">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(row).map(([key, value]) => (
                                        <tr key={key}>
                                            <td className="border border-slate-200 px-3 py-2 font-medium text-slate-900">
                                                {key}
                                            </td>
                                            <td className="border border-slate-200 px-3 py-2 text-slate-700">
                                                {toDisplayValue(value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
