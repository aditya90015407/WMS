"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
  { key: "wasteIds", field: "Waste ID/Batch ID", type: "auto", hint: "Comma separated IDs" },
  {
    key: "senderNameAddress",
    field: "Sender's Name & Mailing Address (including phone no. and e-mail)",
    type: "select",
  },

  { key: "transporterNameAddress", field: "Transporter Name and address", type: "textarea", hint: "Enter transporter name and address" },
  { key: "transporterPhoneEmail", field: "Transporter Phone no. and Email", type: "phone-email", hint: "Phone, Email" },
  { key: "vehicleType", field: "Type of Vehicle", type: "select", options: ["1|Truck", "2|Tanker", "3|Special Vehicle"] },
  { key: "transporterRegNo", field: "Transporter Registration no.", type: "text", hint: "Enter registration number" },
  { key: "vehicleRegNo", field: "Vehicle registration No.", type: "text", hint: "Enter vehicle number" },
  { key: "receiverName", field: "Receiver Name", type: "text", hint: "Enter receiver name" },
  { key: "receiverAddress", field: "Address", type: "textarea", hint: "Enter receiver address" },
  { key: "wasteDescription", field: "Waste Description", type: "text" },
  { key: "totalQty", field: "Total Quantity", type: "text" },
  { key: "physicalForm", field: "Physical Form", type: "select", options: ["1|Solid", "2|Semisolid", "3|Sludge", "4|Oily", "5|Tarry", "6|Slurry", "7|Liquid"] },
  { key: "salePoSoDoc", field: "Document for Sale PO/SO to be uploaded for external disposal", type: "file" },
  {
    key: "finalPartyDoc",
    field: "Final party document intact as provided prior for verification",
    type: "file",
  },
];

export default function NonHazardousDisposalGeneratePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const params = React.use(searchParams)
  const iddid = params.id;
  // const iddid = params.get("id") ?? "";

  const [values, setValues] = useState<Record<string, string | string[] | File | null>>({
    disposalDate: today,
  });
  const [unitOptions, setUnitOptions] = useState<
    { id: string; name: string }[]
  >([]);

  const updateValue = (key: string, value: string | string[] | File | null) => {

    setValues((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const res = await fetch("/api/GetData/GetUnit", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();
        console.log("GetUnit response:", data);

        if (!res.ok || !Array.isArray(data)) {
          setUnitOptions([]);
          return;
        }

        const options = data
          .map((item) => ({
            id: String(item?.ID ?? item?.UID ?? item?.UnitID ?? "").trim(),
            name: String(
              item?.UnitDesc ??
              item?.NAME ??
              item?.Name ??
              item?.Unit ??

              ""
            ).trim(),
          }))
          .filter((item) => item.id && item.name);

        setUnitOptions(options);

        // if (options.length > 0) {
        //   setValues((prev) => ({
        //     ...prev,
        //     senderNameAddress:
        //   typeof prev.senderNameAddress === "string" &&
        //   prev.senderNameAddress
        //     ? prev.senderNameAddress
        //     : options[0].id,
        //   }));
        // }
      } catch (error) {
        console.error("Failed to load unit options", error);
        setUnitOptions([]);
      }
    };

    void loadUnits();
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

        const data = await res.json();
        console.log("Frontend API response:", data);

        if (!res.ok || !data.success) return;

        const row = Array.isArray(data.data) ? data.data[0] : data.data;

        setValues((prev) => ({
          ...prev,
          disposalDate: today,
          wasteIds: [String(iddid)],
          transporterNameAddress: `${row?.TransporterName ?? ""} ${row?.TransporterAddress ?? ""}`.trim(),
          transporterPhoneEmail: `${row?.TransporterPhone ?? ""}, ${row?.TransporterEmail ?? ""}`.trim(),
          transporterRegNo: String(row?.TransporterRegNo ?? ""),
          vehicleRegNo: String(row?.VehicleRegNo ?? ""),
          receiverName: String(row?.ReceiverName ?? ""),
          receiverAddress: String(row?.ReceiverAddress ?? ""),
          vehicleType: String(row?.VTID ?? ""),
          physicalForm: String(row?.PSID ?? ""),
          wasteDescription: String(row?.Waste ?? ""),
          totalQty: String(row?.TotalQty ?? ""),
        }));
      } catch (err) {
        console.error("Failed to load non-hazardous form details", err);
      }
    };

    void loadDetails();
  }, [iddid, today]);


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const wasteIdsArr = Array.isArray(values.wasteIds) ? values.wasteIds : [];

    const formData = new FormData();
    formData.append("IDDID", iddid!);
    formData.append("IDDID", iddid!);
    formData.append(
      "UID",
      String(values.senderNameAddress ?? "")
    );
    formData.append("TransporterName", String(values.transporterNameAddress ?? "").split(",")[0] ?? "");
    formData.append("TransporterAddress", String(values.transporterNameAddress ?? ""));
    formData.append("TransporterPhone", String(values.transporterPhoneEmail ?? "").split(",")[0] ?? "");
    formData.append("TransporterEmail", String(values.transporterPhoneEmail ?? "").split(",")[1] ?? "");
    formData.append("VTID", String(values.vehicleType ?? ""));
    formData.append("TransporterRegNo", String(values.transporterRegNo ?? ""));
    formData.append("VehicleRegNo", String(values.vehicleRegNo ?? ""));
    formData.append("ReceiverName", String(values.receiverName ?? ""));
    formData.append("ReceiverAddress", String(values.receiverAddress ?? ""));
    formData.append("ReceiverAuthNo", "");
    formData.append("TotalQty", String(Number(values.totalQty ?? 0)));
    formData.append("Waste", String(values.wasteDescription ?? ""));
    formData.append("NoOfContainers", "0");
    formData.append("PSID", String(values.physicalForm ?? ""));
    formData.append("SpecialHandlingInstructions", "");
    // formData.append("EmpCode", "YOUR_EMP_CODE");
    formData.append("DateOfDisposal", String(values.disposalDate ?? today));

    if (values.salePoSoDoc instanceof File) {
      formData.append("salePoSoDoc", values.salePoSoDoc);
    }
    for (let i = 1; i <= 5; i++) {
      const file = values[`finalPartyDoc${i}`];

      if (file instanceof File) {
        formData.append(`finalPartyDoc${i}`, file);
      }
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


    // console.log(result);
    const statusText = String(result?.data?.[0]?.STATUS ?? "").trim();
    const fddid = statusText.split("-").pop()?.trim() ?? "";

    alert("Saved successfully");


    if (values.salePoSoDoc instanceof File && values.finalPartyDoc instanceof File) {
      const attachmentFormData = new FormData();
      attachmentFormData.append("FDDID", fddid);
      attachmentFormData.append("salePoSoDoc", values.salePoSoDoc);
      for (let i = 1; i <= 5; i++) {
        const file = values[`finalPartyDoc${i}`];

        if (file instanceof File) {
          attachmentFormData.append(
            `finalPartyDoc${i}`,
            file
          );
        }
      }

      const attachmentRes = await fetch("/api/SetData/SetFinalDisposalDetailsAttachments", {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        body: attachmentFormData,
      });

      const attachmentResult = await attachmentRes.json();
      if (!attachmentRes.ok || !attachmentResult.success) {
        alert(attachmentResult.message || "Attachment save failed");
        return;
      }
    }
  };



  const renderInput = (row: RowDef) => {
    const v = values[row.key];

    if (row.type === "date") {
      return (
        <input
          type="date"
          value={typeof v === "string" ? v : today}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
        />
      );
    }

    if (row.type === "text") {
      return (
        <input
          value={typeof v === "string" ? v : ""}
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
          value={typeof v === "string" ? v : ""}
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
          value={typeof v === "string" ? v : ""}
          placeholder={row.hint ?? ""}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
        />
      );
    }

    if (row.type === "phone-email") {
      return (
        <input
          value={typeof v === "string" ? v : ""}
          placeholder={row.hint ?? "Phone, Email"}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
        />
      );
    }

    if (row.type === "select") {
      const currentValue =
        typeof v === "string" ? v : "";

      return (
        <select
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) =>
            updateValue(row.key, e.target.value)
          }
          value={currentValue}
        >
          <option value="" disabled>
            Select
          </option>

          {row.key === "senderNameAddress"
            ? unitOptions.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name}
              </option>
            ))
            : (row.options ?? []).map((op, index) => (
              <option
                key={`${row.key}-${index}`}
                value={op}
              >
                {op}
              </option>
            ))}
        </select>
      );
    }

    if (row.type === "multi-select") {
      const arr = Array.isArray(v) ? v : [];
      return (
        <input
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          placeholder={row.hint ?? "Comma separated IDs"}
          value={arr.join(", ")}
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

      if (row.key === "finalPartyDoc") {
        return (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="space-y-1">
                <input
                  type="file"
                  accept=".pdf,.jpeg,.jpg,.png"
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                  onChange={(e) =>
                    updateValue(
                      `finalPartyDoc${num}`,
                      e.target.files?.[0] ?? null
                    )
                  }
                />

                <p className="text-xs text-slate-500">
                  File {num}
                </p>

                {values[`finalPartyDoc${num}`] instanceof File && (
                  <p className="text-xs text-emerald-700">
                    Selected: {
                      (values[`finalPartyDoc${num}`] as File).name
                    }
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      }

      return (
        <input
          type="file"
          accept=".pdf,.jpeg,.jpg,.png"
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) =>
            updateValue(row.key, e.target.files?.[0] ?? null)
          }
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
      <div className="relative">
        <h1 className="text-xl font-semibold text-teal-600 text-center">Disposal Generate - Non Hazardous</h1>
        {/* <p className="mt-2 text-xs text-slate-600 text-right">Fill disposal manifest details below.</p> */}

        <Link href="./">
          <img src="/goback.png" alt="" className="h-5 absolute top-0 right-10" />
        </Link>
      </div>
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
