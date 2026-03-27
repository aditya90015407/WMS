"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
 
type DisposalType = "auctionable" | "non-auctionable" | "";
 
export default function DisposalInitiatePage() {
  const router = useRouter();
  const [type, setType] = useState<DisposalType>("");
 
  const onContinue = () => {
    if (type === "auctionable") {
      router.push("/Disposal/Initiate/Auctionable");
      return;
    }
 
    if (type === "non-auctionable") {
      router.push("/Disposal/Initiate/NonAuctionable");
      return;
    }
  };
     
 
  return (
    <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Disposal Initiate</h1>
      <p className="mt-2 text-sm text-slate-600">
        Choose disposal type to continue.
      </p>
 
      <div className="mt-6 space-y-4 rounded-xl border border-slate-200 p-4">
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
          <input
            type="radio"
            name="disposalType"
            value="auctionable"
            checked={type === "auctionable"}
            onChange={() => setType("auctionable")}
            className="h-4 w-4"
          />
          <div>
            <p className="text-sm font-semibold text-slate-900">Auctionable</p>
            <p className="text-xs text-slate-600">
              Continue to filling auction application form .
            </p>
          </div>
        </label>
 
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
          <input
            type="radio"
            name="disposalType"
            value="non-auctionable"
            checked={type === "non-auctionable"}
            onChange={() => setType("non-auctionable")}
            className="h-4 w-4"
          />
          <div>
            <p className="text-sm font-semibold text-slate-900">Non Auctionable</p>
            <p className="text-xs text-slate-600">
              Continue to filling non-auctionable application form
            </p>
          </div>
        </label>
      </div>
 
      <div className="mt-6">
        <button
          type="button"
          onClick={onContinue}
          disabled={!type}
          className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
            type ? "bg-emerald-700 hover:bg-emerald-800" : "bg-slate-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </section>
  );
}
 