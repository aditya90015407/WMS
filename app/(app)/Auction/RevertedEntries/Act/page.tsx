"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import decrypt from "@/components/Decrypt";
import toast from "react-hot-toast";

type AuctionDetails = {
  AuctionDate?: string | null;
  CrDt?: string | null;
  WasteCategory?: string | null;
  Remarks?: string | null;
  Waste?: string | null;
  WasteQty?: string | number | null;
  TotalQty?: string | number | null;
};

export default function AuctionsReverted({ searchParams }: { searchParams: Promise<{ id?: string, iddid?: string }> }) {
  const params = React.use(searchParams);

  function normalizeData<T extends Record<string, any>>(row: T) {
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => {
        if (value === null || value === undefined) {
          return [key, "NA"];
        }

        if (typeof value === "object") {
          // return [key, JSON.stringify(value)];
          return [key, "NA"];
        }

        return [key, value];
      })
    );
  }

  type AuctionParticipant = {
    ID: string
    NAME: string
    EMAIL: string
    StsCode: string
    CrBy: string
    CrDt: string
    UpBy: string
    UpDt: string
    IsActive: string
    VendorCode: string
  }

  type AuctionParticipantLine = {
    ID: string
    APID: string
    CTO_AttachPath: string
    OSPCB_HW_Auth_AttachPath: string
    SPCB_HW_Auth_AttachPath: string
    BlueBook_AttachPath: string
    EPR_Cert_AttachPath: string
    Remarks: string
    CrBy: string
    CrDt: string
    IsActive: string
    ApproverRemarks: string
    UpBy: string
    UpDt: string
    ApproverName: string
  }

  type ApprovalRejectionHistory = {
    ID: string
    AprvType: string
    Remarks: string
    AprvStage: string
    AprvStageDesc: string
    LastApprvRejBy: string
    CreatedBy: string
    CreatedDate: string
    Status: string
  }

  const [auctionParticipant, setAuctionParticipant] = useState<AuctionParticipant>()
  const [auctionParticipantLine, setAuctionParticipantLine] = useState<AuctionParticipantLine[]>([])

  const [approvalRejectionHistory, setApprovalRejectionHistory] = useState<ApprovalRejectionHistory[]>([])


  async function fetchDetails() {

    const encoded = params.id;
    const id = await decrypt(encoded!)

    const res = await fetch("/api/GetData/GetAuctionParticipantDetails", {
      method: "POST",
      body: JSON.stringify({ "ID": id })
    })

    const rawData = await res.json()
    // console.log(rawData)
    const HeaderData = rawData.HeaderDetails.map(normalizeData)
    setAuctionParticipant(HeaderData[0])

    const LineData = rawData.LineDetails.map(normalizeData)
    setAuctionParticipantLine(LineData)

    // console.log(rawData)
    // console.log(data[0])

  }

  async function fetchHistory() {

    const encoded = params.id;
    const id = await decrypt(encoded!)

    const res = await fetch("/api/GetData/GetApprovalRejectionHistory", {
      method: "POST",
      body: JSON.stringify({ "ID": id })
    })

    const rawData = await res.json()
    const data = rawData.map(normalizeData)

    setApprovalRejectionHistory(data)

    // console.log(rawData)
    // console.log(data[0])

  }


  useEffect(() => {
    fetchDetails()
    fetchHistory()
  }, [])



  async function downloadAttachment(attachPath: any, attachName: any) {
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
      toast.error("File Not Found")
      return
    }

    const blob = await res.blob()

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")

    a.href = url
    a.download = `${auctionParticipant?.VendorCode}_${attachName}.${ext}`
    document.body.appendChild(a)
    a.click()

    a.remove()
    window.URL.revokeObjectURL(url)

    // setDownloading(false)
  }


  const router = useRouter();

  const [id, setId] = useState("");
  const [historyRows, setHistoryRows] = useState<any[]>([]);

  const [apid, setApid] = useState("");
  const [iddid, setIddid] = useState("");
  const [auction, setAuction] = useState<AuctionDetails | null>(null);

  const [ctoFile, setCtoFile] = useState<File | null>(null);
  const [hwAuthFile, setHwAuthFile] = useState<File | null>(null);
  const [hwAuthSpcbFile, setHwAuthSpcbFile] = useState<File | null>(null);
  const [blueBookFile, setBlueBookFile] = useState<File | null>(null);
  const [eprFile, setEprFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError("");

        const encId = params.id;
        // const encApid = params.get("apid") ?? "";
        const encIddid = params.iddid;

        const decId = encId ? await decrypt(encId) : "";
        // const decApid = encApid ? await decrypt(encApid) : "";
        const decIddid = encIddid ? await decrypt(encIddid) : "";

        setId(String(decId ?? ""));
        // setApid(String(decApid ?? ""));
        setIddid(String(decIddid ?? ""));

        if (encIddid) {
          const detailsRes = await fetch("/api/GetData/GetAuctionDetailsById", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: encIddid }),
          });

          const detailsPayload = await detailsRes.json();
          const detailsRow = detailsPayload?.data ?? null;
          // console.log(detailsRow)

          if (decId) {
            const historyRes = await fetch("/api/GetData/GetApprovalRejectionHistoryByVendorCode", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                APID: String(decId).trim(),
              }),
            });

            const historyData = await historyRes.json();
            // console.log("history response:", historyData);

            if (!historyRes.ok || !historyData?.success) {
              setHistoryRows([]);
            } else {
              const historyList = Array.isArray(historyData?.data) ? historyData.data : [];
              setHistoryRows(historyList);
            }
          } else {
            setHistoryRows([]);
          }

          setAuction(detailsRow ?? null);
        }
      } catch (err) {
        // console.error(err);
        setError("Failed to load reverted auction details.");
      } finally {
        setLoading(false);
      }
    };

    void loadPage();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const encId = params.id;
    const decId = encId ? await decrypt(encId) : "";
    if (!decId) {
      setError("APID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const docsForm = new FormData();
      docsForm.append("APID", id);
      docsForm.append("ID", id);
      docsForm.append("IDDID", iddid);
      docsForm.append("Reapply", "1");

      if (ctoFile) docsForm.append("CtoRespectiveFile", ctoFile);
      if (hwAuthFile) docsForm.append("HwAuthorizationOspcbFile", hwAuthFile);
      if (hwAuthSpcbFile) docsForm.append("HwAuthorizationSpcbFile", hwAuthSpcbFile);
      if (blueBookFile) docsForm.append("BlueBookFile", blueBookFile);
      if (eprFile) docsForm.append("RegistrationCertificateFile", eprFile);

      const res = await fetch("/api/SetData/InsertAuctionParticipantsLine", {
        method: "POST",
        body: docsForm,
      });

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        setError(payload.message || "Failed to save reapply documents.");
        return;
      }

      alert("Documents re-uploaded successfully.");
      router.push("/Auction/RevertedEntries");
    } catch (err) {
      // console.error(err);
      setError("Failed to save reapply documents.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading reverted form...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Reapply Auction Documents</h1>
        <p className="mt-1 text-sm text-slate-600">
          Re-upload the required documents for the same auction participant entry.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Auction Date</p>
          <p className="mt-1 text-sm text-slate-900">{auction?.AuctionDate ?? "N/A"}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Posted On</p>
          <p className="mt-1 text-sm text-slate-900">
            {auction?.CrDt ? String(auction.CrDt).split("T")[0] : "N/A"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Waste Category</p>
          <p className="mt-1 text-sm text-slate-900">{auction?.WasteCategory ?? "N/A"}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Remarks</p>
          <p className="mt-1 text-sm text-slate-900">{auction?.Remarks ?? "N/A"}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Waste</p>
          <p className="mt-1 text-sm text-slate-900">{auction?.Waste ?? "N/A"}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Waste Qty</p>
          <p className="mt-1 text-sm text-slate-900">
            {auction?.WasteQty ?? auction?.TotalQty ?? "N/A"}
          </p>
        </div>
      </div>

      <hr className="border border-gray-200 my-4" />

      <div className="block w-full">
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 w-full block">
          <div className="py-1 text-center text-sm">Documents Upload History</div>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr >
                {/* <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                                >ID</th> */}
                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                >ID</th>
                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                >CTO for respective SPCB</th>
                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                >HW authorization from OSPCB</th>
                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                >HW authorization from respective SPCB</th>
                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                >Copy of blue book</th>
                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                >EPR registration certificate for Plastic/oil/tyre</th>
                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                >Remarks</th>
                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                >Uploaded On</th>
                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                >Approver Remarks</th>
                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                >Rejected By</th>
                <th className=" px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700"
                >Rejected On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {auctionParticipantLine?.map((row, index) => (
                <tr key={index}>
                  <td
                    className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                  >{row.ID}
                  </td>
                  <td
                    className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                  >
                    <img src="/downloadicon.png" alt="" className="h-5"
                      onClick={() => downloadAttachment(row.CTO_AttachPath, "CTO Attachment")}
                    />
                  </td>

                  <td
                    className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                  >
                    <img src="/downloadicon.png" alt="" className="h-5"
                      onClick={() => downloadAttachment(row.OSPCB_HW_Auth_AttachPath, "OSPCB_HW_Auth_AttachPath")}
                    />
                  </td>
                  <td
                    className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                  >
                    <img src="/downloadicon.png" alt="" className="h-5"
                      onClick={() => downloadAttachment(row.SPCB_HW_Auth_AttachPath, "SPCB_HW_Auth_AttachPath")}
                    />
                  </td>
                  <td
                    className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                  >
                    <img src="/downloadicon.png" alt="" className="h-5"
                      onClick={() => downloadAttachment(row.BlueBook_AttachPath, "BlueBook_AttachPath")}
                    />
                  </td>
                  <td
                    className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                  >
                    <img src="/downloadicon.png" alt="" className="h-5"
                      onClick={() => downloadAttachment(row.EPR_Cert_AttachPath, "EPR_Cert_AttachPath")}
                    />
                  </td>
                  <td
                    className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                  >{row.Remarks}
                  </td>
                  {/* <td
                                        className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                                    >{row.IsActive}
                                    </td> */}
                  <td
                    className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                  >{row.CrDt?.split("T")[0]}
                  </td>
                  <td
                    className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                  >{row.ApproverRemarks}
                  </td>
                  <td
                    className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                  >{row.ApproverName}
                  </td>
                  <td
                    className="whitespace-nowrap px-2 py-1 text-xs text-slate-700"
                  >{row.UpDt?.split("T")[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            CTO Respective File
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setCtoFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            HW Authorization OSPCB File
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setHwAuthFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            HW Authorization SPCB File
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setHwAuthSpcbFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Blue Book File
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setBlueBookFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Registration Certificate File
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setEprFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>


        {/* 
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Action History</h2>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-slate-200 px-3 py-2 text-left">ID</th>
                  <th className="border border-slate-200 px-3 py-2 text-left">Rejected By</th>
                  <th className="border border-slate-200 px-3 py-2 text-left">Remarks</th>
                  <th className="border border-slate-200 px-3 py-2 text-left">Rejection Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {historyRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-slate-200 px-3 py-3 text-center text-slate-500">
                      No history found.
                    </td>
                  </tr>
                ) : (
                  historyRows.map((row, index) => (
                    <tr key={`${row.ID ?? "history"}-${index}`}>
                      <td className="border border-slate-200 px-3 py-2">{row.ID ?? "N/A"}</td>
                      <td className="border border-slate-200 px-3 py-2">{row.UpBy ?? "N/A"}</td>
                      <td className="border border-slate-200 px-3 py-2">{row.ApproverRemarks ?? "N/A"}</td>
                      <td className="border border-slate-200 px-3 py-2">
                        {row.UpDt ? String(row.UpDt).replace("T", " ").split(".")[0] : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div> */}


        <div className="md:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/Auction/RevertedEntries")}
            className="cursor-pointer rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer rounded-lg bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Reapply"}
          </button>
        </div>
      </form>
    </section>
  );
}