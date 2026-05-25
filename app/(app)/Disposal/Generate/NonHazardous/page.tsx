"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type FieldType =
  | "date"
  | "multi-select"
  | "select"
  | "text"
  | "view"
  | "textarea"
  | "number"
  | "phone-email"
  | "file"
  | "auto"
  | "phone"
  | "email"



type RowDef = {

  key: string;
  field: string;
  type: FieldType;
  options?: string[];
  hint?: string;
  required?: boolean
};

const rows: RowDef[] = [
  // { key: "disposalDate", field: "Date", type: "date", hint: "Date of disposal (within 90 days of generation)" },
  { key: "wasteIds", field: "Disposal ID", type: "multi-select" },
  { key: "dateOfDisposal", field: "Date of Disposal", type: "auto", hint: "Date Of Disposal" },
  {
    key: "senderNameAddress",
    field: "Sender's Unit *",
    type: "select",
  },
  // { key: "manifestNo", field: "Manifest document No.", type: "auto" },
  { key: "transporterName", field: "Transporter Name  *", type: "textarea", hint: "Enter transporter name ", required: true },
  { key: "transporterAddress", field: "Transporter Address *", type: "textarea", hint: "Enter transporter full address", required: true },
  { key: "transporterPhone", field: "Transporter Phone No. *", type: "phone", hint: "Transporter Phone ", required: true },
  { key: "transporterEmail", field: "Transporter Email *", type: "email", hint: "Transporter Email", required: true },
  { key: "vehicleType", field: "Type of Vehicle *", type: "select", options: ["1|Truck", "2|Tanker", "3|Special Vehicle"] },
  { key: "transporterRegNo", field: "Transporter Registration No. *", type: "text", hint: "Enter registration number" },
  { key: "vehicleRegNo", field: "Vehicle registration No. *", type: "text", hint: "Enter vehicle number" },
  { key: "receiverName", field: "Receiver Name *", type: "text", hint: "Enter receiver name" },
  { key: "receiverAddress", field: "Address *", type: "textarea", hint: "Enter receiver address" },
  { key: "wasteDescription", field: "Waste Description", type: "view" },
  { key: "totalQty", field: "Total Quantity", type: "view" },
  {
    key: "physicalForm", field: "Physical Form *", type: "select",
    options: ["1|Solid", "2|Liquid", "3|Sludge", "4|Semisolid", "5|Oily", "6|Tarry", "7|Slurry", "9|Fines"]
  },
  { key: "salePoSoDoc", field: "Document for Sale PO/SO to be uploaded for external disposal", type: "file" },
  {
    key: "finalPartyDoc",
    field: "Final party document intact as provided prior for verification",
    type: "file",
  },
];

