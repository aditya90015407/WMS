"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type InternalDisposalFormState = {
  disposalDate: string;
  wasteIds: string[];
  disposedTo: string;
  wasteDescription: string;
  totalQuantity: string;
  physicalForm: string;
  documentProof: File | null;
  munit: string
};

type WasteOption = {
  id: string;
};

type InternalReceiverOption = {
  IRID: string;
  IRName: string;
};

type PhysicalFormOption = {
  ID: string;
  NAME: string;
};

export default function InternalDisposalGeneratePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const params = React.use(searchParams)
  const iddid = params.id;
  // const iddid = params.get("id") ?? "";
  const [form, setForm] = useState<InternalDisposalFormState>({
    disposalDate: today,
    wasteIds: [],
    disposedTo: "",
    wasteDescription: "",
    totalQuantity: "",
    physicalForm: "",
    documentProof: null,
    munit: ""
  });
  const [disposedToOptions, setDisposedToOptions] = useState<InternalReceiverOption[]>([]);
  const [physicalFormOptions, setPhysicalFormOptions] = useState<PhysicalFormOption[]>([]);
  const [wasteOptions, setWasteOptions] = useState<WasteOption[]>([]);

  const updateField = <K extends keyof InternalDisposalFormState>(
    key: K,
    value: InternalDisposalFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [receiverRes, physicalRes] = await Promise.all([
          fetch("/api/GetData/GetInternalReciever", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/GetData/GetPhysicalForm", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

        const receiverPayload = await receiverRes.json();
        const physicalPayload = await physicalRes.json();

        if (
          !receiverRes.ok ||
          !receiverPayload.success ||
          !Array.isArray(receiverPayload.data)
        ) {
          setDisposedToOptions([]);
        } else {
          setDisposedToOptions(receiverPayload.data);
        }

        if (
          !physicalRes.ok ||
          !physicalPayload.success ||
          !Array.isArray(physicalPayload.data)
        ) {
          setPhysicalFormOptions([]);
        } else {
          setPhysicalFormOptions(physicalPayload.data);
        }
      } catch (error) {
        console.error("Failed to load internal dropdowns", error);
        setDisposedToOptions([]);
        setPhysicalFormOptions([]);
      }
    };

    void loadDropdowns();
  }, []);

  useEffect(() => {
    const loadDetails = async () => {
      if (!iddid) return;

      try {
        const res = await fetch("/api/GetData/GetInternalDisposalDetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ID: iddid }),
        });

        const payload = await res.json();
        if (!res.ok || !payload.success) return;
        console.log(payload)

        const row = Array.isArray(payload.data) ? payload.data[0] : payload.data;
        if (!row) return;

        const fetchedWasteId = String(
          row?.IDDID ?? iddid ?? row?.UID ?? row?.WID ?? row?.WasteID ?? row?.WasteId ?? "",
        ).trim();
        const fetchedWasteDescription = String(
          row?.Waste ?? row?.WasteDescription ?? row?.WasteName ?? "",
        ).trim();
        const fetchedTotalQty = String(
          row?.TotalQty ?? row?.Quantity ?? row?.WasteQty ?? "",
        ).trim();
        const fetchedMUnit = String(
          row.MUnit,
        ).trim();
        const fetchedDisposalDate = String(
          row?.DateOfDisposal ?? row?.AuctionDate ?? row?.DisposalDate ?? "",
        )
          .trim()
          .slice(0, 10);
        const fetchedDisposedTo = String(
          row?.AID ?? row?.IRID ?? row?.DisposedTo ?? "",
        ).trim();
        const fetchedPhysicalForm = String(
          row?.PSID ?? row?.PhysicalForm ?? "",
        ).trim();

        if (fetchedWasteId) {
          setWasteOptions((prev) => {
            if (prev.some((item) => item.id === fetchedWasteId)) {
              return prev;
            }

            return [
              {
                id: fetchedWasteId,
              },
              ...prev,
            ];
          });
        }

        setForm((prev) => ({
          ...prev,
          disposalDate: fetchedDisposalDate || today,
          wasteIds: fetchedWasteId ? [fetchedWasteId] : prev.wasteIds,
          disposedTo: fetchedDisposedTo,
          wasteDescription: fetchedWasteDescription,
          totalQuantity: fetchedTotalQty,
          physicalForm: fetchedPhysicalForm,
          munit: fetchedMUnit
        }));
      } catch (error) {
        console.error("Failed to load internal disposal details", error);
      }
    };

    void loadDetails();
  }, [iddid, today]);

  const onWasteIdsChange = (selectedIds: string[]) => {
    setForm((prev) => ({
      ...prev,
      wasteIds: selectedIds,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const wasteIdsArr = Array.isArray(form.wasteIds) ? form.wasteIds : [];
    const selectedReceiver = disposedToOptions.find(
      (option) => option.IRID === form.disposedTo,
    );

    const formData = new FormData();
    formData.append("IDDID", iddid!);
    formData.append("UID", String(wasteIdsArr[0] ?? ""));
    formData.append("SenderAuthNo", "");
    formData.append("TransporterName", "");
    formData.append("TransporterAddress", "");
    formData.append("TransporterPhone", "");
    formData.append("TransporterEmail", "");
    formData.append("VTID", "");
    formData.append("TransporterRegNo", "");
    formData.append("VehicleRegNo", "");
    formData.append("ReceiverName", String(selectedReceiver?.IRName ?? ""));
    formData.append("ReceiverAddress", "");
    formData.append("ReceiverAuthNo", String(form.disposedTo ?? ""));
    formData.append("TotalQty", String(Number(form.totalQuantity ?? 0)));
    formData.append("NoOfContainers", "0");
    formData.append("PSID", String(form.physicalForm ?? ""));
    formData.append("SpecialHandlingInstructions", "");
    formData.append("DateOfDisposal", String(form.disposalDate ?? today));

    if (form.documentProof instanceof File) {
      formData.append("documentProof", form.documentProof);
    }

    const res = await fetch("/api/SetData/SetFinalDisposalDetails", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      alert(result.message || "Save failed");
      return;
    }

    alert("Saved successfully");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="relative">
        <h1 className="text-xl font-semibold text-cyan-600 text-center">Disposal Generate - Internal</h1>
        <p className="mt-2 text-xs text-slate-600 text-right">Fill disposal manifest details below.</p>

        <Link href="./">
          <img src="/goback.png" alt="" className="h-5 absolute top-0 right-10" />
        </Link>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-900">
                  Field
                </th>
                <th className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-900">
                  Input
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 px-4 py-3 font-medium text-slate-900">
                  Date
                </td>
                <td className="border border-slate-200 px-4 py-3">
                  <input
                    type="date"
                    value={form.disposalDate}
                    onChange={(e) => updateField("disposalDate", e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                  />
                </td>
              </tr>

              <tr>
                <td className="border border-slate-200 px-4 py-3 font-medium text-slate-900">
                  Batch ID
                </td>
                <td className="border border-slate-200 px-4 py-3">

                  <span className="min-h-10 w-full rounded-md px-3 py-2 outline-none focus:border-slate-80"
                  >{form.wasteIds[0] ?? ""}</span>


                </td>
              </tr>

              <tr>
                <td className="border border-slate-200 px-4 py-3 font-medium text-slate-900">
                  Disposed To
                </td>
                <td className="border border-slate-200 px-4 py-3">
                  <select
                    value={form.disposedTo}
                    onChange={(e) => updateField("disposedTo", e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                  >
                    <option value="">Select disposed to</option>
                    {disposedToOptions.map((option) => (
                      <option key={option.IRID} value={option.IRID}>
                        {option.IRName}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr>
                <td className="border border-slate-200 px-4 py-3 font-medium text-slate-900">
                  Waste Description
                </td>
                <td className="border border-slate-200 px-4 py-3">
                  <input
                    readOnly
                    value={form.wasteDescription}
                    placeholder="Will automatically fetch from waste ID"
                    className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700"
                  />
                </td>
              </tr>

              <tr>
                <td className="border border-slate-200 px-4 py-3 font-medium text-slate-900">
                  Total Quantity
                </td>
                <td className="border border-slate-200 px-4 py-3">
                  <div
                    className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700"
                  >
                    {form.totalQuantity}{" "}{form.munit}
                  </div>
                  {/* <input
                    readOnly
                    value={form.totalQuantity}{form.MUnit}
                    placeholder="Quantity shall be automatically add up from ID selection"
                    className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700"
                  /> */}
                </td>
              </tr>

              <tr>
                <td className="border border-slate-200 px-4 py-3 font-medium text-slate-900">
                  Physical Form
                </td>
                <td className="border border-slate-200 px-4 py-3">
                  <select
                    value={form.physicalForm}
                    onChange={(e) => updateField("physicalForm", e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                  >
                    <option value="">Select physical form</option>
                    {physicalFormOptions.map((option) => (
                      <option key={option.ID} value={option.ID}>
                        {option.NAME}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr>
                <td className="border border-slate-200 px-4 py-3 font-medium text-slate-900">
                  Document Proof
                </td>
                <td className="border border-slate-200 px-4 py-3">
                  <input
                    type="file"
                    accept=".pdf,.jpeg,.jpg,.png"
                    onChange={(e) =>
                      updateField("documentProof", e.target.files?.[0] ?? null)
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </td>
              </tr>

              <tr>
                <td className="border border-slate-200 px-4 py-3 font-medium text-slate-900">
                  Submit
                </td>
                <td className="border border-slate-200 px-4 py-3">
                  <button
                    type="submit"
                    className="rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
                  >
                    Submit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </section >
  );
}
