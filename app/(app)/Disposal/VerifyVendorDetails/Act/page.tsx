"use client";

import { redirect, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type ParticipantDetails = {
  APID?: string | number;
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
  MUnit: string
  MUID: string
};

export default function VerifyVendorDetailsActPage({ searchParams }: { searchParams: Promise<{ iddid?: string, vid: string }> }) {
  const router = useRouter();
  // const params = useSearchParams();
  const params = React.use(searchParams)

  const iddid = params.iddid;
  const vid = params.vid;
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
    MUnit: "",
    MUID: ""
  });

  useEffect(() => {
    const loadDetails = async () => {
      // console.log(iddid, vid);
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
        // console.log(payload)
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
          MUnit: row.MUnit,
          MUID: row.MUID
        });
      } catch (err) {
        // console.error(err);
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
      // console.log(formValues)
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

      const res2 = await fetch("/api/SetData/VerifyVendorDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "VendorDetailsVerified": 1, "IDDID": formValues.IDDID }),
      });

      const data = await res2.json();

      // console.log(data)

      if (!res.ok || !payload.success) {
        setDecision(payload.message || "Failed to save details");
        return;
      }


      setDecision("Details updated successfully");
      router.back()
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
        <div className="w-full">
          <h1 className="text-lg font-semibold text-teal-600 text-center">Verify Vendor Details</h1>
          <p className="text-xs text-slate-600 text-center">
            Review and edit the selected auction participant details.
          </p>
        </div>


        <img src="/goback.png" alt="" className="h-5 me-2 cursor-pointer"
          onClick={() => redirect("./")} />

        <img src="/refresh.png" alt="" className="h-4.5 me-3 cursor-pointer"
          onClick={() => window.location.reload()}
        />
      </div>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading details...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 space-y-3">
          <div className="rounded-xl border border-slate-200  p-4 py-2">
            <h2 className="text-sm font-semibold text-cyan-600">Auction Details</h2>
            <div className="mt-0 grid  md:grid-cols-4">
              <div className="px-5 py-1 text-xs ">
                <label className="mb-1 block text-xs font-semibold text-slate-600">Auction ID</label>
                <input
                  value={String(formValues.IDDID ?? "")}
                  readOnly
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              {/* <div className="px-5 py-1 text-xs">
                <label className="mb-1 block text-sm font-medium text-slate-600">VID</label>
                <input
                  value={String(formValues.VID ?? "")}
                  readOnly
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                />
              </div> */}

              <div className="px-5 py-1 text-xs">
                <label className="mb-1 block text-xs font-semibold text-slate-600">Waste Category</label>
                <input
                  value={String(formValues.WasteCategory ?? "")}
                  readOnly
                  onChange={(e) => updateField("WasteCategory", e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="px-5 py-1 text-xs">
                <label className="mb-1 block text-xs font-semibold text-slate-600">Waste</label>
                <input
                  value={String(formValues.Waste ?? "")}
                  onChange={(e) => updateField("Waste", e.target.value)}
                  readOnly
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="px-5 py-1 text-xs">
                <label className="mb-1 block text-xs font-semibold text-slate-600">Total Quantity</label>
                <div
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                >
                  {String(formValues.TotalQty ?? "")}{" "}{formValues.MUnit}
                </div>
                {/* <input
                  value={String(formValues.TotalQty ?? "")}
                  onChange={(e) => updateField("TotalQty", e.target.value)}
                  readOnly
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                /> */}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 py-2">
            <h2 className="text-sm font-semibold text-cyan-600">Vendor Details</h2>
            <div className="mt-0 grid  md:grid-cols-3">
              <div className="px-5 py-1 text-xs ">
                <label className="mb-1 block text-xs font-semibold text-slate-600">Name</label>
                <input
                  value={String(formValues.NAME ?? "")}
                  readOnly
                  onChange={(e) => updateField("NAME", e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="px-5 py-1 text-xs ">
                <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
                <input
                  value={String(formValues.EMAIL ?? "")}
                  readOnly
                  onChange={(e) => updateField("EMAIL", e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="px-5 py-1 text-xs ">
                <label className="mb-1 block text-xs font-semibold text-slate-600">Vendor Code</label>
                <input
                  value={String(formValues.VendorCode ?? "")}
                  readOnly
                  onChange={(e) => updateField("VendorCode", e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>



          <div className="rounded-xl border border-slate-200 bg-white p-4 py-2">
            <h2 className="text-sm font-semibold text-cyan-600">Transporter Details</h2>
            <div className="mt-0 grid  md:grid-cols-4">
              <div className="px-5 py-1 text-xs ">
                <label className="mb-1 block font-semibold text-slate-600">Transporter Name</label>
                <input
                  value={String(formValues.TransporterName ?? "")}
                  onChange={(e) => updateField("TransporterName", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="px-5 py-1 text-xs ">
                <label className="mb-1 block font-semibold text-slate-600">Transporter Phone</label>
                <input
                  value={String(formValues.TransporterPhone ?? "")}
                  onChange={(e) => updateField("TransporterPhone", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="px-5 py-1 text-xs ">
                <label className="mb-1 block font-semibold text-slate-600">Transporter Email</label>
                <input
                  value={String(formValues.TransporterEmail ?? "")}
                  onChange={(e) => updateField("TransporterEmail", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="px-5 py-1 text-xs ">
                <label className="mb-1 block font-semibold text-slate-600">Vehicle Type</label>
                <input
                  value={String(formValues.VehicleType ?? formValues.VTID ?? "")}
                  onChange={(e) => updateField("VehicleType", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="px-5 py-1 text-xs ">
                <label className="mb-1 block font-semibold text-slate-600">Transporter Reg No.</label>
                <input
                  value={String(formValues.TransporterRegNo ?? "")}
                  onChange={(e) => updateField("TransporterRegNo", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="px-5 py-1 text-xs ">
                <label className="mb-1 block font-semibold text-slate-600">Vehicle Reg No.</label>
                <input
                  value={String(formValues.VehicleRegNo ?? "")}
                  onChange={(e) => updateField("VehicleRegNo", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="md:col-span-4 px-5 py-1 text-xs ">
                <label className="mb-1 block font-semibold text-slate-600">Transporter Address</label>
                <textarea
                  rows={3}
                  value={String(formValues.TransporterAddress ?? "")}
                  onChange={(e) => updateField("TransporterAddress", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 py-2">
            <h2 className="text-sm font-semibold text-cyan-600">Receiver Details</h2>
            <div className="mt-0 grid  md:grid-cols-3">
              <div className="px-5 py-1 text-xs ">
                <label className="mb-1 block  font-semibold text-slate-600">Receiver Name</label>
                <input
                  value={String(formValues.ReceiverName ?? "")}
                  onChange={(e) => updateField("ReceiverName", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="px-5 py-1 text-xs ">
                <label className="mb-1 block font-semibold text-slate-600">Receiver Auth No.</label>
                <input
                  value={String(formValues.ReceiverAuthNo ?? "")}
                  onChange={(e) => updateField("ReceiverAuthNo", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="px-5 py-1 text-xs md:col-span-3">
                <label className="mb-1 block font-semibold text-slate-600">Receiver Address</label>
                <textarea
                  rows={2}
                  value={String(formValues.ReceiverAddress ?? "")}
                  onChange={(e) => updateField("ReceiverAddress", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="w-full">
            {/* <h2 className="text-sm font-semibold text-slate-700">Remarks</h2>
            <textarea
              rows={2}
              value={String(formValues.Remarks ?? "")}
              onChange={(e) => updateField("Remarks", e.target.value)}
              className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            /> */}

            <div className="mt-4 place-self-center">
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSave()}
                className="cursor-pointer text-sm text-center rounded bg-emerald-700 px-3 py-2 text-white hover:bg-emerald-800 disabled:opacity-60"
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
