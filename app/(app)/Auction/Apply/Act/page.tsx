"use client";
 
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
 
export default function AuctionApply() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auctionId = searchParams.get("id");
 
  const [recyclerName, setRecyclerName] = useState("");
  const [recyclerEmail, setRecyclerEmail] = useState("");
  const [remarks, setRemarks] = useState("");
 
 
 
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
         console.log(payload);
        setAuctionDetails(payload.data);
      }
    };
   
    loadDetails();
  }, [auctionId]);
 
 
const [wasteDetails, setWasteDetails] = useState<{ WasteType: string } | null>(null);
 
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
 
  const allFilesReady = Boolean(ctoFile && hwAuthFile && blueBookFile && eprFile);
  const canSubmit =
    recyclerName.trim().length > 0 &&
    recyclerEmail.trim().length > 0 &&
    allFilesReady;
 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
 
    if (!canSubmit) {
      toast.error("Please fill Name, Email, and upload all required documents.");
      return;
    }
 
    const formData = new FormData();
    formData.append("Name", recyclerName.trim());
    formData.append("Email", recyclerEmail.trim());
    formData.append("Remarks", remarks.trim());
 
    if (ctoFile) formData.append("CTO", ctoFile);
    if (hwAuthFile) formData.append("HWAuth", hwAuthFile);
    if (blueBookFile) formData.append("BlueBook", blueBookFile);
    if (eprFile) formData.append("EPR", eprFile);
 
    const res = await fetch("/api/SetData/SetAuctionApply", {
      method: "POST",
      body: formData,
    });
 
    const data = await res.json();
 
    if (!res.ok || !data.success) {
      toast.error(data.message || "Some error occurred!");
      return;
    }
 
    toast.success(data.message || "Saved successfully!");
    router.push("./");
  }
 
  return (
    <div className="bg-white h-fit px-8 py-4 relative">
      <Toaster />
 
      <div>
        <div className="text-center text-orange-600 mb-5 text-2xl font-bold">Apply for Auction</div>
        <Link href="./">
          <img src="/goback.png" alt="" className="h-6 absolute top-4 right-10" />
        </Link>
      </div>
 
      {/* Auction Details */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Auction Details</h2>
 
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500">Auction Date</p>
            <p className="font-medium text-slate-800">{auctionDetails?.AuctionDate ?? "N/A"}</p>
          </div>
 
 
           <div>
            <p className="text-xs text-slate-500">Posted On</p>
            <p className="font-medium text-slate-800">{auctionDetails?.CrDt?.split("T")[0] ?? "N/A"}</p>
          </div>
 
          <div>
            <p className="text-xs text-slate-500">Waste Category</p>
            <p className="font-medium text-slate-800">{auctionDetails?.WasteCategory ?? "N/A"}</p>
          </div>
 
 
          <div>
            <p className="text-xs text-slate-500">Remarks</p>
            <p className="font-medium text-slate-800">{auctionDetails?.Remarks ?? "N/A"}</p>
          </div>
        </div>
        <div>
          <div>
            <p className="text-xs text-slate-500">Waste Type</p>
            <p className="font-medium text-slate-800">{wasteDetails?.WasteType ?? "N/A"}</p>
 
          </div>
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
          className={`mt-6 text-sm px-4 py-1.5 rounded-md text-white ${
            canSubmit ? "bg-green-700 hover:bg-green-800 cursor-pointer" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Submit
        </button>
      </form>
    </div>
  );
}