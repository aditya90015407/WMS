"use client";

import { POST } from "@/app/api/DownloadAttachments/route";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

type FinalDisposalRow = Record<string, unknown>;

const toDisplayValue = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "-";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
};

export default function DisposalApproveHazardousPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const router = useRouter();
    // const params = useSearchParams();

    const params = React.use(searchParams);
    const id = params.id;

    const [row, setRow] = useState<FinalDisposalRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [remarks, setRemarks] = useState("");
    const [decision, setDecision] = useState("");
    const [saving, setSaving] = useState(false);
    const [form10Row, setForm10Row] = useState<Record<string, unknown> | null>(null);
    const [vendorDetail, setVendorDetails] = useState<Record<string, unknown> | null>(null);


    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const saveDecision = async (stsCode: 3 | 5, label: "Accepted" | "Rejected") => {
        if (!row?.ID) return;

        setSaving(true);
        try {
            const res = await fetch("/api/SetData/SetDisposalApproval", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    FDDID: Number(row.ID),
                    StsCode: stsCode,
                    Remarks: remarks,
                }),
            });

            const payload = await res.json();

            if (!res.ok || !payload.success) {
                setDecision(payload.message || "Failed to save disposal approval");
                return;
            }

            setDecision(`${label}${remarks.trim() ? ` with remarks: ${remarks.trim()}` : ""}`);

            if (stsCode == 3 && row?.ID) {
                router.push(`/Form/Form10?fddid=${row.ID}&iddid=${row.IDDID}`)

            }
        } catch (err) {
            console.error("Failed to save disposal approval", err);
            setDecision("Failed to save disposal approval");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        const loadRow = async () => {
            if (!id) {

                setLoading(false);
                setError("Missing record id");
                return;
            }

            try {
                const res = await fetch("/api/GetData/GetAllFinalDisposalList", {
                    method: "GET",
                    cache: "no-store",
                });

                const rawData = await res.json();
                const rows = Array.isArray(rawData)
                    ? rawData
                    : Array.isArray(rawData?.data)
                        ? rawData.data
                        : [];

                const match =
                    rows.find((item: Record<string, unknown>) => String(item?.ID ?? "") === id) ?? null;
                console.log("Page id:", id);
                console.log("Rows:", rows);
                console.log("Matched row:", match);

                setRow(match);

                if (!match) {
                    setError("Submitted disposal form not found");
                }
            } catch {
                setError("Failed to load submitted disposal form");
            } finally {
                setLoading(false);
            }
        };

        void loadRow();
    }, [id]);

    useEffect(() => {
        const loadForm10Details = async () => {
            if (!row?.IDDID) return;

            try {
                const res = await fetch("/api/GetData/GetForm10Details", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ID: String(row.IDDID) }),
                });

                const payload = await res.json();
                //   console.log("GetForm10Details payload:", payload);

                if (!res.ok || !payload.success) {
                    setForm10Row(null);
                    return;
                }

                const formRow = Array.isArray(payload.data) ? payload.data[0] : payload.data;
                setForm10Row(formRow ?? null);
            } catch (error) {
                console.error("Failed to load Form 10 details", error);
                setForm10Row(null);
            }
        };

        void loadForm10Details();
    }, [row?.IDDID]);


    useEffect(() => {
        const loadVendorDetails = async () => {
            if (!row?.IDDID) {
                return;
            }
            try {
                const res = await fetch("/api/GetData/GetSelectedVendorDetails", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ID: String(row.IDDID) }),
                });
                const payload = await res.json();
                // console.log("Vendor Details:",payload.data);
                if (!res.ok || !payload.success) {
                    setVendorDetails(null);
                    return;
                }
                const vendorRow = Array.isArray(payload.data) ? payload.data[0] : payload.data;
                setVendorDetails(vendorRow ?? null);
            } catch (error) {
                console.log("Failed to load Details", error);
                setVendorDetails(null);
            }
        };
        void loadVendorDetails();

    }, [row?.IDDID]);



    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Disposal Approval - Hazardous
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Verify the submitted hazardous disposal form before taking action.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => router.push("/Disposal/Approve")}
                    className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                    Back to Queue
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
                                <p><span className="font-medium">Physical Form:</span> {toDisplayValue(row.PSID)}</p>
                                <p><span className="font-medium">Waste Category ID:</span> {toDisplayValue(row.WCID)}</p>
                                <p><span className="font-medium">Waste ID:</span> {toDisplayValue(row.WID)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <h2 className="text-sm font-semibold text-slate-900">Vendor / Recycler Details</h2>
                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                                <p><span className="font-medium">Name:</span> {String(vendorDetail?.NAME ?? "-")}</p>
                                <p><span className="font-medium">Email:</span> {String(vendorDetail?.EMAIL ?? "-")}</p>
                                <p><span className="font-medium">Vendor ID:</span> {String(vendorDetail?.VID ?? "-")}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <h2 className="text-sm font-semibold text-slate-900">Receiver Details</h2>
                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                                <p><span className="font-medium">Receiver Name:</span> {String(form10Row?.ReceiverName ?? row?.ReceiverName ?? "-")}</p>
                                <p><span className="font-medium">Receiver Address:</span> {String(form10Row?.ReceiverAddress ?? row?.ReceiverAddress ?? "-")}</p>
                                <p><span className="font-medium">Receiver Auth No.:</span> {String(form10Row?.ReceiverAuthNo ?? row?.ReceiverAuthNo ?? "-")}</p>
                            </div>
                        </div>

                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <h2 className="text-sm font-semibold text-slate-900">Transport Details</h2>
                        <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm text-slate-700">
                            <p><span className="font-medium">Transporter Name:</span> {String(form10Row?.TransporterName ?? row?.TransporterName ?? "-")}</p>
                            <p><span className="font-medium">Transporter Address:</span> {String(form10Row?.TransporterAddress ?? row?.TransporterAddress ?? "-")}</p>
                            <p><span className="font-medium">Transporter Phone:</span> {String(form10Row?.TransporterPhone ?? row?.TransporterPhone ?? "-")}</p>
                            <p><span className="font-medium">Transporter Email:</span> {String(form10Row?.TransporterEmail ?? row?.TransporterEmail ?? "-")}</p>
                            <p><span className="font-medium">Vehicle Type:</span> {String(form10Row?.VehicleType ?? "-")}</p>
                            <p><span className="font-medium">Transporter Reg No.:</span> {String(form10Row?.TransporterRegNo ?? row?.TransporterRegNo ?? "-")}</p>
                            <p><span className="font-medium">Vehicle Reg No.:</span> {String(form10Row?.VehicleRegNo ?? row?.VehicleRegNo ?? "-")}</p>
                            <p><span className="font-medium">Manifest Document No.:</span> {String(form10Row?.ManifestDocumentNo ?? "-")}</p>
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

                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h2 className="text-sm font-semibold text-slate-900">Accept / Reject</h2>
                        <p className="mt-1 text-xs text-slate-600">
                            Add remarks and choose the action for this submitted form.
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Review Date: {today}</p>

                        <textarea
                            rows={4}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter approval or rejection remarks"
                            className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                        />

                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => void saveDecision(3, "Accepted")}
                                className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800 disabled:opacity-60"
                            >
                                Accept
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => void saveDecision(5, "Rejected")}
                                className="rounded bg-rose-700 px-4 py-2 text-white hover:bg-rose-800 disabled:opacity-60"
                            >
                                Reject
                            </button>
                        </div>

                        {decision ? (
                            <div className="mt-4 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                                {decision}
                            </div>
                        ) : null}
                    </div>
                </>
            )}
        </section>
    );
}
