
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";


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
  },


  // {
  //   key: "senderAuthNo",
  //   field: "Sender Authorization No.",
  //   type: "select",
  //   options: [
  //     "JSL (IND-IV-HW-587/6854)",
  //     "JCL (IND-IV-HW-1225/6852)",
  //     "JUSL (IND-IV-HW-1224/6858)",
  //     "JFL (Not Available)",
  //   ],
  // },
  { key: "manifestNo", field: "Manifest document no.", type: "auto" },
  { key: "transporterNameAddress", field: "Transporter Name and Address", type: "textarea", hint: "Enter transporter name and full address" },
  { key: "transporterPhoneEmail", field: "Transporter Phone no. and Email", type: "phone-email", hint: "Phone, Email" },
  {
    key: "vehicleType",
    field: "Type of Vehicle",
    type: "select",
    options: ["1|Truck", "2|Tanker", "3|Special Vehicle"]

  },
  { key: "transporterRegNo", field: "Transporter Registration no.", type: "text", hint: "Enter registration number" },
  { key: "vehicleRegNo", field: "Vehicle registration No.", type: "text", hint: "Enter vehicle number" },
  { key: "receiverName", field: "Receiver Name", type: "text", hint: "Enter receiver name" },
  { key: "receiverAddress", field: "Address", type: "textarea", hint: "Enter receiver address" },
  { key: "receiverAuthNo", field: "Receiver Authorization No.", type: "text", hint: "Enter receiver authorization number" },
  { key: "Waste", field: "Waste Description", type: "text" },
  { key: "totalQty", field: "Total Quantity", type: "text" },
  { key: "containers", field: "No. of Containers", type: "number", hint: "Enter total containers" },
  {
    key: "physicalForm",
    field: "Physical Form",
    type: "select",
    options: ["1|Solid", "2|Semisolid", "3|Sludge", "4|Oily", "5|Tarry", "6|Slurry", "7|Liquid"]

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
type Option = { id: string; name: string };

export default function DisposalGeneratePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const router = useRouter();


  const [values, setValues] = useState<Record<string, string | string[] | boolean | File | null>>({
    manifestNo: "",
    senderNameAddress: "",
  });
  const [unitOptions, setUnitOptions] = useState<Option[]>([]);

  const [vehicleOptions, setVehicleOptions] = useState<Option[]>([]);
  const [physicalOptions, setPhysicalOptions] = useState<Option[]>([]);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const params = React.use(searchParams)
  const iddid = params.id;
  // const iddid = params.get("id") ?? "";

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
          .map(
            (item: {
              ID?: number | string;
              UID?: number | string;
              UnitID?: number | string;
              NAME?: string;
              Name?: string;
              Unit?: string;
              UnitDesc?: string;
            }) => ({
              id: String(item?.ID ?? item?.UID ?? item?.UnitID ?? "").trim(),
              name: String(
                item?.UnitDesc ?? item?.NAME ?? item?.Name ?? item?.Unit ?? "",
              ).trim(),
            }),
          )
          .filter((item) => item.id && item.name);


        setUnitOptions(options);

        if (options.length > 0) {
          setValues((prev) => ({
            ...prev,
            senderNameAddress: typeof prev.senderNameAddress === "string" && prev.senderNameAddress
              ? prev.senderNameAddress
              : options[0].id,
          }));
        }
      } catch (error) {
        console.error("Failed to load unit options", error);
        setUnitOptions([]);
      }
    };

    void loadUnits();
  }, []);

  useEffect(() => {
    console.log("Hazardous manifestNo state:", values.manifestNo);
  }, [values.manifestNo]);


  useEffect(() => {
    const loadDetails = async () => {
      if (!iddid) return;

      try {
        const res = await fetch("/api/GetData/GetSelectedVendorDetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ID: iddid }),
        });

        const data = await res.json();
        console.log("Frontend API response:", data);

        if (!res.ok || !data.success) return;

        const row = Array.isArray(data.data) ? data.data[0] : data.data;
        const manifestNo = String(
          row?.ManifestDocumentNo ??
          row?.manifestDocumentNo ??
          row?.ManifestNo ??
          row?.IDDID ??
          "",
        );

        console.log("Hazardous manifest row:", row);
        console.log("Hazardous manifest being set:", manifestNo);

        setValues((prev) => ({
          ...prev,
          wasteIds: [String(iddid)],
          senderNameAddress: String(row?.UID ?? prev.senderNameAddress ?? ""),
          manifestNo,

          transporterNameAddress: `${row?.TransporterName ?? ""} ${row?.TransporterAddress ?? ""}`.trim(),
          transporterPhoneEmail: `${row?.TransporterPhone ?? ""}, ${row?.TransporterEmail ?? ""}`.trim(),
          transporterRegNo: String(row?.TransporterRegNo ?? ""),
          vehicleRegNo: String(row?.VehicleRegNo ?? ""),
          receiverName: String(row?.ReceiverName ?? ""),
          receiverAddress: String(row?.ReceiverAddress ?? ""),
          receiverAuthNo: String(row?.ReceiverAuthNo ?? ""),
          // wasteDescription: String(row?.WasteCategory ?? ""),
          vehicleType: String(row?.VTID ?? ""),
          physicalForm: String(row?.PSID ?? ""),
          Waste: String(row?.Waste ?? ""),
          totalQty: String(row?.TotalQty ?? ""),


        }));
      } catch (err) {
        console.error("Failed to load hazardous form details", err);
      }
    };

    void loadDetails();
  }, [iddid]);

  const updateValue = (key: string, value: string | string[] | boolean | File | null) => {

    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("IDDID", iddid!);
    formData.append("UID", String(values.senderNameAddress ?? ""));
    formData.append("TransporterName", String(values.transporterNameAddress ?? "").split(",")[0] ?? "");
    formData.append("TransporterAddress", String(values.transporterNameAddress ?? ""));
    formData.append("TransporterPhone", String(values.transporterPhoneEmail ?? "").split(",")[0] ?? "");
    formData.append("TransporterEmail", String(values.transporterPhoneEmail ?? "").split(",")[1] ?? "");
    formData.append("VTID", String(values.vehicleType ?? ""));
    formData.append("TransporterRegNo", String(values.transporterRegNo ?? ""));
    formData.append("VehicleRegNo", String(values.vehicleRegNo ?? ""));
    formData.append("ReceiverName", String(values.receiverName ?? ""));
    formData.append("ReceiverAddress", String(values.receiverAddress ?? ""));
    formData.append("ReceiverAuthNo", String(values.receiverAuthNo ?? ""));
    formData.append("TotalQty", String(Number(values.totalQty ?? 0)));
    formData.append("Waste", String(values.Waste ?? ""));
    formData.append("NoOfContainers", String(values.containers ?? ""));
    formData.append("PSID", String(values.physicalForm ?? ""));
    formData.append("SpecialHandlingInstructions", String(values.specialHandling ?? ""));
    formData.append("EmpCode", "YOUR_EMP_CODE");
    formData.append("DateOfDisposal", today);

    if (values.salePoSoDoc instanceof File) {
      formData.append("salePoSoDoc", values.salePoSoDoc);
    }
    if (values.finalPartyDoc instanceof File) {
      formData.append("finalPartyDoc", values.finalPartyDoc);
    }

    const res = await fetch("/api/SetData/SetFinalDisposalDetails", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    console.log(result);
    const statusText = String(result?.data?.[0]?.STATUS ?? "").trim();
    const fddid = statusText.split("-").pop()?.trim() ?? "";

    // const fddid = result.fddid;
    // console.log(statusText);
    // console.log(fddid);
    // console.log(result);
    if (!res.ok || !result.success) {
      alert(result.message || "Save failed");
      return;
    }

    if (values.salePoSoDoc instanceof File) {
      const attachmentFormData = new FormData();
      attachmentFormData.append("FDDID", fddid);
      attachmentFormData.append("salePoSoDoc", values.salePoSoDoc);

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

    // router.push(`/Form/Form10?id=${iddid}`);

  };


  const renderInput = (row: RowDef) => {
    const v = values[row.key];

    if (row.type === "text") {
      return (
        <input


          value={(v as string) ?? ""}
          placeholder={row.hint ?? ""}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
        />
      );
    }

    if (row.type === "textarea") {
      return (
        <textarea
          id={row.key}
          name={row.key}

          rows={2}
          value={(v as string) ?? ""}
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
          value={(v as string) ?? ""}
          placeholder={row.hint ?? ""}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
        />
      );
    }

    if (row.type === "phone-email") {
      return (
        <input


          value={(v as string) ?? ""}
          placeholder={row.hint ?? "Phone, Email"}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
        />
      );
    }

    if (row.type === "select") {
      const options = row.key === "senderNameAddress" ? unitOptions : (row.options ?? []);
      const currentValue = (v as string) ?? "";

      return (
        <select
          id={row.key}
          name={row.key}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
          value={currentValue || ""}
        >
          <option value="" disabled>
            Select
          </option>
          {row.key === "senderNameAddress"
            ? (options as Option[]).map((op, index) => (
              <option key={`${row.key}-${op.id}-${index}`} value={op.id}>
                {op.name}
              </option>
            ))
            : (options as string[]).map((op, index) => {
              const hasPipe = op.includes("|");
              const value = hasPipe ? op.split("|")[0].trim() : op.trim();
              const label = hasPipe ? op.split("|")[1].trim() : op.trim();

              return (
                <option key={`${row.key}-${value}-${index}`} value={value}>
                  {label}
                </option>
              );
            })}

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

    if (row.type === "checkbox") {
      return (
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            id={row.key}
            name={row.key}

            type="checkbox"
            checked={Boolean(v)}
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
          onChange={(e) => updateValue(row.key, e.target.files?.[0] ?? null)}
        />
      );
    }

    if (row.type === "auto") {
      return (
        <input
          readOnly
          value={(v as string) ?? ""}
          placeholder="Auto generated"
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
