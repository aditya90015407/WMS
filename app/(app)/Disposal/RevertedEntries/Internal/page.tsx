
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";


type FieldType =
  | "multi-select"
  | "select"
  | "select"
  | "text"
  | "textarea"
  | "number"
  | "phone-email"
  | "checkbox"
  | "file"
  | "auto"
  | "phone"
  | "email"
  | "signature-date";

type RowDef = {
  key: string;
  field: string;
  type: FieldType;
  options?: string[];
  hint?: string;
  required?: boolean
};






const rows: RowDef[] = [
  { key: "ID", field: "Final Disposal ID", type: "auto", hint: "Comma separated IDs", required: true },
  { key: "IDDID", field: "Initiated Disposal ID", type: "auto", hint: "Comma separated IDs", required: true },
  { key: "dateOfDisposal", field: "Date of Disposal", type: "auto", hint: "Date Of Disposal", required: true },
  {
    key: "AID",
    field: "Disposed To",
    type: "select",
    options: ["1|Internal Consumption", "2|Briquette Plant", "3|Civil (Internal)"],
    required: true
  },// {
  //   key: "senderNameAddress",
  //   field: "Sender's Unit ",
  //   type: "select", required: true
  // },

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
  // { key: "manifestNo", field: "Manifest Document No.", type: "auto" },
  // { key: "transporterName", field: "Transporter Name  ", type: "textarea", hint: "Enter transporter name ", required: true },
  // { key: "transporterAddress", field: "Transporter Address ", type: "textarea", hint: "Enter transporter full address", required: true },
  // { key: "transporterPhone", field: "Transporter Phone No. ", type: "phone", hint: "Transporter Phone ", required: true },
  // { key: "transporterEmail", field: "Transporter Email ", type: "email", hint: "Transporter Email", required: true },
  // {
  //   key: "vehicleType",
  //   field: "Type of Vehicle ",
  //   type: "select",
  //   options: ["1|Truck", "2|Tanker", "3|Special Vehicle"],
  //   required: true
  // },
  // { key: "transporterRegNo", field: "Transporter Registration No. ", type: "text", hint: "Transporter registration number", required: true },
  // { key: "vehicleRegNo", field: "Vehicle Registration No. ", type: "text", hint: "Enter vehicle number", required: true },
  // { key: "receiverName", field: "Receiver Name ", type: "text", hint: "Enter receiver name", required: true },
  // { key: "receiverAddress", field: "Address ", type: "textarea", hint: "Enter receiver address", required: true },
  // { key: "receiverAuthNo", field: "Receiver Authorization No. ", type: "text", hint: "Enter receiver authorization number", required: true },
  { key: "Waste", field: "Waste Description", type: "auto", required: true },
  { key: "totalQty", field: "Total Quantity", type: "auto", required: true },
  // { key: "NoOfContainers", field: "No. of Containers ", type: "number", hint: "Enter total containers" },
  {
    key: "physicalForm",
    field: "Physical Form ",
    type: "select",
    options: ["1|Solid", "2|Liquid", "3|Sludge", "4|Semisolid", "5|Oily", "6|Tarry", "7|Slurry", "9|Fines"],
    required: true
  },
  // {
  //   key: "SpecialHandlingInstructions", field: "Special handling Instruction", type: "textarea", hint: "Enter handling notes(if applicable) "
  // },
  // {
  //   key: "ApproverRemarks", field: "Approver Remarks", type: "auto", hint: "Approver Remarks"
  // },
  // {
  //   key: "Status", field: "Approval Status", type: "auto", hint: "Approver Remarks"
  // },
  // { key: "senderCertificate", field: "Sender's certificate", type: "checkbox" },
  // { key: "senderSignDate", field: "Name and Stamp (Sender)", type: "signature-date" },
  // { key: "transporterAck", field: "Transporter acknowledgement of receipt of waste", type: "checkbox" },
  // { key: "transporterSignDate", field: "Name and Stamp (Transporter)", type: "signature-date" },
  // { key: "receiverCert", field: "Receiver certification for receipt of hazardous and other waste", type: "checkbox" },
  // { key: "receiverSignDate", field: "Name and Stamp (Receiver)", type: "signature-date" },
  // { key: "form8form9", field: "Hard copy of Form-8 and Form-9 submitted to transporter", type: "checkbox" },
  { key: "salePoSoDoc", field: "Document Proof", type: "file" },
  // { key: "finalPartyDoc", field: "Final party document intact as provided prior for verification", type: "file" },
];
type Option = { id: string; name: string };

