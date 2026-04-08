"use client";

import React from "react";

export type Form10Data = {
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

type Props = {
  form: Form10Data;
  editable?: boolean;
  errors?: Record<string, string>;
  onFieldChange?: <K extends keyof Form10Data>(key: K, value: Form10Data[K]) => void;
};

const inputClass =
  "w-full border-0 bg-transparent px-2 py-1 text-sm text-slate-900 outline-none";

const textAreaClass =
  "min-h-[72px] w-full resize-none border-0 bg-transparent px-2 py-1 text-sm text-slate-900 outline-none";

const cellValueClass = "min-h-[34px] px-2 py-1 text-sm text-slate-900 whitespace-pre-wrap";

const renderField = <K extends keyof Form10Data>(
  form: Form10Data,
  key: K,
  editable: boolean,
  onFieldChange?: <T extends keyof Form10Data>(field: T, value: Form10Data[T]) => void,
  options?: string[],
) => {
  if (!editable || !onFieldChange) {
    return <div className={cellValueClass}>{form[key]}</div>;
  }

  if (options) {
    return (
      <select
        value={form[key]}
        onChange={(e) => onFieldChange(key, e.target.value as Form10Data[K])}
        className={inputClass}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      value={form[key]}
      onChange={(e) => onFieldChange(key, e.target.value as Form10Data[K])}
      className={inputClass}
    />
  );
};

const renderArea = <K extends keyof Form10Data>(
  form: Form10Data,
  key: K,
  editable: boolean,
  onFieldChange?: <T extends keyof Form10Data>(field: T, value: Form10Data[T]) => void,
) => {
  if (!editable || !onFieldChange) {
    return <div className={cellValueClass}>{form[key]}</div>;
  }

  return (
    <textarea
      value={form[key]}
      onChange={(e) => onFieldChange(key, e.target.value as Form10Data[K])}
      className={textAreaClass}
      rows={3}
    />
  );
};

export default function Form10Table({
  form,
  editable = false,
  errors,
  onFieldChange,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-400">
      <div className="border-b border-slate-400 px-4 py-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">FORM 10</h1>
        <p className="text-sm italic text-slate-700">[See rule 19 (1)]</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">
          MANIFEST FOR HAZARDOUS AND OTHER WASTE
        </h2>
      </div>

      <table className="min-w-[980px] w-full border-collapse text-sm">
        <tbody>
          <tr>
            <td className="border border-slate-400 px-3 py-2 align-top font-semibold">1.</td>
            <td className="border border-slate-400 px-3 py-2 align-top font-medium">
              Sender&apos;s name and mailing address
              <br />
              (including Phone No. and e-mail)
            </td>
            <td className="border border-slate-400 p-0 align-top">
              {renderArea(form, "senderNameAddress", editable, onFieldChange)}
              <div className="grid grid-cols-2 border-t border-slate-300">
                <div className="border-r border-slate-300">
                  {renderField(form, "senderPhone", editable, onFieldChange)}
                </div>
                <div>{renderField(form, "senderEmail", editable, onFieldChange)}</div>
              </div>
              {errors?.senderNameAddress && (
                <p className="px-2 pb-2 text-xs text-red-600">{errors.senderNameAddress}</p>
              )}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 font-semibold">2.</td>
            <td className="border border-slate-400 px-3 py-2 font-medium">
              Sender&apos;s authorisation No.
            </td>
            <td className="border border-slate-400 p-0">
              {renderField(form, "senderAuthorizationNo", editable, onFieldChange)}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 font-semibold">3.</td>
            <td className="border border-slate-400 px-3 py-2 font-medium">
              Manifest Document No.
            </td>
            <td className="border border-slate-400 p-0">
              {renderField(form, "manifestDocumentNo", editable, onFieldChange)}
              {errors?.manifestDocumentNo && (
                <p className="px-2 pb-2 text-xs text-red-600">{errors.manifestDocumentNo}</p>
              )}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 align-top font-semibold">4.</td>
            <td className="border border-slate-400 px-3 py-2 align-top font-medium">
              Transporter&apos;s name and address
              <br />
              (including Phone No. and e-mail)
            </td>
            <td className="border border-slate-400 p-0 align-top">
              {renderArea(form, "transporterNameAddress", editable, onFieldChange)}
              <div className="grid grid-cols-2 border-t border-slate-300">
                <div className="border-r border-slate-300">
                  {renderField(form, "transporterPhone", editable, onFieldChange)}
                </div>
                <div>{renderField(form, "transporterEmail", editable, onFieldChange)}</div>
              </div>
              {errors?.transporterNameAddress && (
                <p className="px-2 pb-2 text-xs text-red-600">{errors.transporterNameAddress}</p>
              )}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 font-semibold">5.</td>
            <td className="border border-slate-400 px-3 py-2 font-medium">Type of vehicle</td>
            <td className="border border-slate-400 p-0">
              {renderField(form, "vehicleType", editable, onFieldChange, [
                "Truck",
                "Tanker",
                "Special Vehicle",
              ])}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 font-semibold">6.</td>
            <td className="border border-slate-400 px-3 py-2 font-medium">
              Transporter&apos;s registration No.
            </td>
            <td className="border border-slate-400 p-0">
              {renderField(form, "transporterRegistrationNo", editable, onFieldChange)}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 font-semibold">7.</td>
            <td className="border border-slate-400 px-3 py-2 font-medium">
              Vehicle registration No.
            </td>
            <td className="border border-slate-400 p-0">
              {renderField(form, "vehicleRegistrationNo", editable, onFieldChange)}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 align-top font-semibold">8.</td>
            <td className="border border-slate-400 px-3 py-2 align-top font-medium">
              Receiver&apos;s name and mailing address
              <br />
              (including Phone No. and e-mail)
            </td>
            <td className="border border-slate-400 p-0 align-top">
              {renderArea(form, "receiverNameAddress", editable, onFieldChange)}
              <div className="grid grid-cols-2 border-t border-slate-300">
                <div className="border-r border-slate-300">
                  {renderField(form, "receiverPhone", editable, onFieldChange)}
                </div>
                <div>{renderField(form, "receiverEmail", editable, onFieldChange)}</div>
              </div>
              {errors?.receiverNameAddress && (
                <p className="px-2 pb-2 text-xs text-red-600">{errors.receiverNameAddress}</p>
              )}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 font-semibold">9.</td>
            <td className="border border-slate-400 px-3 py-2 font-medium">
              Receiver&apos;s authorisation No.
            </td>
            <td className="border border-slate-400 p-0">
              {renderField(form, "receiverAuthorizationNo", editable, onFieldChange)}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 font-semibold">10.</td>
            <td className="border border-slate-400 px-3 py-2 font-medium">Waste description</td>
            <td className="border border-slate-400 p-0">
              {renderField(form, "wasteDescription", editable, onFieldChange)}
              {errors?.wasteDescription && (
                <p className="px-2 pb-2 text-xs text-red-600">{errors.wasteDescription}</p>
              )}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 align-top font-semibold">11.</td>
            <td className="border border-slate-400 px-3 py-2 align-top font-medium">
              <div>Total quantity</div>
              <div className="mt-2">No. of Containers</div>
            </td>
            <td className="border border-slate-400 p-0">
              <div className="border-b border-slate-300 p-0">
                <div className="grid grid-cols-[1fr_auto]">
                  <div>{renderField(form, "totalQuantity", editable, onFieldChange)}</div>
                  <div className="px-3 py-2 text-sm text-slate-700">
                    {form.quantityUnit || "m3 or MT"}
                  </div>
                </div>
              </div>
              <div>{renderField(form, "noOfContainers", editable, onFieldChange)}</div>
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 font-semibold">12.</td>
            <td className="border border-slate-400 px-3 py-2 font-medium">Physical form</td>
            <td className="border border-slate-400 p-0">
              {renderField(form, "physicalForm", editable, onFieldChange, [
                "Solid",
                "Semi-solid",
                "Sludge",
                "Oily",
                "Tarry",
                "Slurry",
                "Liquid",
              ])}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 font-semibold">13.</td>
            <td className="border border-slate-400 px-3 py-2 font-medium">
              Special handling instructions and additional information
            </td>
            <td className="border border-slate-400 p-0">
              {renderArea(form, "specialHandlingInfo", editable, onFieldChange)}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 align-top font-semibold">14.</td>
            <td className="border border-slate-400 px-3 py-2 align-top font-medium">
              Sender&apos;s Certificate
            </td>
            <td className="border border-slate-400 px-3 py-2 text-sm leading-6 text-slate-900">
              I hereby declare that the contents of the consignment are fully and accurately
              described above by proper shipping name and are categorised, packed, marked,
              and labelled, and are in all respects in proper conditions for transport by road
              according to applicable national government regulations.
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2" />
            <td className="border border-slate-400 px-3 py-2" colSpan={2}>
              <div className="grid grid-cols-5 gap-2 text-sm">
                <div>
                  <div className="mb-1 font-medium">Name and stamp:</div>
                  {renderField(form, "senderNameStamp", editable, onFieldChange)}
                </div>
                <div>
                  <div className="mb-1 font-medium">Signature:</div>
                  {renderField(form, "senderSignature", editable, onFieldChange)}
                </div>
                <div>
                  <div className="mb-1 font-medium">Month</div>
                  {renderField(form, "senderMonth", editable, onFieldChange)}
                </div>
                <div>
                  <div className="mb-1 font-medium">Day</div>
                  {renderField(form, "senderDay", editable, onFieldChange)}
                </div>
                <div>
                  <div className="mb-1 font-medium">Year</div>
                  {renderField(form, "senderYear", editable, onFieldChange)}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 align-top font-semibold">15.</td>
            <td className="border border-slate-400 px-3 py-2 font-medium" colSpan={2}>
              Transporter acknowledgement of receipt of Wastes
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2" />
            <td className="border border-slate-400 px-3 py-2" colSpan={2}>
              <div className="grid grid-cols-5 gap-2 text-sm">
                <div>
                  <div className="mb-1 font-medium">Name and stamp:</div>
                  {renderField(form, "transporterNameStamp", editable, onFieldChange)}
                </div>
                <div>
                  <div className="mb-1 font-medium">Signature:</div>
                  {renderField(form, "transporterSignature", editable, onFieldChange)}
                </div>
                <div>
                  <div className="mb-1 font-medium">Month</div>
                  {renderField(form, "transporterMonth", editable, onFieldChange)}
                </div>
                <div>
                  <div className="mb-1 font-medium">Day</div>
                  {renderField(form, "transporterDay", editable, onFieldChange)}
                </div>
                <div>
                  <div className="mb-1 font-medium">Year</div>
                  {renderField(form, "transporterYear", editable, onFieldChange)}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2 align-top font-semibold">16.</td>
            <td className="border border-slate-400 px-3 py-2 font-medium" colSpan={2}>
              Receiver&apos;s certification for receipt of hazardous and other waste
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 px-3 py-2" />
            <td className="border border-slate-400 px-3 py-2" colSpan={2}>
              <div className="grid grid-cols-5 gap-2 text-sm">
                <div>
                  <div className="mb-1 font-medium">Name and stamp:</div>
                  {renderField(form, "receiverNameStamp", editable, onFieldChange)}
                </div>
                <div>
                  <div className="mb-1 font-medium">Signature:</div>
                  {renderField(form, "receiverSignature", editable, onFieldChange)}
                </div>
                <div>
                  <div className="mb-1 font-medium">Month</div>
                  {renderField(form, "receiverMonth", editable, onFieldChange)}
                </div>
                <div>
                  <div className="mb-1 font-medium">Day</div>
                  {renderField(form, "receiverDay", editable, onFieldChange)}
                </div>
                <div>
                  <div className="mb-1 font-medium">Year</div>
                  {renderField(form, "receiverYear", editable, onFieldChange)}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
