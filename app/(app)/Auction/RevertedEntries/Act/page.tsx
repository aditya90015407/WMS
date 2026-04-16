"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import decrypt from "@/components/Decrypt";

type AuctionDetails = {
  AuctionDate?: string | null;
  CrDt?: string | null;
  WasteCategory?: string | null;
  Remarks?: string | null;
  Waste?: string | null;
  WasteQty?: string | number | null;
  TotalQty?: string | number | null;
};

export default function AuctionRevertedActPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [id, setId] = useState("");
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

        const encId = params.get("id") ?? "";
        // const encApid = params.get("apid") ?? "";
        const encIddid = params.get("iddid") ?? "";

        const decId = encId ? await decrypt(encId) : "";
        // const decApid = encApid ? await decrypt(encApid) : "";
        const decIddid = encIddid ? await decrypt(encIddid) : "";

        setId(String(decId ?? ""));
        // setApid(String(decApid ?? ""));
        setIddid(String(decIddid ?? ""));

        if (decIddid) {
          const detailsRes = await fetch("/api/GetData/GetSelectedVendorDetails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ID: String(decIddid) }),
          });

          const detailsPayload = await detailsRes.json();
          const detailsRow = Array.isArray(detailsPayload?.data)
            ? detailsPayload.data[0]
            : detailsPayload?.data;

          setAuction(detailsRow ?? null);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load reverted auction details.");
      } finally {
        setLoading(false);
      }
    };

    void loadPage();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const encId = params.get("id") ?? "";
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
      console.error(err);
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

        <div className="md:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/Auction/RevertedEntries")}
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Reapply"}
          </button>
        </div>
      </form>
    </section>
  );
}