export default function DisposalGeneratePage({ searchParams }: { searchParams: Promise<{ id?: string, disposalType?: string }> }) {
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
  const fddid = params.id;
  const disposalType = params.disposalType;

  const [MUID, setMUID] = useState<string>("");

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const res = await fetch("/api/GetData/GetUnit", {
          method: "GET",
          cache: "no-store",
        });

        const data1 = await res.json();
        // console.log("GetUnit response:", data);

        if (!res.ok || !Array.isArray(data1)) {
          setUnitOptions([]);
          return;
        }

        const options = data1
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
        //       if (options.length > 0) {
        //   setValues((prev) => ({
        //     ...prev,
        //     senderNameAddress:
        //       typeof prev.senderNameAddress === "string" &&
        //       prev.senderNameAddress
        //         ? prev.senderNameAddress
        //         : options[0].split("|")[0],
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
    // console.log("Hazardous manifestNo state:", values.manifestNo);


  }, [values.manifestNo]);



  useEffect(() => {
    const loadDetails = async () => {
      if (!fddid) return;


      try {

        const res = await fetch("/api/GetData/GetFinalDisposalDetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ID: fddid }),
        });


        const data = await res.json();
        // console.log("Frontend API response:", data);

        if (!res.ok || !data.success) return;

        const row = Array.isArray(data.data) ? data.data[0] : data.data;
        const manifestNo = String(
          row?.ManifestDocumentNo ??
          row?.manifestDocumentNo ??
          row?.ManifestNo ??
          "",
        );
        // console.log(row?.MUID)
        setMUID(String(row?.MUID ?? ""));

        // console.log("Hazardous manifest row:", row);
        // // console.log("Hazardous manifest being set:", manifestNo);
        //  console.log("Frontend API response:", data);
        setValues((prev) => ({
          ...prev,
          ID: [String(fddid)],
          IDDID: [String(row?.IDDID)],
          senderNameAddress: String(row?.UID ?? prev.senderNameAddress ?? ""),
          manifestNo,

          transporterName: `${row?.TransporterName ?? ""}`.trim(),
          transporterAddress: `${row?.TransporterAddress ?? ""}`.trim(),
          transporterPhone: `${row?.TransporterPhone ?? ""}`.trim(),
          transporterEmail: `${row?.TransporterEmail ?? ""}`.trim(),
          transporterRegNo: String(row?.TransporterRegNo ?? ""),
          vehicleRegNo: String(row?.VehicleRegNo ?? ""),
          receiverName: String(row?.ReceiverName ?? ""),
          receiverAddress: String(row?.ReceiverAddress ?? ""),
          receiverAuthNo: String(row?.ReceiverAuthNo ?? ""),
          // wasteDescription: String(row?.WasteCategory ?? ""),
          vehicleType: String(row?.VTID ?? ""),
          physicalForm: String(row?.PSID ?? ""),
          Waste: String(row?.Waste ?? ""),
          totalQty: `${String(row?.TotalQty ?? "")} ${String(row?.MUnit ?? "")}`,
          unit: String(row?.MUnit ?? ""),
          dateOfDisposal: String(row?.DateOfDisposal ?? ""),
          NoOfContainers: String(row?.NoOfContainers),
          SpecialHandlingInstructions: row?.SpecialHandlingInstructions,
          ApproverRemarks: row?.ApproverRemarks,
          Status: row?.Status,
          AID: String(row?.AID ?? ""),
        }));

      }
      catch (err) {

        console.error("Failed to load hazardous form details", err);
      }
    };

    void loadDetails();
  }, [fddid]);

  const updateValue = (key: string, value: string | string[] | boolean | File | null) => {

    // console.log(key, value);

    setValues((prev) => ({ ...prev, [key]: value }));

  };





  type AttachPaths = {
    CTO_AttachPath: string
    OSPCB_HW_Auth_AttachPath: string
    SPCB_HW_Auth_AttachPath: string
    BlueBook_AttachPath: string
    EPR_Cert_AttachPath: string
    PO_SO_AttachPath: string
  }

  const [attachPaths, setAttachPaths] = useState<AttachPaths>()

  // const [attachPaths, setAttachPaths] = useState<string[]>([])


  async function GetFinalDisposalAttachments() {
    const res = await fetch("/api/GetData/GetFinalDisposalAttachments", {
      method: "POST",
      body: JSON.stringify({ ID: fddid })
    })
    const data = await res.json()
    setAttachPaths(data[0])
    // console.log(data)
  }

  useEffect(() => {
    // console.log("i am here")
    if (!fddid || fddid == "") return
    GetFinalDisposalAttachments()
  }, [fddid])

  async function downloadAttachment(attachPath: any, attachName: any) {
    // console.log(attachPath, "ap", attachName)
    const ext = attachPath.split(".").pop();
    const payload = {
      AttachPath: attachPath
    }

    const res = await fetch(`/api/DownloadAttachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      alert("File Not Found")
      return
    }

    const blob = await res.blob()

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")

    a.href = url
    a.download = `${fddid}_${attachName}.${ext}`
    document.body.appendChild(a)
    a.click()

    a.remove()
    window.URL.revokeObjectURL(url)

    // setDownloading(false)
  }



  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("FDDID", fddid!);
    formData.append("IDDID", String(values.IDDID));
    formData.append("DateOfDisposal", String(values?.dateOfDisposal ?? ""));
    formData.append("UID", String(values.senderNameAddress ?? ""));
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
    formData.append("MUID", MUID);
    formData.append("Waste", String(values.Waste ?? ""));
    formData.append("NoOfContainers", String(values.NoOfContainers ?? ""));
    formData.append("PSID", String(values.physicalForm ?? ""));
    formData.append("SpecialHandlingInstructions", String(values.SpecialHandlingInstructions ?? ""));
    formData.append("AID", String(values.AID ?? ""));
    // formData.append("EmpCode", "YOUR_EMP_CODE");

    // console.log(Object.fromEntries(formData.entries()));
    // console.log(String(values.containers ?? ""));


    if (values.salePoSoDoc instanceof File) {
      formData.append("salePoSoDoc", values.salePoSoDoc);
    }
    for (let i = 1; i <= 5; i++) {
      const file = values[`finalPartyDoc${i}`];

      if (file instanceof File) {
        formData.append(`finalPartyDoc${i}`, file)
      }
    }


    const res = await fetch("/api/SetData/UpdateFinalDisposalDetails", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    // console.log(result);
    const statusText = String(result?.data?.[0]?.STATUS ?? "").trim();
    // const fddid = statusText.split("-").pop()?.trim() ?? "";

    // // const fddid = result.fddid;
    // console.log(statusText);
    // console.log(fddid);
    // console.log(result);
    if (!res.ok || !result.success) {
      alert(result.message || "Save failed");
      return;
    }

    const hasFinalPartyDoc = [1, 2, 3, 4, 5].some(
      (num) =>
        values[`finalPartyDoc${num}`] instanceof File
    );

    // console.log("heyy")
    if (values.salePoSoDoc instanceof File) {
      const attachmentFormData = new FormData();
      attachmentFormData.append("FDDID", fddid!);
      attachmentFormData.append("salePoSoDoc", values.salePoSoDoc);
      // console.log("heyy")



      for (let i = 1; i <= 5; i++) {
        const file = values[`finalPartyDoc${i}`];

        if (file instanceof File) {

          attachmentFormData.append(`finalPartyDoc${i}`, file);

        }

      }
      // console.log([...attachmentFormData.entries()]);


      const attachmentRes = await fetch("/api/SetData/UpdateFinalDisposalDetailsAttachments", {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        body: attachmentFormData,
      });

      const attachmentResult = await attachmentRes.json();
      if (!attachmentRes.ok || !attachmentResult.success) {
        alert(attachmentResult.message || "Attachment save failed");
        return;
      }
      // console.log(attachmentResult);
    }
    redirect("./")
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

      if (row.key === "finalPartyDoc") {

        const labels = [
          "CTO Respective File", "HW Authorization OSPCB File", "HW Authorization SPCB File", "BlueBook File", "Registration Certificate File"
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

    if (row.type === "auto") {
      return (
        <input
          readOnly
          value={(v as string) ?? ""}
          placeholder="Auto generated"
          className="w-full rounded border border-slate-200 bg-emerald-100 px-2 py-1 text-sm"
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
      <div className="relative">
        <h1 className="text-lg font-semibold text-teal-600 text-center">Update Reverted Disposal - Internal</h1>
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


        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="font-semibold text-center text-teal-600">
            Previously Uploaded Disposal Documents

            <div className="flex mt-3">

              <h2 className="text-xs font-semibold text-slate-900 mx-4">Document Proof
                {(attachPaths && attachPaths?.PO_SO_AttachPath != "") &&
                  <span>
                    <img src="/downloadcloudblue.png" alt="" className="cursor-pointer h-10 my-2 place-self-center"
                      onClick={async () => await downloadAttachment(attachPaths?.PO_SO_AttachPath, "PO/SO Document")}
                    />
                  </span>}
                {(!attachPaths || attachPaths?.PO_SO_AttachPath == "") && <div className=" text-sm h-10 mt-5 text-gray-600 place-self-center">N/A</div>}
              </h2>

            </div>
          </div>
        </div>

        <div className="mx-5">

          <div className="text-sm font-semibold my-1 text-slate-500">
            Approver Remarks : <span className="font-medium text-md text-slate-950">{String(values.ApproverRemarks)}</span>
          </div>

          <div className="text-sm font-semibold my-1 text-slate-500">
            Approval Status : <span className="font-medium text-md text-slate-950">{String(values.Status)}</span>
          </div>

        </div>
        <button
          type="submit"
          className="cursor-pointer rounded block place-self-center text-sm bg-emerald-700 px-3 py-2 text-white hover:bg-emerald-800"
        >
          Submit
        </button>
      </form>
    </section>
  );
}