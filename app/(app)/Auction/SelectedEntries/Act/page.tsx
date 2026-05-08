"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import decrypt from "@/components/Decrypt";
import { useRouter } from "next/navigation";

type AuctionDetails = {
  AuctionDate?: string;
  WasteCategory?: string;
  Waste?: string;
  TotalQty?: string | number;
  Remarks?: string;
  CrDt?: string;
  MUnit: string
};

type WasteDetail = {
  ID?: string | number;
  WRID?: string | number;
  Waste?: string;
  WasteType?: string;
  WasteQty?: string | number;
  GenerationDate?: string;
  TargetDate?: string;
  Unit?: string;
  Dept?: string;
};

type VehicleType = {
  id: string;
  name: string;
};

export default function SelectedEntriesActPage({ searchParams }: { searchParams: Promise<{ id?: string, apid: string, iddid?: string }> }) {
  // const params = useSearchParams();

  const router = useRouter()

  const params = React.use(searchParams)

  const [decodedId, setDecodedId] = useState("");
  const [decodedApid, setDecodedApid] = useState("");
  const [decodedIddid, setDecodedIddid] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [auctionDetails, setAuctionDetails] = useState<AuctionDetails | null>(null);
  const [wasteDetails, setWasteDetails] = useState<WasteDetail[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);

  const [transportFacilities, setTransportFacilities] = useState(false)

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
    MUnit: ""
  });

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    return String(value).split("T")[0];
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);

        // const encId = params.get("id") ?? "";
        // const encApid = params.get("apid") ?? "";
        // const encIddid = params.get("iddid") ?? "";
        const encId = params.id
        const encApid = params?.apid
        const encIddid = params.iddid


        const id = encId ? String(await decrypt(encId)) : "";
        const apid = encApid ? String(await decrypt(encApid)) : "";
        const iddid = encIddid ? String(await decrypt(encIddid)) : "";

        setDecodedId(id);
        setDecodedApid(apid);
        setDecodedIddid(iddid);

        setTransportForm((prev) => ({
          ...prev,
          APID: apid,
        }));


        if (iddid) {
          const detailsRes = await fetch("/api/GetData/GetAuctionDetailsById", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: encIddid }),
          });

          const detailsPayload = await detailsRes.json();
          console.log(detailsPayload)
          if (detailsPayload?.success) {
            setAuctionDetails(detailsPayload.data ?? null);
          }

          const wasteRes = await fetch("/api/GetData/GetWasteDetailsByAuctionId", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: iddid }),
          });

          const wastePayload = await wasteRes.json();
          const wasteList = Array.isArray(wastePayload?.data)
            ? wastePayload.data
            : Array.isArray(wastePayload)
              ? wastePayload
              : [];
          setWasteDetails(wasteList);
        }

        const vtRes = await fetch("/api/GetData/GetVehicleType", {
          method: "POST",
        });
        const vtPayload = await vtRes.json();
        // console.log(vtPayload)
        if (vtPayload?.success) {
          const list = (Array.isArray(vtPayload.data) ? vtPayload.data : []).map((v: any) => ({
            id: String(v.VTID ?? v.ID ?? ""),
            name: String(v.VehicleType ?? v.name ?? ""),
          }));
          // console.log(list)
          setVehicleTypes(list);
        }
      } catch (err) {
        console.error("Failed to load selected entry act page:", err);
        toast.error("Failed to load transporter form");
      } finally {
        setLoading(false);
      }
    };

    void loadPage();
  }, [params]);

  async function handleTransportSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!transportForm.APID) {
      toast.error("APID is missing");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/SetData/SetTransportationDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          APID: transportForm.APID,
          VendorSelfTransport: transportFacilities,
          TransporterName: transportForm.TransporterName,
          TransporterAddress: transportForm.TransporterAddress,
          TransporterPhone: transportForm.TransporterPhone,
          TransporterEmail: transportForm.TransporterEmail,
          VTID: transportForm.VTID,
          TransporterRegNo: transportForm.TransporterRegNo,
          VehicleRegNo: transportForm.VehicleRegNo,
          ReceiverName: transportForm.ReceiverName,
          ReceiverAddress: transportForm.ReceiverAddress,
          ReceiverAuthNo: transportForm.ReceiverAuthNo,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to save transporter details");
        return;
      }

      toast.success("Transporter details saved successfully");
      router.back()
    } catch (err) {
      console.error("Transport submit failed:", err);
      toast.error("Something went wrong while saving transporter details");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="bg-white h-fit px-8 py-4 relative">
        <p className="text-sm text-slate-600">Loading transporter form...</p>
      </section>
    );
  }

  return (
    <div className="bg-white h-fit px-8 py-0.5 relative">
      <Toaster />
      <div className="overflow-hidden w-fit flex place-self-center py-1 bg-emerald-700 rounded-lg ">
        <p
          className="whitespace-nowrap text-white animate-slide text-sm"
          style={{
            animation: "slide 4s linear infinite",
          }}
        >
          Congratulations!! You have been Selected for this Auction.
        </p>

        <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(50%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
      </div>
      <div>

        <div className="text-center text-teal-600 mt-2 mb-5 text-xl font-bold">
          Selected Auction - Transporter Form
        </div>
        <Link href="/Auction/SelectedEntries">
          <img src="/goback.png" alt="" className="h-6 absolute top-4 right-10" />
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-sm font-semibold text-cyan-600 mb-3">Auction Details</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500">Auction Date</p>
            <p className="font-medium text-slate-800">{auctionDetails?.AuctionDate ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Posted On</p>
            <p className="font-medium text-slate-800">
              {auctionDetails?.CrDt ? String(auctionDetails.CrDt).split("T")[0] : "N/A"}
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
            <p className="font-medium text-slate-800">{auctionDetails?.Remarks ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Waste</p>
            <p className="font-medium text-slate-800">{auctionDetails?.Waste ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Waste Qty</p>
            <p className="font-medium text-slate-800">
              {auctionDetails?.TotalQty ?? "N/A"}{" "}{auctionDetails?.MUnit}
            </p>
          </div>
        </div>

        {/* <div className="mt-4">
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
        </div> */}
      </div>

      {

        <form onSubmit={handleTransportSubmit} className="mt-6 rounded-xl border border-slate-200 bg-white p-4">

          <div>

            <label className="inline-flex items-center cursor-pointer font-semibold text-sm">
              Do you have Transport Facilities ?
              <div className="relative mx-4">
                <input
                  type="checkbox"
                  onChange={() => setTransportFacilities(!transportFacilities)}
                  className="sr-only peer"
                />

                <div className="w-20 h-8 bg-gray-500 rounded-full peer-checked:bg-emerald-600 transition-colors"></div>

                <div className="absolute left-1 top-1 w-8 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-10"></div>

                <span className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium text-white pointer-events-none">
                  <span>Yes</span>
                  <span>No</span>
                </span>
              </div>
            </label>

            {/* <label className="text-sm font-semibold">
              Do you have Transport Facilities ?
            </label>
            <span className="ms-5 mr-2">Yes</span>
            <input type="checkbox" onChange={() => setTransportFacilities(!transportFacilities)} />
            {/* <span className="relative w-20 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-[55px] rtl:peer-checked:after:-translate-x-[55px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-gray-600 dark:peer-checked:bg-blue-600"></span> 

            <span className="ms-5 ml-2">No</span> */}
          </div>

          {transportFacilities &&
            <>
              <h3 className="mt-4 mb-2 text-center text-sm font-semibold text-cyan-600 mb-3"></h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* <div>
            <label className="font-semibold">APID</label>
            <input
              type="text"
              value={transportForm.APID}
              readOnly
              className="border border-gray-200 p-2 mt-1 rounded-lg w-full text-sm bg-slate-100"
            />
          </div> */}

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
                    {vehicleTypes.map((vt, i) => (
                      <option key={i} value={vt.id}>
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
            </>
          }

          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer justify-center w-full mt-4 text-white "
          >
            <span className="bg-blue-500 w-fit px-4 py-2 rounded-md text-sm disabled:opacity-60">{saving ? "Submitting..." : "Submit"}</span>
          </button>
        </form>
      }
    </div>
  );
}
