"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import decrypt from "@/components/Decrypt";


export default function AuctionApply({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  // const searchParams = useSearchParams();

  const params = React.use(searchParams);
  const auctionId = params.id;
  // const wasteParam = params.waste;
  // const wasteQtyParam = params.wasteQty;

  // const encIddid = searchParams.get("id");


  // console.log(params)
  // console.log(auctionId,wasteParam,wasteQtyParam)
  // const dec=decrypt(auctionId)

  const [showTransportForm, setShowTransportForm] = useState(false);

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

  const employeeCode = String(session?.user?.id ?? "").trim();
  const employeeName = String(session?.user?.username ?? session?.user?.name ?? "").trim();
  const employeeEmail = String(session?.user?.email ?? "").trim();

  const [auctionWaste, setAuctionWaste] = useState("");
  const [auctionWasteQty, setAuctionWasteQty] = useState("");


  useEffect(() => {
    const loadAuctionDetails = async () => {
      const encIddid = params.id;
      const decIddid = encIddid ? await decrypt(encIddid) : "";

      if (!decIddid) return;

      const res = await fetch("/api/GetData/GetSelectedVendorDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID: String(decIddid) }),
      });

      const data = await res.json();
      console.log("Auction details response:", data);
    };

    void loadAuctionDetails();
  }, [params]);


  //  useEffect(()=>{
  //   const loadWasteParams=async()=>{
  //     if(wasteParam){
  //       const decodedWaste=await decrypt(wasteParam);
  //       // console.log(decodedWaste)
  //       setAuctionWaste(decodedWaste ?? "")
  //     }
  //     if(wasteQtyParam){
  //       const decodedWasteQty=await decrypt(wasteQtyParam)
  //       //  console.log(decodedWasteQty)
  //       setAuctionWasteQty(decodedWasteQty ?? "")
  //     }
  //   };
  //   void loadWasteParams();
  //  },[wasteParam,wasteQtyParam]);


  useEffect(() => {
    if (!employeeCode && !employeeName && !employeeEmail) return;
    setRecyclerName(employeeName);
    setRecyclerEmail(employeeEmail);
    setVendorId(employeeCode);
  }, [employeeCode, employeeName, employeeEmail]);

  const [transportForm, setTransportForm] = useState({
    APID: "",
    TransporterName: "",
    TransporterAddress: "",
    TransporterPhone: "",
    TransporterEmail: "",
    VTID: "",
    TransporterRegNo: "",
    VehicleRegNo: "",
    ReceiverName: "",
    ReceiverAddress: "",
    ReceiverAuthNo: "",
  });

  const [vehicleTypes, setVehicleTypes] = useState<Array<{ id: string; name: string }>>([]);

  const [auctionDetails, setAuctionDetails] = useState<{
    AuctionDate: string;
    WasteCategory: string;
    Waste: string;
    TotalQty: string;
    Remarks: string;
    CrDt: string;
  } | null>(null);

  const [wasteDetails, setWasteDetails] = useState<
    Array<{
      ID?: string | number;
      WRID?: string | number;
      Waste?: string;
      WasteType?: string;
      WasteQty?: string | number;
      GenerationDate?: string;
      TargetDate?: string;
      Unit?: string;
      Dept?: string;
    }>
  >([]);

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    const datePart = String(value).split("T")[0];
    return datePart === "1900-01-01" ? "N/A" : datePart;
  };

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
        console.log(auctionDetails)
      }
    };

    void loadDetails();
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId) return;

    const loadWaste = async () => {
      try {
        const res = await fetch("/api/GetData/GetWasteDetailsByAuctionId", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: auctionId }),
        });

        const payload = await res.json();

        const data = Array.isArray(payload?.data)

          ? payload.data
          : Array.isArray(payload)
            ? payload
            : payload?.data
              ? [payload.data]
              : [];

        setWasteDetails(data);
      } catch (error) {
        console.error("Failed to load waste details", error);
        setWasteDetails([]);
      }
    };

    void loadWaste();
  }, [auctionId]);

  useEffect(() => {
    const loadVT = async () => {
      const res = await fetch("/api/GetData/GetVehicleType", { method: "POST" });
      const payload = await res.json();

      if (payload.success) {
        const data = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];
        const list = data.map((v: any) => ({
          id: String(v.VTID ?? v.id),
          name: String(v.VehicleType ?? v.name),
        }));
        setVehicleTypes(list);
      }
    };
    void loadVT();
  }, []);

  const allFilesReady = Boolean(
    ctoFile && hwAuthFile && hwAuthSpcbFile && blueBookFile && eprFile,
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

    if (!headerRes.ok || !headerPayload.success) {
      toast.error(headerPayload.message || "Failed to save header");
      return;
    }
    console.log(headerPayload)

    const apid = headerPayload.data?.APID;
    const stsCode = headerPayload.data?.StsCode;
    console.log(stsCode)

    const docsForm = new FormData();
    docsForm.append("APID", apid);
    docsForm.append("EmpCode", empCode);
    docsForm.append("Remarks", remarks);

    if (ctoFile) docsForm.append("CtoRespectiveFile", ctoFile);
    if (hwAuthFile) docsForm.append("HwAuthorizationOspcbFile", hwAuthFile);
    if (hwAuthSpcbFile) docsForm.append("HwAuthorizationSpcbFile", hwAuthSpcbFile);
    if (blueBookFile) docsForm.append("BlueBookFile", blueBookFile);
    if (eprFile) docsForm.append("RegistrationCertificateFile", eprFile);

    await fetch("/api/SetData/InsertAuctionParticipantsLine", {
      method: "POST",
      body: docsForm,
    });

    if (stsCode === 7) {
      setShowTransportForm(true);
      setTransportForm((prev) => ({ ...prev, APID: apid }));
    }

    toast.success("Saved successfully!");
  }

  async function handleTransportSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/SetData/SetTransportationDetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transportForm),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error(data.message || "Failed to save transporter details");
      return;
    }

    toast.success("Transporter details saved!");
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
          <div>
            <p className="text-xs text-slate-500">Waste</p>
            <p className="font-medium text-slate-800">{auctionDetails?.Waste}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Waste Qty</p>
            <p className="font-medium text-slate-800">{auctionDetails?.TotalQty ?? "N/A"}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2">Waste Details</p>
          {wasteDetails.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                      Waste
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                      Waste Qty
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                      Generation Date
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                      Target Date
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                      Unit
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-700">
                      Dept
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {wasteDetails.map((w, i) => (
                    <tr key={String(w.ID ?? w.WRID ?? i)}>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                        {w.Waste ?? w.WasteType ?? "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                        {w.WasteQty ?? "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                        {formatDate(w.GenerationDate)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                        {formatDate(w.TargetDate)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                        {w.Unit ?? "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                        {w.Dept ?? "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <span className="text-slate-500">N/A</span>
          )}
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
            <label className="font-semibold">Vendor Code</label>
            <input
              type="text"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              placeholder="Enter Vendor Code"
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

      {showTransportForm && (
        <form onSubmit={handleTransportSubmit} className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Transporter Details
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-semibold">APID</label>
              <input
                type="text"
                value={transportForm.APID}
                readOnly
                className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm bg-slate-100"
              />
            </div>

            <div>
              <label className="font-semibold">Transporter Name</label>
              <input
                type="text"
                value={transportForm.TransporterName}
                onChange={(e) =>
                  setTransportForm((p) => ({ ...p, TransporterName: e.target.value }))
                }
                className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Transporter Address</label>
              <input
                type="text"
                value={transportForm.TransporterAddress}
                onChange={(e) =>
                  setTransportForm((p) => ({ ...p, TransporterAddress: e.target.value }))
                }
                className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Transporter Phone</label>
              <input
                type="text"
                value={transportForm.TransporterPhone}
                onChange={(e) =>
                  setTransportForm((p) => ({ ...p, TransporterPhone: e.target.value }))
                }
                className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Transporter Email</label>
              <input
                type="email"
                value={transportForm.TransporterEmail}
                onChange={(e) =>
                  setTransportForm((p) => ({ ...p, TransporterEmail: e.target.value }))
                }
                className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Vehicle Type</label>
              <select
                value={transportForm.VTID}
                onChange={(e) =>
                  setTransportForm((p) => ({ ...p, VTID: e.target.value }))
                }
                className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm"
              >
                <option value="">Select Vehicle Type</option>
                {vehicleTypes.map((vt) => (
                  <option key={vt.id} value={vt.id}>
                    {vt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold">Transporter Reg No</label>
              <input
                type="text"
                value={transportForm.TransporterRegNo}
                onChange={(e) =>
                  setTransportForm((p) => ({ ...p, TransporterRegNo: e.target.value }))
                }
                className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Vehicle Reg No</label>
              <input
                type="text"
                value={transportForm.VehicleRegNo}
                onChange={(e) =>
                  setTransportForm((p) => ({ ...p, VehicleRegNo: e.target.value }))
                }
                className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Receiver Name</label>
              <input
                type="text"
                value={transportForm.ReceiverName}
                onChange={(e) =>
                  setTransportForm((p) => ({ ...p, ReceiverName: e.target.value }))
                }
                className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Receiver Address</label>
              <input
                type="text"
                value={transportForm.ReceiverAddress}
                onChange={(e) =>
                  setTransportForm((p) => ({ ...p, ReceiverAddress: e.target.value }))
                }
                className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Receiver Auth No</label>
              <input
                type="text"
                value={transportForm.ReceiverAuthNo}
                onChange={(e) =>
                  setTransportForm((p) => ({ ...p, ReceiverAuthNo: e.target.value }))
                }
                className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Save Transporter Details
          </button>
        </form>
      )}
    </div>
  );
}