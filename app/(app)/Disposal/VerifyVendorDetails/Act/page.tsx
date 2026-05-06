"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type ParticipantDetails = {
    APID?: string |number;
  IDDID?: string | number;
  VID?: string | number;
  WasteCategory?: string;
  Waste?: string;
  TotalQty?: string | number;
  NAME?: string;
  EMAIL?: string;
  VendorCode?: string;
  TransporterName?: string;
  TransporterAddress?: string;
  TransporterPhone?: string;
  TransporterEmail?: string;
  VehicleType?: string;
  VTID?: string | number;
  TransporterRegNo?: string;
  VehicleRegNo?: string;
  ReceiverName?: string;
  ReceiverAddress?: string;
  ReceiverAuthNo?: string;
  Remarks?: string;
};

export default function VerifyVendorDetailsActPage({ searchParams }: { searchParams: Promise<{vid: string, iddid?: string }> }) {
  const router = useRouter();
  // const params = useSearchParams();
  
    const params = React.use(searchParams)

  const iddid =params.iddid
  const vid = params.vid
//    const apid;


  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState("");

  const [formValues, setFormValues] = useState<ParticipantDetails>({
    IDDID: "",
    VID: "",
    WasteCategory: "",
    Waste: "",
    TotalQty: "",
    NAME: "",
    EMAIL: "",
    VendorCode: "",
    TransporterName: "",
    TransporterAddress: "",
    TransporterPhone: "",
    TransporterEmail: "",
    VehicleType: "",
    VTID: "",
    TransporterRegNo: "",
    VehicleRegNo: "",
    ReceiverName: "",
    ReceiverAddress: "",
    ReceiverAuthNo: "",
    Remarks: "",
  });

  useEffect(() => {
    const loadDetails = async () => {
         console.log(iddid,vid);
      if (!iddid || !vid) {
        setLoading(false);
        setError("Missing IDDID or VID");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/GetData/GetAuctionParticipantDetailsForSelectedAuction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            IDDID: iddid,
            VID: vid,
          }),
        });

        const payload = await res.json();

        if (!res.ok || !payload.success) {
          setError(payload.message || "Failed to load participant details");
          return;
        }

        const row = Array.isArray(payload.data) ? payload.data[0] : payload.data;
        console.log(payload)
        // const apid=row?.APID;

        setFormValues({
          APID: row?.APID,
          IDDID: row?.IDDID ?? iddid,
          VID: row?.VID ?? vid,
          WasteCategory: row?.WasteCategory ?? "",
          Waste: row?.Waste ?? "",
          TotalQty: row?.TotalQty ?? "",
          NAME: row?.Name ?? "",
          EMAIL: row?.Email ?? "",
          VendorCode: row?.VendorCode ?? "",
          TransporterName: row?.TransporterName ?? "",
          TransporterAddress: row?.TransporterAddress ?? "",
          TransporterPhone: row?.TransporterPhone ?? "",
          TransporterEmail: row?.TransporterEmail ?? "",
          VehicleType: row?.VehicleType ?? "",
          VTID: row?.VTID ?? "",
          TransporterRegNo: row?.TransporterRegNo ?? "",
          VehicleRegNo: row?.VehicleRegNo ?? "",
          ReceiverName: row?.ReceiverName ?? "",
          ReceiverAddress: row?.ReceiverAddress ?? "",
          ReceiverAuthNo: row?.ReceiverAuthNo ?? "",
          Remarks: row?.Remarks ?? "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load participant details");
      } finally {
        setLoading(false);
      }
    };

    void loadDetails();
  }, [iddid, vid]);


  const updateField = (key: keyof ParticipantDetails, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  
  const handleSave = async () => {
    try {
      setSaving(true);
      setDecision("");
       console.log(formValues)
      const res = await fetch("/api/SetData/SetTransportationDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        setDecision(payload.message || "Failed to save details");
        return;
      }

      setDecision("Details updated successfully");
    } catch (err) {
      console.error(err);
      setDecision("Failed to save details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Verify Vendor Details</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review and edit the selected auction participant details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/Disposal/VerifyVendorDetails")}
          className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Back to List
        </button>
      </div>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading details...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Waste Details</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">IDDID</label>
                <input
                  value={String(formValues.IDDID ?? "")}
                  readOnly
                  className="w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">VID</label>
                <input
                  value={String(formValues.VID ?? "")}
                  readOnly
                  className="w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Waste Category</label>
                <input
                  value={String(formValues.WasteCategory ?? "")}
                  onChange={(e) => updateField("WasteCategory", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Waste</label>
                <input
                  value={String(formValues.Waste ?? "")}
                  onChange={(e) => updateField("Waste", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Total Quantity</label>
                <input
                  value={String(formValues.TotalQty ?? "")}
                  onChange={(e) => updateField("TotalQty", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Vendor Details</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Name</label>
                <input
                  value={String(formValues.NAME ?? "")}
                  onChange={(e) => updateField("NAME", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Email</label>
                <input
                  value={String(formValues.EMAIL ?? "")}
                  onChange={(e) => updateField("EMAIL", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Vendor Code</label>
                <input
                  value={String(formValues.VendorCode ?? "")}
                  onChange={(e) => updateField("VendorCode", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Receiver Details</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Receiver Name</label>
                <input
                  value={String(formValues.ReceiverName ?? "")}
                  onChange={(e) => updateField("ReceiverName", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Receiver Auth No.</label>
                <input
                  value={String(formValues.ReceiverAuthNo ?? "")}
                  onChange={(e) => updateField("ReceiverAuthNo", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-900">Receiver Address</label>
                <textarea
                  rows={3}
                  value={String(formValues.ReceiverAddress ?? "")}
                  onChange={(e) => updateField("ReceiverAddress", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Transporter Details</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Transporter Name</label>
                <input
                  value={String(formValues.TransporterName ?? "")}
                  onChange={(e) => updateField("TransporterName", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Transporter Phone</label>
                <input
                  value={String(formValues.TransporterPhone ?? "")}
                  onChange={(e) => updateField("TransporterPhone", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Transporter Email</label>
                <input
                  value={String(formValues.TransporterEmail ?? "")}
                  onChange={(e) => updateField("TransporterEmail", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Vehicle Type</label>
                <input
                  value={String(formValues.VehicleType ?? formValues.VTID ?? "")}
                  onChange={(e) => updateField("VehicleType", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Transporter Reg No.</label>
                <input
                  value={String(formValues.TransporterRegNo ?? "")}
                  onChange={(e) => updateField("TransporterRegNo", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Vehicle Reg No.</label>
                <input
                  value={String(formValues.VehicleRegNo ?? "")}
                  onChange={(e) => updateField("VehicleRegNo", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-900">Transporter Address</label>
                <textarea
                  rows={3}
                  value={String(formValues.TransporterAddress ?? "")}
                  onChange={(e) => updateField("TransporterAddress", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Remarks</h2>
            <textarea
              rows={4}
              value={String(formValues.Remarks ?? "")}
              onChange={(e) => updateField("Remarks", e.target.value)}
              className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSave()}
                className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                Save Details
              </button>
            </div>

            {decision ? (
              <div className="mt-4 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                {decision}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
