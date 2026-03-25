"use client";

import React, { useMemo, useState } from "react";

type FieldType =
  | "multi-select"
  | "select"
  | "text"
  | "textarea"
  | "number"
  | "phone-email"
  | "checkbox"
  | "file"
  | "auto"
  | "signature-date";

type RowDef = {
  key: string;
  field: string;
  type: FieldType;
  options?: string[];
  hint?: string;
};

const rows: RowDef[] = [
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
  {
    key: "senderAuthNo",
    field: "Sender Authorization No.",
    type: "select",
    options: [
      "JSL (IND-IV-HW-587/6854)",
      "JCL (IND-IV-HW-1225/6852)",
      "JUSL (IND-IV-HW-1224/6858)",
      "JFL (Not Available)",
    ],
  },
  { key: "manifestNo", field: "Manifest document no.", type: "auto" },
  { key: "transporterNameAddress", field: "Transporter Name and Address", type: "textarea", hint: "Enter transporter name and full address" },
  { key: "transporterPhoneEmail", field: "Transporter Phone no. and Email", type: "phone-email", hint: "Phone, Email" },
  {
    key: "vehicleType",
    field: "Type of Vehicle",
    type: "select",
    options: ["Truck", "Tanker", "Special Vehicle"],
  },
  { key: "transporterRegNo", field: "Transporter Registration no.", type: "text", hint: "Enter registration number" },
  { key: "vehicleRegNo", field: "Vehicle registration No.", type: "text", hint: "Enter vehicle number" },
  { key: "receiverName", field: "Receiver Name", type: "text", hint: "Enter receiver name" },
  { key: "receiverAddress", field: "Address", type: "textarea", hint: "Enter receiver address" },
  { key: "receiverAuthNo", field: "Receiver Authorization No.", type: "text", hint: "Enter receiver authorization number" },
  { key: "wasteDescription", field: "Waste Description", type: "select" },
  { key: "totalQty", field: "Total Quantity", type: "auto" },
  { key: "containers", field: "No. of Containers", type: "number", hint: "Enter total containers" },
  {
    key: "physicalForm",
    field: "Physical Form",
    type: "select",
    options: ["Solid", "Semisolid", "Sludge", "Oily", "Tarry", "Slurry", "Liquid"],
  },
  { key: "specialHandling", field: "Special handling Instruction", type: "textarea", hint: "Enter handling notes (if applicable)" },
  { key: "senderCertificate", field: "Sender's certificate", type: "checkbox" },
  { key: "senderSignDate", field: "Name and Stamp (Sender)", type: "signature-date" },
  { key: "transporterAck", field: "Transporter acknowledgement of receipt of waste", type: "checkbox" },
  { key: "transporterSignDate", field: "Name and Stamp (Transporter)", type: "signature-date" },
  { key: "receiverCert", field: "Receiver certification for receipt of hazardous and other waste", type: "checkbox" },
  { key: "receiverSignDate", field: "Name and Stamp (Receiver)", type: "signature-date" },
  { key: "form8form9", field: "Hard copy of Form-8 and Form-9 submitted to transporter", type: "checkbox" },
  { key: "salePoSoDoc", field: "Document for Sale PO/SO for external disposal", type: "file" },
  { key: "finalPartyDoc", field: "Final party document intact as provided prior for verification", type: "file" },
];

export default function DisposalGeneratePage() {
  const [values, setValues] = useState<Record<string, string | string[] | boolean>>({});
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const updateValue = (key: string, value: string | string[] | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Disposal Generate payload", values);
    alert("Form captured. API wiring can be added next.");
  };

  const renderInput = (row: RowDef) => {
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

    if (row.type === "checkbox") {
      return (
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            onChange={(e) => updateValue(row.key, e.target.checked)}
          />
          Confirm
        </label>
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

    if (row.type === "signature-date") {
      return (
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Signature"
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            onChange={(e) => updateValue(`${row.key}_sign`, e.target.value)}
          />
          <input
            type="date"
            value={today}
            readOnly
            className="w-full rounded border border-slate-200 bg-slate-100 px-2 py-1 text-sm"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Disposal Generate</h1>
      <p className="mt-2 text-sm text-slate-600">Fill disposal manifest details below.</p>

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

        <button
          type="submit"
          className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
        >
          Submit
        </button>
      </form>
    </section>
  );
}
