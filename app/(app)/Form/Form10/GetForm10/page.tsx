"use client";

import { useState } from "react";

type Form10State = {
  senderNameAddress: string;
  senderPhone: string;
  senderEmail: string;
  senderAuthorizationNo: string;
  manifestDocumentNo: string;
  transporterNameAddress: string;
  transporterPhone: string;
  transporterEmail: string;
  vehicleType: string;
  transporterRegistrationNo: string;
  vehicleRegistrationNo: string;
  receiverNameAddress: string;
  receiverPhone: string;
  receiverEmail: string;
  receiverAuthorizationNo: string;
  wasteDescription: string;
  totalQuantity: string;
  quantityUnit: string;
  noOfContainers: string;
  physicalForm: string;
  specialHandlingInfo: string;
  senderNameStamp: string;
  senderSignature: string;
  senderMonth: string;
  senderDay: string;
  senderYear: string;
  transporterNameStamp: string;
  transporterSignature: string;
  transporterMonth: string;
  transporterDay: string;
  transporterYear: string;
  receiverNameStamp: string;
  receiverSignature: string;
  receiverMonth: string;
  receiverDay: string;
  receiverYear: string;
};

const initialFormState: Form10State = {
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

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none";

const textAreaClass =
  "w-full min-h-[88px] rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none";

const rowLabelClass = "text-sm font-medium text-slate-800";

export default function Form10Page() {
  const [form, setForm] = useState<Form10State>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string>("");

  const updateField = <K extends keyof Form10State>(key: K, value: Form10State[K]) => {
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
    if (!form.senderNameAddress.trim()) {
      nextErrors.senderNameAddress = "Sender name and address is required.";
    }
    if (!form.manifestDocumentNo.trim()) {
      nextErrors.manifestDocumentNo = "Manifest document number is required.";
    }
    if (!form.transporterNameAddress.trim()) {
      nextErrors.transporterNameAddress = "Transporter name and address is required.";
    }
    if (!form.receiverNameAddress.trim()) {
      nextErrors.receiverNameAddress = "Receiver name and address is required.";
    }
    if (!form.wasteDescription.trim()) {
      nextErrors.wasteDescription = "Waste description is required.";
    }
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
    const confirmed = window.confirm("Reset all Form 10 fields?");
    if (!confirmed) return;
    setForm(initialFormState);
    setErrors({});
    setStatus("");
  };

  const onPrint = () => {
    window.print();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">FORM 10</h1>
        <p className="text-sm italic text-slate-700">[See rule 19 (1)]</p>
        <h2 className="mt-2 text-base font-semibold text-slate-900">
          MANIFEST FOR HAZARDOUS AND OTHER WASTE
        </h2>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-lg border border-slate-300 p-3">
          <p className={rowLabelClass}>
            1. Sender&apos;s name and mailing address (including Phone No. and e-mail)
          </p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <textarea
              className={`${textAreaClass} md:col-span-3 ${errors.senderNameAddress ? "border-red-500" : ""}`}
              value={form.senderNameAddress}
              onChange={(e) => updateField("senderNameAddress", e.target.value)}
              placeholder="Sender name and mailing address"
            />
            <input
              className={inputClass}
              value={form.senderPhone}
              onChange={(e) => updateField("senderPhone", e.target.value)}
              placeholder="Phone No."
            />
            <input
              className={inputClass}
              value={form.senderEmail}
              onChange={(e) => updateField("senderEmail", e.target.value)}
              placeholder="E-mail"
            />
          </div>
          {errors.senderNameAddress && (
            <p className="mt-1 text-xs text-red-600">{errors.senderNameAddress}</p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-300 p-3">
            <p className={rowLabelClass}>2. Sender&apos;s authorisation No.</p>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.senderAuthorizationNo}
              onChange={(e) => updateField("senderAuthorizationNo", e.target.value)}
              placeholder="Enter authorisation number"
            />
          </div>
          <div className="rounded-lg border border-slate-300 p-3">
            <p className={rowLabelClass}>3. Manifest Document No.</p>
            <input
              className={`mt-2 w-full rounded-md border px-3 py-2 text-sm ${
                errors.manifestDocumentNo ? "border-red-500" : "border-slate-300"
              }`}
              value={form.manifestDocumentNo}
              onChange={(e) => updateField("manifestDocumentNo", e.target.value)}
              placeholder="Enter manifest document number"
            />
            {errors.manifestDocumentNo && (
              <p className="mt-1 text-xs text-red-600">{errors.manifestDocumentNo}</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-300 p-3">
          <p className={rowLabelClass}>
            4. Transporter&apos;s name and address (including Phone No. and e-mail)
          </p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <textarea
              className={`${textAreaClass} md:col-span-3 ${
                errors.transporterNameAddress ? "border-red-500" : ""
              }`}
              value={form.transporterNameAddress}
              onChange={(e) => updateField("transporterNameAddress", e.target.value)}
              placeholder="Transporter name and address"
            />
            <input
              className={inputClass}
              value={form.transporterPhone}
              onChange={(e) => updateField("transporterPhone", e.target.value)}
              placeholder="Phone No."
            />
            <input
              className={inputClass}
              value={form.transporterEmail}
              onChange={(e) => updateField("transporterEmail", e.target.value)}
              placeholder="E-mail"
            />
          </div>
          {errors.transporterNameAddress && (
            <p className="mt-1 text-xs text-red-600">{errors.transporterNameAddress}</p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-300 p-3">
            <p className={rowLabelClass}>5. Type of vehicle</p>
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.vehicleType}
              onChange={(e) => updateField("vehicleType", e.target.value)}
            >
              <option value="">Select vehicle type</option>
              <option value="Truck">Truck</option>
              <option value="Tanker">Tanker</option>
              <option value="Special Vehicle">Special Vehicle</option>
            </select>
          </div>
          <div className="rounded-lg border border-slate-300 p-3">
            <p className={rowLabelClass}>6. Transporter&apos;s registration No.</p>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.transporterRegistrationNo}
              onChange={(e) => updateField("transporterRegistrationNo", e.target.value)}
              placeholder="Enter transporter registration no."
            />
          </div>
          <div className="rounded-lg border border-slate-300 p-3">
            <p className={rowLabelClass}>7. Vehicle registration No.</p>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.vehicleRegistrationNo}
              onChange={(e) => updateField("vehicleRegistrationNo", e.target.value)}
              placeholder="Enter vehicle registration no."
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-300 p-3">
          <p className={rowLabelClass}>
            8. Receiver&apos;s name and mailing address (including Phone No. and e-mail)
          </p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <textarea
              className={`${textAreaClass} md:col-span-3 ${errors.receiverNameAddress ? "border-red-500" : ""}`}
              value={form.receiverNameAddress}
              onChange={(e) => updateField("receiverNameAddress", e.target.value)}
              placeholder="Receiver name and mailing address"
            />
            <input
              className={inputClass}
              value={form.receiverPhone}
              onChange={(e) => updateField("receiverPhone", e.target.value)}
              placeholder="Phone No."
            />
            <input
              className={inputClass}
              value={form.receiverEmail}
              onChange={(e) => updateField("receiverEmail", e.target.value)}
              placeholder="E-mail"
            />
          </div>
          {errors.receiverNameAddress && (
            <p className="mt-1 text-xs text-red-600">{errors.receiverNameAddress}</p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-300 p-3">
            <p className={rowLabelClass}>9. Receiver&apos;s authorisation No.</p>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.receiverAuthorizationNo}
              onChange={(e) => updateField("receiverAuthorizationNo", e.target.value)}
              placeholder="Enter receiver authorisation no."
            />
          </div>
          <div className="rounded-lg border border-slate-300 p-3">
            <p className={rowLabelClass}>10. Waste description</p>
            <input
              className={`mt-2 w-full rounded-md border px-3 py-2 text-sm ${
                errors.wasteDescription ? "border-red-500" : "border-slate-300"
              }`}
              value={form.wasteDescription}
              onChange={(e) => updateField("wasteDescription", e.target.value)}
              placeholder="Enter waste description"
            />
            {errors.wasteDescription && (
              <p className="mt-1 text-xs text-red-600">{errors.wasteDescription}</p>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-300 p-3">
            <p className={rowLabelClass}>11. Total quantity</p>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.totalQuantity}
              onChange={(e) => updateField("totalQuantity", e.target.value)}
              placeholder="Enter quantity"
            />
          </div>
          <div className="rounded-lg border border-slate-300 p-3">
            <p className={rowLabelClass}>Unit</p>
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.quantityUnit}
              onChange={(e) => updateField("quantityUnit", e.target.value)}
            >
              <option value="m3">m3</option>
              <option value="MT">MT</option>
            </select>
          </div>
          <div className="rounded-lg border border-slate-300 p-3">
            <p className={rowLabelClass}>No. of containers</p>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.noOfContainers}
              onChange={(e) => updateField("noOfContainers", e.target.value)}
              placeholder="Enter number of containers"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-300 p-3">
            <p className={rowLabelClass}>12. Physical form</p>
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.physicalForm}
              onChange={(e) => updateField("physicalForm", e.target.value)}
            >
              <option value="">Select physical form</option>
              <option value="Solid">Solid</option>
              <option value="Semi-solid">Semi-solid</option>
              <option value="Sludge">Sludge</option>
              <option value="Oily">Oily</option>
              <option value="Tarry">Tarry</option>
              <option value="Slurry">Slurry</option>
              <option value="Liquid">Liquid</option>
            </select>
          </div>
          <div className="rounded-lg border border-slate-300 p-3">
            <p className={rowLabelClass}>
              13. Special handling instructions and additional information
            </p>
            <textarea
              className="mt-2 w-full min-h-[90px] rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.specialHandlingInfo}
              onChange={(e) => updateField("specialHandlingInfo", e.target.value)}
              placeholder="Enter special handling instructions"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-300 p-3">
          <p className={rowLabelClass}>14. Sender&apos;s Certificate</p>
          <p className="mt-2 text-sm text-slate-700">
            I hereby declare that the contents of the consignment are fully and accurately
            described above by proper shipping name and are categorised, packed, marked,
            and labelled, and are in all respects in proper conditions for transport by road
            according to applicable national government regulations.
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-5">
            <input
              className={inputClass}
              value={form.senderNameStamp}
              onChange={(e) => updateField("senderNameStamp", e.target.value)}
              placeholder="Name and stamp"
            />
            <input
              className={inputClass}
              value={form.senderSignature}
              onChange={(e) => updateField("senderSignature", e.target.value)}
              placeholder="Signature"
            />
            <input
              className={inputClass}
              value={form.senderMonth}
              onChange={(e) => updateField("senderMonth", e.target.value)}
              placeholder="Month"
            />
            <input
              className={inputClass}
              value={form.senderDay}
              onChange={(e) => updateField("senderDay", e.target.value)}
              placeholder="Day"
            />
            <input
              className={inputClass}
              value={form.senderYear}
              onChange={(e) => updateField("senderYear", e.target.value)}
              placeholder="Year"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-300 p-3">
          <p className={rowLabelClass}>15. Transporter acknowledgement of receipt of Wastes</p>
          <div className="mt-3 grid gap-2 md:grid-cols-5">
            <input
              className={inputClass}
              value={form.transporterNameStamp}
              onChange={(e) => updateField("transporterNameStamp", e.target.value)}
              placeholder="Name and stamp"
            />
            <input
              className={inputClass}
              value={form.transporterSignature}
              onChange={(e) => updateField("transporterSignature", e.target.value)}
              placeholder="Signature"
            />
            <input
              className={inputClass}
              value={form.transporterMonth}
              onChange={(e) => updateField("transporterMonth", e.target.value)}
              placeholder="Month"
            />
            <input
              className={inputClass}
              value={form.transporterDay}
              onChange={(e) => updateField("transporterDay", e.target.value)}
              placeholder="Day"
            />
            <input
              className={inputClass}
              value={form.transporterYear}
              onChange={(e) => updateField("transporterYear", e.target.value)}
              placeholder="Year"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-300 p-3">
          <p className={rowLabelClass}>
            16. Receiver&apos;s certification for receipt of hazardous and other waste
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-5">
            <input
              className={inputClass}
              value={form.receiverNameStamp}
              onChange={(e) => updateField("receiverNameStamp", e.target.value)}
              placeholder="Name and stamp"
            />
            <input
              className={inputClass}
              value={form.receiverSignature}
              onChange={(e) => updateField("receiverSignature", e.target.value)}
              placeholder="Signature"
            />
            <input
              className={inputClass}
              value={form.receiverMonth}
              onChange={(e) => updateField("receiverMonth", e.target.value)}
              placeholder="Month"
            />
            <input
              className={inputClass}
              value={form.receiverDay}
              onChange={(e) => updateField("receiverDay", e.target.value)}
              placeholder="Day"
            />
            <input
              className={inputClass}
              value={form.receiverYear}
              onChange={(e) => updateField("receiverYear", e.target.value)}
              placeholder="Year"
            />
          </div>
        </div>
      </div>

      {status && (
        <p
          className={`mt-4 text-sm ${
            status.toLowerCase().includes("fix") ? "text-red-600" : "text-green-700"
          }`}
        >
          {status}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSaveDraft}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Print
        </button>
      </div>
    </section>
  );
}

