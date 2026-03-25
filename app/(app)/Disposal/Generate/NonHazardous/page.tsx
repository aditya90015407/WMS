"use client";

import React, { useMemo, useState } from "react";

type FieldType =
  | "date"
  | "multi-select"
  | "select"
  | "text"
  | "textarea"
  | "number"
  | "phone-email"
  | "file"
  | "auto";

type RowDef = {
  key: string;
  field: string;
  type: FieldType;
  options?: string[];
  hint?: string;
};

const rows: RowDef[] = [
  { key: "disposalDate", field: "Date", type: "date", hint: "Date of disposal (within 90 days of generation)" },
  { key: "wasteIds", field: "Waste ID/Batch ID", type: "multi-select", hint: "Comma separated IDs" },
  {
    key: "senderNameAddress",
    field: "Sender's Name & Mailing Address (including phone no. and e-mail)",
    type: "select",
    options: [
      "Jindal Stainless Limited KNIC, Jaipur, Odisha - 755026",
      "Jindal Coke Limited KNIC, Jaipur, Odisha - 755026",
      "Jindal United Steel Limited KNIC, Jaipur, Odisha - 755026",
      "Jindal Ferrous Limited KNIC, Jaipur, Odisha - 755026",
    ],
  },
  { key: "transporterNameAddress", field: "Transporter Name and address", type: "textarea", hint: "Enter transporter name and address" },
  { key: "transporterPhoneEmail", field: "Transporter Phone no. and Email", type: "phone-email", hint: "Phone, Email" },
  { key: "vehicleType", field: "Type of Vehicle", type: "select", options: ["Truck", "Tanker", "Special Vehicle"] },
  { key: "transporterRegNo", field: "Transporter Registration no.", type: "text", hint: "Enter registration number" },
  { key: "vehicleRegNo", field: "Vehicle registration No.", type: "text", hint: "Enter vehicle number" },
  { key: "receiverName", field: "Receiver Name", type: "text", hint: "Enter receiver name" },
  { key: "receiverAddress", field: "Address", type: "textarea", hint: "Enter receiver address" },
  { key: "wasteDescription", field: "Waste Description", type: "auto" },
  { key: "totalQty", field: "Total Quantity", type: "auto" },
  { key: "physicalForm", field: "Physical Form", type: "select", options: ["Solid", "Semisolid", "Sludge", "Oily", "Tarry", "Slurry", "Liquid"] },
  { key: "salePoSoDoc", field: "Document for Sale PO/SO to be uploaded for external disposal", type: "file" },
  { key: "finalPartyDoc", field: "Final party document intact as provided prior for verification", type: "file" },
];

export default function NonHazardousDisposalGeneratePage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [values, setValues] = useState<Record<string, string | string[]>>({
    disposalDate: today,
  });

  const updateValue = (key: string, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Non Hazardous Disposal payload", values);
    alert("Form captured. API save wiring can be added next.");
  };

  const renderInput = (row: RowDef) => {
    if (row.type === "date") {
      return (
        <input
          type="date"
          value={typeof values.disposalDate === "string" ? values.disposalDate : today}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
        />
      );
    }

    if (row.type === "text") {
      return (
        <input
          placeholder={row.hint ?? ""}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
        />
      );
    }

    if (row.type === "textarea") {
      return (
        <textarea
          rows={2}
          placeholder={row.hint ?? ""}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
        />
      );
    }

    if (row.type === "number") {
      return (
        <input
          type="number"
          placeholder={row.hint ?? ""}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
        />
      );
    }

    if (row.type === "phone-email") {
      return (
        <input
          placeholder={row.hint ?? "Phone, Email"}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
        />
      );
    }

    if (row.type === "select") {
      return (
        <select
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Select
          </option>
          {(row.options ?? []).map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      );
    }

    if (row.type === "multi-select") {
      return (
        <input
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          placeholder={row.hint ?? "Comma separated IDs"}
          onChange={(e) =>
            updateValue(
              row.key,
              e.target.value
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
            )
          }
        />
      );
    }

    if (row.type === "file") {
      return (
        <input
          type="file"
          accept=".pdf,.jpeg,.jpg,.png"
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.files?.[0]?.name ?? "")}
        />
      );
    }

    if (row.type === "auto") {
      return (
        <input
          readOnly
          value="Auto generated"
          className="w-full rounded border border-slate-200 bg-slate-100 px-2 py-1 text-sm"
        />
      );
    }

    return null;
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Disposal Generate - Non Hazardous</h1>
      <p className="mt-2 text-sm text-slate-600">Fill non-hazardous disposal details below.</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-200 px-3 py-2 text-left">Field Name</th>
                <th className="border border-slate-200 px-3 py-2 text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="border border-slate-200 px-3 py-2 align-top">{row.field}</td>
                  <td className="border border-slate-200 px-3 py-2">{renderInput(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800">
          Submit
        </button>
      </form>
    </section>
  );
}
