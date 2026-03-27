"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AuctionApply({ searchParams }: { searchParams: Promise<{ id?: string }> }) {

  const router = useRouter();
  const params = React.use(searchParams);
  const auctionId = params.id;

  const [recyclerName, setRecyclerName] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [recyclerEmail, setRecyclerEmail] = useState("");
  const [remarks, setRemarks] = useState("");
  const [hwAuthSpcbFile, setHwAuthSpcbFile] = useState<File | null>(null);

  const { data: session } = useSession();
  const empCode = session?.user?.id ?? "";

  const [ctoFile, setCtoFile] = useState<File | null>(null);
  const [hwAuthFile, setHwAuthFile] = useState<File | null>(null);
  const [blueBookFile, setBlueBookFile] = useState<File | null>(null);
  const [eprFile, setEprFile] = useState<File | null>(null);

  const [auctionDetails, setAuctionDetails] = useState<{
    AuctionDate: string;
    WasteCategory: string;
    Remarks: string;
    CrDt: string;
  } | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    const loadDetails = async () => {
      const res = await fetch("/api/GetData/GetAuctionDetailsById", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flag: "GetAuctionDetailsByID",
          id: auctionId,
        }),
      });

      const payload = await res.json();
      if (payload.success) {
        setAuctionDetails(payload.data);
      }
    };

    loadDetails();
  }, [auctionId]);

  const [wasteDetails, setWasteDetails] = useState<{ WasteType: string } | null>(
    null
  );

  useEffect(() => {
    if (!auctionId) return;

    const loadWaste = async () => {
      const res = await fetch("/api/GetData/GetWasteDetailsByAuctionId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: auctionId }),
      });

      const payload = await res.json();
      if (payload.success) {
        setWasteDetails(payload.data);
      }
    };

    loadWaste();
  }, [auctionId]);

  const allFilesReady = Boolean(
    ctoFile && hwAuthFile && hwAuthSpcbFile && blueBookFile && eprFile
  );

  const canSubmit =
    recyclerName.trim().length > 0 &&
    recyclerEmail.trim().length > 0 &&
    vendorId.trim().length > 0 &&
    allFilesReady;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit) {
      toast.error("Please fill Name, Email, Vendor ID and upload all required documents.");
      return;
    }

    // 1) Insert header (returns APID)
    const headerRes = await fetch("/api/SetData/InsertAuctionParticipantsHeader", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        IDDID: auctionId,
        Name: recyclerName,
        Email: recyclerEmail,
        EmpCode: empCode,
        VID: vendorId,
      }),
    });

    const headerPayload = await headerRes.json();
    console.log(headerPayload)
    if (!headerRes.ok || !headerPayload.success) {
      toast.error(headerPayload.message || "Failed to save header");
      return;
    }


    const apid = headerPayload.data.APID;
    console.log(apid)
    // 2) Insert documents (APID + files)
    const docsForm = new FormData();
    docsForm.append("APID", apid);
    docsForm.append("EmpCode", empCode);
    docsForm.append("Remarks", remarks);
    console.log("docsForm entries:", Array.from(docsForm.entries()));

    if (ctoFile) docsForm.append("CtoRespectiveFile", ctoFile);
    if (hwAuthFile) docsForm.append("HwAuthorizationOspcbFile", hwAuthFile);
    if (hwAuthSpcbFile) docsForm.append("HwAuthorizationSpcbFile", hwAuthSpcbFile);

    if (blueBookFile) docsForm.append("BlueBookFile", blueBookFile);
    if (eprFile) docsForm.append("RegistrationCertificateFile", eprFile);
    console.log("docsForm entries:", Array.from(docsForm.entries()));

    await fetch("/api/SetData/InsertAuctionParticipantsLine", {
      method: "POST",
      body: docsForm,
    });



    toast.success("Saved successfully!");
  }

  return (
    <div className="bg-white h-fit px-8 py-4 relative">
      <Toaster />

      <div>
        <div className="text-center text-orange-600 mb-5 text-2xl font-bold">
          Apply for Auction
        </div>
        <Link href="./">
          <img src="/goback.png" alt="" className="h-6 absolute top-4 right-10" />
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">
          Auction Details
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500">Auction Date</p>
            <p className="font-medium text-slate-800">
              {auctionDetails?.AuctionDate ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Posted On</p>
            <p className="font-medium text-slate-800">
              {auctionDetails?.CrDt?.split("T")[0] ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Waste Category</p>
            <p className="font-medium text-slate-800">
              {auctionDetails?.WasteCategory ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Remarks</p>
            <p className="font-medium text-slate-800">
              {auctionDetails?.Remarks ?? "N/A"}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-slate-500">Waste Type</p>
          <p className="font-medium text-slate-800">
            {wasteDetails?.WasteType ?? "N/A"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-semibold">Recycler Name</label>
            <input
              type="text"
              value={recyclerName}
              onChange={(e) => setRecyclerName(e.target.value)}
              placeholder="Enter Recycler Name"
              className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="font-semibold">Vendor ID</label>
            <input
              type="text"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              placeholder="Enter Vendor ID"
              className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="font-semibold">Recycler Email</label>
            <input
              type="email"
              value={recyclerEmail}
              onChange={(e) => setRecyclerEmail(e.target.value)}
              placeholder="Enter Recycler Email"
              className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="font-semibold">CTO for respective SPCB</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setCtoFile(e.target.files?.[0] ?? null)}
              className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <p className="text-xs text-slate-500">PDF/JPEG/PNG only</p>
          </div>

          <div>
            <label className="font-semibold">HW authorization from OSPCB</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setHwAuthFile(e.target.files?.[0] ?? null)}
              className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <p className="text-xs text-slate-500">PDF/JPEG/PNG only</p>
          </div>



          <div>
            <label className="font-semibold">HW authorization from SPCB</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setHwAuthSpcbFile(e.target.files?.[0] ?? null)}
              className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <p className="text-xs text-slate-500">PDF/JPEG/PNG only</p>
          </div>

          <div>
            <label className="font-semibold">
              Copy of blue book (quantity bought till date to be shown)
            </label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setBlueBookFile(e.target.files?.[0] ?? null)}
              className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <p className="text-xs text-slate-500">PDF/JPEG/PNG only</p>
          </div>

          <div>
            <label className="font-semibold">
              EPR registration certificate for Plastic/oil/tyre
            </label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setEprFile(e.target.files?.[0] ?? null)}
              className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <p className="text-xs text-slate-500">PDF/JPEG/PNG only</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="font-semibold">Remarks</label>
          <textarea
            rows={1}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter Remarks"
            className="mt-2 border border-gray-200 p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`mt-6 text-sm px-4 py-1.5 rounded-md text-white ${canSubmit
            ? "bg-green-700 hover:bg-green-800 cursor-pointer"
            : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