export default function DisposalGeneratePage({ searchParams }: { searchParams: Promise<{ id?: string, disposalType?: string }> }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const params = React.use(searchParams)
  const iddid = params.id;
  const router = useRouter();
  const disposalType = params.disposalType;
  // const iddid = params.get("id") ?? "";
  const [MUID, setMUID] = useState<string>("");
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
        // console.log("GetUnit response:", data);

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
        let res;
        if (disposalType == "2") {
          // console.log("hi i was called")
          res = await fetch("/api/GetData/GetInternalDisposalDetails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ID: iddid }),
          });
        }
        else {
          // console.log("hi i was not called")
          res = await fetch("/api/GetData/GetSelectedVendorDetails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ID: iddid }),
          });
        }


        const data = await res.json();
        // console.log("Frontend API response:", data);

        if (!res.ok || !data.success) return;

        const row = Array.isArray(data.data) ? data.data[0] : data.data;
        // console.log(row);
        setMUID(String(row?.MUID ?? ""));
        setValues((prev) => ({
          ...prev,
          senderNameAddress: String(row?.UID ?? prev.senderNameAddress ?? ""),
          disposalDate: today,
          wasteIds: [String(iddid)],
          transporterName: `${row?.TransporterName ?? ""}`.trim(),
          transporterAddress: `${row?.TransporterAddress ?? ""}`.trim(),
          transporterPhone: `${row?.TransporterPhone ?? ""}`.trim(),
          transporterEmail: `${row?.TransporterEmail ?? ""}`.trim(),
          transporterRegNo: String(row?.TransporterRegNo ?? ""),
          vehicleRegNo: String(row?.VehicleRegNo ?? ""),
          receiverName: String(row?.ReceiverName ?? ""),
          receiverAddress: String(row?.ReceiverAddress ?? ""),
          receiverAuthNo: String(row?.ReceiverAuthNo ?? " "),
          vehicleType: String(row?.VTID ?? ""),
          physicalForm: String(row?.PSID ?? ""),
          wasteDescription: String(row?.Waste ?? ""),
          totalQty: `${String(row?.TotalQty ?? "")} ${String(row?.MUnit ?? "")}`,
          dateOfDisposal: String(row?.AuctionDate ?? "")
        }));
      } catch (err) {
        console.error("Failed to load non-hazardous form details", err);
      }
    };

    void loadDetails();
  }, [iddid, today]);


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (values.senderNameAddress == "" || values.transporterName == "" || values.transporterAddress == "" ||
      values.transporterEmail == "" || values.vehicleType == "" || values.transporterRegNo == "" ||
      values.vehicleRegNo == "" || values.receiverName == "" || values.receiverAddress == "" ||
      values.totalQty == "" || values.physicalForm == "" || values.dateOfDisposal == ""
    ) {
      alert("Please fill all required fields (marked with *) ")
      return
    }

    const wasteIdsArr = Array.isArray(values.wasteIds) ? values.wasteIds : [];

    const formData = new FormData();
    formData.append("IDDID", iddid!);
    formData.append("IDDID", iddid!);
    formData.append(
      "UID",
      String(values.senderNameAddress ?? "")
    );
    formData.append("TransporterName", String(values.transporterName ?? ""));
    formData.append("TransporterAddress", String(values.transporterAddress ?? ""));
    formData.append("TransporterPhone", String(values.transporterPhone ?? ""));
    formData.append("TransporterEmail", String(values.transporterEmail ?? ""));
    formData.append("VTID", String(values.vehicleType ?? ""));
    formData.append("TransporterRegNo", String(values.transporterRegNo ?? ""));
    formData.append("VehicleRegNo", String(values.vehicleRegNo ?? ""));
    formData.append("ReceiverName", String(values.receiverName ?? ""));
    formData.append("ReceiverAddress", String(values.receiverAddress ?? ""));
    formData.append("ReceiverAuthNo", String(values.receiverAuthNo ?? ""));
    formData.append("TotalQty", String((values.totalQty ?? 0)).split(" ")[0]);
    formData.append("Waste", String(values.wasteDescription ?? ""));
    formData.append("NoOfContainers", "0");
    formData.append("PSID", String(values.physicalForm ?? ""));
    formData.append("SpecialHandlingInstructions", "");
    // formData.append("EmpCode", "YOUR_EMP_CODE");
    formData.append("DateOfDisposal", String(values.dateOfDisposal));
    formData.append("MUID", MUID);

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

    const hasFinalPartyDoc = [1, 2, 3, 4, 5].some(
      (num) =>
        values[`finalPartyDoc${num}`] instanceof File
    );



    if (values.salePoSoDoc instanceof File && hasFinalPartyDoc) {
      const attachmentFormData = new FormData();
      attachmentFormData.append("FDDID", fddid);
      attachmentFormData.append("salePoSoDoc", values.salePoSoDoc);




      for (let i = 1; i <= 5; i++) {
        const file = values[`finalPartyDoc${i}`];

        if (file instanceof File) {

          attachmentFormData.append(`finalPartyDoc${i}`, file);

        }

      }
      console.log([...attachmentFormData.entries()]);
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
    // router.back();
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

    if (row.type === "view") {
      return (
        <input
          readOnly
          value={typeof v === "string" ? v : ""}
          className="w-full rounded border border-slate-200 bg-slate-100 px-2 py-1 text-sm text-slate-700"
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
            : (row.options ?? []).map((op, index) => {
              const value = op.split("|")[0];
              const label = op.split("|")[1];

              return (
                <option
                  key={`${row.key}-${index}`}
                  value={value}
                >
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
        <div className="px-3 py-2 bg-slate-100 rounded border">
          {arr.length > 0 ? arr.join(", ") : "-"}
        </div>
      );
    }

    if (row.type === "file") {

      if (row.key === "finalPartyDoc") {

        const labels = [
          "Cto Respective File", "HwAuthorizationOspcb File", "HwAuthorizationSpcb File", "BlueBook File", "Registration Certificate File"
        ];
        return (
          <div className="space-y-3">

            {labels.map((label, index) => {

              const num = index + 1;

              return (
                <div key={num} className="space-y-1">

                  <label className="text-sm font-medium text-slate-700">
                    {label}
                  </label>

                  <input
                    type="file"
                    accept=".pdf,.jpeg,.png,.jpg"
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    onChange={(e) =>
                      updateValue(
                        `finalPartyDoc${num}`,
                        e.target.files?.[0] ?? null
                      )
                    }
                  />

                  {/* {values[`finalPartyDoc${num}`] instanceof File && (
                    <p className="text-xs text-emerald-700">
                      Selected: {
                        (values[`finalPartyDoc${num}`] as File).name
                      }
                    </p>
                  )} */}

                </div>
              );
            })}

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



    // if (row.type === "auto") {
    //   return (
    //     <input
    //       readOnly
    //       value="Auto generated"
    //       className="w-full rounded border border-slate-200 bg-slate-100 px-2 py-1 text-sm"
    //     />
    //   );
    // }

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


    if (row.type === "phone") {
      return (
        <input
          value={(v as string) ?? ""}
          placeholder={row.hint ?? "Phone"}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
        />
      );
    }

    if (row.type === "email") {
      return (
        <input
          value={(v as string) ?? ""}
          placeholder={row.hint ?? "Email"}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          onChange={(e) => updateValue(row.key, e.target.value)}
        />
      );
    }

    return null;
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="relative">
        <h1 className="text-lg font-semibold text-teal-600 text-center">Disposal Generate - Non Hazardous</h1>
        {/* <p className="mt-2 text-xs text-slate-600 text-right">Fill disposal manifest details below.</p> */}


        <img src="/refresh.png" alt="" className="h-4.5 cursor-pointer absolute top-0 right-15 "
          onClick={() => window.location.reload()}
        />
        <Link href="./">
          <img src="/goback.png" alt="" className="h-4.5 absolute top-0 right-6" />
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
                  <td className="border border-slate-200 px-3 py-1.5 align-top">{row.field}</td>
                  <td className="border border-slate-200 px-3 py-1.5">{renderInput(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="submit"
          className="cursor-pointer rounded block place-self-center text-sm bg-emerald-700 px-3 py-2 text-white hover:bg-emerald-800"
        >
          Submit
        </button>
      </form>
    </section>
  )
};