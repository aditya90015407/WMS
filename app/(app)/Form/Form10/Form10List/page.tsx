"use client";

import React, { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import decrypt from "@/components/Decrypt";
import Form10Table, { type Form10Data } from "@/components/Form10Table";

const initialFormState: Form10Data = {
  senderNameAddress: "",
  senderPhone: "",
  senderEmail: "",
  senderAuthorizationNo: "",
  manifestDocumentNo: "",
  transporterNameAddress: "",
  transporterPhone: "",
  transporterEmail: "",
  vehicleType: "",
  transporterRegistrationNo: "",
  vehicleRegistrationNo: "",
  receiverNameAddress: "",
  receiverPhone: "",
  receiverEmail: "",
  receiverAuthorizationNo: "",
  wasteDescription: "",
  totalQuantity: "",
  quantityUnit: "m3",
  noOfContainers: "",
  physicalForm: "",
  specialHandlingInfo: "",
  senderNameStamp: "",
  senderSignature: "",
  senderMonth: "",
  senderDay: "",
  senderYear: "",
  transporterNameStamp: "",
  transporterSignature: "",
  transporterMonth: "",
  transporterDay: "",
  transporterYear: "",
  receiverNameStamp: "",
  receiverSignature: "",
  receiverMonth: "",
  receiverDay: "",
  receiverYear: "",
};

const getFirstValue = (row: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return "";
};

const mapVehicleType = (value: string) => {
  if (value === "1" || value.toLowerCase() === "truck") return "Truck";
  if (value === "2" || value.toLowerCase() === "tanker") return "Tanker";
  if (value === "3" || value.toLowerCase() === "special vehicle") return "Special Vehicle";
  return value;
};

const mapPhysicalForm = (value: string) => {
  if (value === "1" || value.toLowerCase() === "solid") return "Solid";
  if (value === "2" || value.toLowerCase() === "semi-solid" || value.toLowerCase() === "semisolid") return "Semi-solid";
  if (value === "3" || value.toLowerCase() === "sludge") return "Sludge";
  if (value === "4" || value.toLowerCase() === "oily") return "Oily";
  if (value === "5" || value.toLowerCase() === "tarry") return "Tarry";
  if (value === "6" || value.toLowerCase() === "slurry") return "Slurry";
  if (value === "7" || value.toLowerCase() === "liquid") return "Liquid";
  return value;
};

export default function Form10Page({ searchParams }: { searchParams: Promise<{ fddid?: string, iddid: string }> }) {
  // const params = useSearchParams();

  const params = React.use(searchParams);
  // const fddid = params.fddid;
  // const iddid = params.iddid;

  const [fddid, setFddid] = useState("");
  const [iddid, setIddid] = useState("");
  const [ready, setReady] = useState(false);

  // useEffect(()=>{

  //    const fddid1 = params.fddid;
  //     const iddid1 = params.iddid;


  // })

  useEffect(() => {
    const handleDecrypt = async () => {
      const fddid1 = params.fddid;
      const iddid1 = params.iddid;
      const a: string = fddid1 ? (await decrypt(fddid1)) ?? "" : "";
      const b: string = iddid1 ? (await decrypt(iddid1)) ?? "" : "";
      setIddid(b);
      setFddid(a);
      setReady(true);

    };

    void handleDecrypt();
  }, [fddid, iddid]);

  // console.log(fddid, iddid)


  const [form, setForm] = useState<Form10Data>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const loadForm10Details = async () => {
      if (!ready) return;
      if (!fddid) {
        setStatus("Missing final disposal id.");
        return;
      }

      if (!iddid) {
        setStatus("Missing disposal id.");
        return;
      }
      console.log("fddid:", fddid);
      console.log("iddid:", iddid);

      try {
        // const statusRes = await fetch("/api/GetData/GetDisposalApprovalStatus", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ FDDID: fddid }),
        // });

        // console.log(statusRes)
        // const statusData = await statusRes.json();
        // if (!statusRes.ok || !statusData.success) {
        //   setStatus(statusData.message || "Failed to check disposal approval status.");
        //   return;
        // }

        // const statusRow = Array.isArray(statusData.data) ? statusData.data[0] : statusData.data;
        // const stsCode = Number(statusRow?.StsCode ?? 0);
        // console.log(stsCode)

        // if (stsCode === 5) {
        //   setStatus("Form 10 is rejected.");
        //   return;
        // }

        // if (stsCode !== 3) {
        //   setStatus("Form 10 is available only after disposal approval.");
        //   return;
        // }

        const fetchRow = async (url: string, body: Record<string, string>) => {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          // console.log(fetchRow)

          const data = await res.json();
          if (!res.ok || !data.success) {
            return null;
          }

          const row = (Array.isArray(data.data) ? data.data[0] : data.data) as
            | Record<string, unknown>
            | undefined;

          return row && Object.keys(row).length > 0 ? row : null;
        };
        // console.log(iddid)
        const row =
          (await fetchRow("/api/GetData/GetForm10Details", { ID: iddid })) ??
          (await fetchRow("/api/GetData/GetSelectedVendorDetails", { ID: iddid }));
        console.log(row);

        if (!row) {
          setStatus("Failed to load Form 10 details.");
          return;
        }
        // console.log(fetchRow)
        const transporterName = getFirstValue(row, ["TransporterName"]);
        const transporterAddress = getFirstValue(row, ["TransporterAddress"]);
        const receiverName = getFirstValue(row, ["ReceiverName"]);
        const receiverAddress = getFirstValue(row, ["ReceiverAddress"]);

        setForm({
          senderNameAddress: getFirstValue(row, [
            "SenderNameAddress",
            "UnitDesc",
            "NAME",
            "SenderName",
          ]),
          senderPhone: getFirstValue(row, ["SenderPhone", "Phone", "PHONE"]),
          senderEmail: getFirstValue(row, ["SenderEmail", "EMAIL", "Email"]),
          senderAuthorizationNo: getFirstValue(row, ["SenderAuthorizationNo", "SenderAuthNo"]),
          manifestDocumentNo: getFirstValue(row, ["ManifestDocumentNo", "IDDID", "ID"]),
          transporterNameAddress: [transporterName, transporterAddress].filter(Boolean).join(" "),
          transporterPhone: getFirstValue(row, ["TransporterPhone"]),
          transporterEmail: getFirstValue(row, ["TransporterEmail"]),
          vehicleType: mapVehicleType(getFirstValue(row, ["VehicleType", "VTID"])),
          transporterRegistrationNo: getFirstValue(row, ["TransporterRegNo", "TransporterRegistrationNo"]),
          vehicleRegistrationNo: getFirstValue(row, ["VehicleRegNo", "VehicleRegistrationNo"]),
          receiverNameAddress: [receiverName, receiverAddress].filter(Boolean).join(" "),
          receiverPhone: getFirstValue(row, ["ReceiverPhone"]),
          receiverEmail: getFirstValue(row, ["ReceiverEmail"]),
          receiverAuthorizationNo: getFirstValue(row, ["ReceiverAuthorizationNo", "ReceiverAuthNo"]),
          wasteDescription: getFirstValue(row, ["WasteDescription", "Waste"]),
          totalQuantity: getFirstValue(row, ["TotalQuantity", "TotalQty"]),
          quantityUnit: getFirstValue(row, ["QuantityUnit"]) || "m3",
          noOfContainers: getFirstValue(row, ["NoOfContainers"]),
          physicalForm: mapPhysicalForm(getFirstValue(row, ["PhysicalForm", "PSID"])),
          specialHandlingInfo: getFirstValue(row, ["SpecialHandlingInfo", "SpecialHandlingInstructions"]),
          senderNameStamp: getFirstValue(row, ["SenderNameStamp"]),
          senderSignature: getFirstValue(row, ["SenderSignature"]),
          senderMonth: getFirstValue(row, ["SenderMonth"]),
          senderDay: getFirstValue(row, ["SenderDay"]),
          senderYear: getFirstValue(row, ["SenderYear"]),
          transporterNameStamp: getFirstValue(row, ["TransporterNameStamp"]),
          transporterSignature: getFirstValue(row, ["TransporterSignature"]),
          transporterMonth: getFirstValue(row, ["TransporterMonth"]),
          transporterDay: getFirstValue(row, ["TransporterDay"]),
          transporterYear: getFirstValue(row, ["TransporterYear"]),
          receiverNameStamp: getFirstValue(row, ["ReceiverNameStamp"]),
          receiverSignature: getFirstValue(row, ["ReceiverSignature"]),
          receiverMonth: getFirstValue(row, ["ReceiverMonth"]),
          receiverDay: getFirstValue(row, ["ReceiverDay"]),
          receiverYear: getFirstValue(row, ["ReceiverYear"]),
        });

        setStatus("Form 10 details loaded successfully.");
      } catch (error) {
        console.error("Failed to load Form 10 details", error);
        setStatus("Failed to load Form 10 details.");
      }
    };

    void loadForm10Details();
  }, [fddid, iddid, ready]);


  const updateField = <K extends keyof Form10Data>(key: K, value: Form10Data[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    if (!form.senderNameAddress.trim()) nextErrors.senderNameAddress = "Sender name and address is required.";
    if (!form.manifestDocumentNo.trim()) nextErrors.manifestDocumentNo = "Manifest document number is required.";
    if (!form.transporterNameAddress.trim()) nextErrors.transporterNameAddress = "Transporter name and address is required.";
    if (!form.receiverNameAddress.trim()) nextErrors.receiverNameAddress = "Receiver name and address is required.";
    if (!form.wasteDescription.trim()) nextErrors.wasteDescription = "Waste description is required.";
    return nextErrors;
  };

  const onSaveDraft = () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("Please fix the required fields before saving.");
      return;
    }
    setStatus("Draft saved locally. Backend integration will be added later.");
  };

  const onReset = () => {
    if (!window.confirm("Reset all Form 10 fields?")) return;
    setForm(initialFormState);
    setErrors({});
    setStatus("");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-6 w-full">
      <Form10Table form={form} editable errors={errors} onFieldChange={updateField} />

      {status && (
        <p
          className={`mt-4 text-sm ${status.toLowerCase().includes("fail") || status.toLowerCase().includes("fix")
            ? "text-red-600"
            : "text-green-700"
            }`}
        >
          {status}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSaveDraft}
          className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Print
        </button>
      </div>
    </section>
  );
}