"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import decrypt from "@/components/Decrypt";

type Field =
  | [string, string]
  | [[string, string], string];

type FinalDisposalRow = Record<
  string,
  string | number | boolean | null
>;


const editableFields = [
//   "WasteCategory",
//   "Waste",
  "IRName",
  "PhysicalState",
  "TotalQty",
  "MUnit",
];

const fields: Field[] = [
  ["ID", "Final Disposal Ref No."],
  ["IDDID", "Original Disposal ID"],
  ["WasteCategory", "Waste Category"],
  ["Waste", "Waste Description"],
  [["TotalQty", "MUnit"], "Total Quantity"],
  ["IRName", "Internal Receiver Name"],
  ["PhysicalState", "Physical State"],
];

export default function DisposalApproveInternalPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const router = useRouter();

  const [row, setRow] =
    useState<FinalDisposalRow | null>(null);

  // EDITABLE STATE
  const [formData, setFormData] =
    useState<FinalDisposalRow>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [id, setId] = useState("");
  const [ready, setReady] = useState(false);

  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const params = React.use(searchParams);

  const encryptedId = params.id ?? "";

  // DECRYPT ID
  useEffect(() => {
    const handleDecrypt = async () => {
      const decryptedId = encryptedId
        ? (await decrypt(encryptedId)) ?? ""
        : "";

      setId(decryptedId);
      setReady(true);
    };

    void handleDecrypt();
  }, [encryptedId]);

  // LOAD DATA
  useEffect(() => {
    const loadRow = async () => {
      if (!ready) return;

      if (!id) {
        setLoading(false);
        setError("Missing record id");
        return;
      }

      try {
        const res = await fetch(
          "/api/GetData/GetAllFinalRejectedDisposalList",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const rawData = await res.json();

        const rows = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data)
          ? rawData.data
          : [];

        const match =
          rows.find(
            (item: Record<string, unknown>) =>
              String(item?.IDDID ?? "") === id
          ) ?? null;

        setRow(match);

        if (!match) {
          setError("Submitted disposal form not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load submitted disposal form");
      } finally {
        setLoading(false);
      }
    };

    void loadRow();
  }, [id, ready]);

  // COPY API DATA INTO EDITABLE STATE
  useEffect(() => {
    if (row) {
      console.log(row,"ROW")
      setFormData(row);
    }
  }, [row]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   const payload = {
        ID: id,
        TotalQty:formData.TotalQty,
        AID : formData.AID,
        PhysicalState : formData.PhysicalState,

        };

  
    const res = await fetch("/api/SetData/UpdateFinalDisposalDetails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log(data);
   
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Disposal Approval - Internal
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Verify the submitted internal disposal form
            before taking action.
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Review Date: {today}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push("/Disposal/Approve")
          }
          className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Back to Queue
        </button>
      </div>

      {loading && (
        <p className="mt-4 text-sm text-slate-600">
          Loading submitted form...
        </p>
      )}

      {!loading && error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && row && (
        <>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-200 px-3 py-2 text-left">
                    Field Name
                  </th>

                  <th className="border border-slate-200 px-3 py-2 text-left">
                    Submitted Value
                  </th>
                </tr>
              </thead>

              <tbody>
                {fields.map(([key, label], index) => (
                  <tr key={`${label}-${index}`}>
                    <td className="border border-slate-200 px-3 py-2 align-top">
                      {label}
                    </td>

                    <td className="border border-slate-200 px-3 py-2 whitespace-pre-wrap">
                            {Array.isArray(key) ? (
                                <div className="flex gap-2">
                                {key.map((k) =>
                                    editableFields.includes(k) ? (
                                    <input
                                        key={k}
                                        type="text"
                                        value={String(formData?.[k] ?? "")}
                                        onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            [k]: e.target.value,
                                        }))
                                        }
                                        className="w-full rounded border border-slate-300 px-2 py-1"
                                    />
                                    ) : (
                                    <span key={k}>
                                        {String(formData?.[k] ?? "-")}
                                    </span>
                                    )
                                )}
                                </div>
                            ) : editableFields.includes(key) ? (
                                <input
                                type="text"
                                value={String(formData?.[key] ?? "")}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                    }))
                                }
                                className="w-full rounded border border-slate-300 px-2 py-1"
                                />
                            ) : (
                                String(formData?.[key] ?? "-")
                            )}
                            </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
            >
              Submit
            </button>
          </div>
        </>
      )}
    </section>
  );
}