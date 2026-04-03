"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

export default function HazardousForm10Page() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";

  const [form, setForm] = useState<Form10Data>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const loadForm10Details = async () => {
        console.log(id)
      if (!id) return;

      try {
        const res = await fetch("/api/GetData/GetForm10Details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ID: id }),
        });

        const data = await res.json();

        console.log("Form10 id:", id);
        console.log("Form10 raw data:", data);
        console.log("res.ok:", res.ok);
        console.log("data.success:", data.success);
        console.log("data.data:", data.data);

if (!res.ok || !data.success) {
  setStatus(data.message || "Failed to load Form 10 details.");
  return;
}

const row = (Array.isArray(data.data) ? data.data[0] : data.data) as Record<string, unknown>;
        // console.log(row)
      


        const transporterName = getFirstValue(row, ["TransporterName"]);
        const transporterAddress = getFirstValue(row, ["TransporterAddress"]);
        const receiverName = getFirstValue(row, ["ReceiverName"]);
        const receiverAddress = getFirstValue(row, ["ReceiverAddress"]);

        setForm({
          senderNameAddress: getFirstValue(row, ["SenderNameAddress", "NAME", "SenderName"]),
          senderPhone: getFirstValue(row, ["SenderPhone", "Phone", "PHONE"]),
          senderEmail: getFirstValue(row, ["SenderEmail", "EMAIL", "Email"]),
          senderAuthorizationNo: getFirstValue(row, ["SenderAuthorizationNo", "SenderAuthNo"]),
          manifestDocumentNo: getFirstValue(row, ["ManifestDocumentNo"]),
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
  }, [id]);

  

  const updateField = <K extends keyof Form10Data>(key: K, value: Form10Data[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-6">
      <Form10Table form={form} editable errors={errors} onFieldChange={updateField} />

      {status && (
        <p
          className={`mt-4 text-sm ${
            status.toLowerCase().includes("fail") ? "text-red-600" : "text-green-700"
          }`}
        >
          {status}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Print
        </button>
      </div>
    </section>
  );
}
