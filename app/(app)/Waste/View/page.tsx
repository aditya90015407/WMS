"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toForm3Entry } from "@/lib/form3-columns";
import { type Form10Data } from "@/components/Form10Table";

type ViewRow = Record<string, string | number | null>;

type ApiResponse = {
  success?: boolean;
  data?: ViewRow[];
  message?: string;
  error?: string;
};

type FormEntry = {
  code: string;
  iddid: string;
  date: string;
  targetDate: string;
  sapWasteCode: string;
  wasteCategory: string;
  disposalType: string;
  wasteType: string;
  waste: string;
  quantity: string;
  manifestDocumentNo: string;
  storageMethod: string;
  physicalState: string;
  disposer: string;
  receiver: string;
  approvalStatus: string;
  unitDesc: string;
  dateOfIssuance: string;
  referenceNo: string;
  dispId: string;
  deptId: string;
  dept: string;
  receiverId: string;
  wcid: string;
  stsCode: string;
};

const PAGE_SIZE = 10;

const toText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const esc = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getDestinedDisplay = (entry: FormEntry): string => {
  const disposerLabel = entry.disposer?.trim() || "";
  const receiverLabel = entry.receiver?.trim() || "";

  if (disposerLabel && receiverLabel) {
    return `${disposerLabel} / Received From: ${receiverLabel}`;
  }
  if (receiverLabel) return `Received From: ${receiverLabel}`;
  return disposerLabel;
};

const getApprovalRowClass = (status: string): string => {
  const normalized = status.trim().toLowerCase();
  if (normalized === "approval completed") return "bg-green-100";
  if (normalized === "approval inprogress") return "bg-yellow-100";
  if (normalized === "rejected") return "bg-red-100";
  return "";
};

const buildDetailRows = (entry: FormEntry) => [
  ["ID", entry.code],
  ["Date", entry.date],
  ["Target Date", entry.targetDate],
  ["Waste Category", entry.wasteCategory],
  ["Waste Approval Status", entry.approvalStatus],
  ["SAP Waste Code", entry.sapWasteCode],
  ["Disposal Type", entry.disposalType],
  ["Waste Type", entry.wasteType],
  ["Waste", entry.waste],
  ["Quantity", entry.quantity],
  ["Storage Method", entry.storageMethod],
  ["Physical State", entry.physicalState],
  ["Disposer", entry.disposer],
  ["Receiver", entry.receiver],
  ["Unit Description", entry.unitDesc],
  ["Manifest Document No.", entry.manifestDocumentNo],
  ["Date Of Issuance", entry.dateOfIssuance],
  ["Reference No.", entry.referenceNo],
  ["Disposer ID", entry.dispId],
  ["Department ID", entry.deptId],
  ["Department", entry.dept],
  ["Receiver ID", entry.receiverId],
  ["Waste Category ID", entry.wcid],
  ["Status Code", entry.stsCode],
].filter(([, value]) => String(value ?? "").trim() !== "");

const getFirstValue = (row: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return "";
};

const mapVehicleType = (value: string) => {
  if (value === "1" || value.toLowerCase() === "truck") return "Truck";
  if (value === "2" || value.toLowerCase() === "tanker") return "Tanker";
  if (value === "3" || value.toLowerCase() === "special vehicle") return "Special Vehicle";
  return value;
};

const mapPhysicalForm = (value: string) => {
  if (value === "1" || value.toLowerCase() === "solid") return "Solid";
  if (value === "2" || value.toLowerCase() === "semi-solid" || value.toLowerCase() === "semisolid") return "Semi-solid";
  if (value === "3" || value.toLowerCase() === "sludge") return "Sludge";
  if (value === "4" || value.toLowerCase() === "oily") return "Oily";
  if (value === "5" || value.toLowerCase() === "tarry") return "Tarry";
  if (value === "6" || value.toLowerCase() === "slurry") return "Slurry";
  if (value === "7" || value.toLowerCase() === "liquid") return "Liquid";
  return value;
};

const toForm10Data = (entry: FormEntry): Form10Data => ({
  senderNameAddress: entry.unitDesc || "",
  senderPhone: "",
  senderEmail: "",
  senderAuthorizationNo: "",
  manifestDocumentNo: entry.manifestDocumentNo || entry.code || "",

  transporterNameAddress: entry.disposer || "",
  transporterPhone: "",
  transporterEmail: "",
  vehicleType: "Truck",
  transporterRegistrationNo: entry.dispId || "",
  vehicleRegistrationNo: "",
  receiverNameAddress: entry.receiver || "",
  receiverPhone: "",
  receiverEmail: "",
  receiverAuthorizationNo: entry.receiverId || "",
  wasteDescription: entry.waste || "",
  totalQuantity: entry.quantity || "",
  quantityUnit: "m3",
  noOfContainers: "",
  physicalForm: entry.physicalState || "",
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
});

const toForm10DataFromApiRow = (row: Record<string, unknown>): Form10Data => {
  const transporterName = getFirstValue(row, ["TransporterName"]);
  const transporterAddress = getFirstValue(row, ["TransporterAddress"]);
  const receiverName = getFirstValue(row, ["ReceiverName"]);
  const receiverAddress = getFirstValue(row, ["ReceiverAddress"]);

  return {
    senderNameAddress: getFirstValue(row, ["SenderNameAddress", "UnitDesc", "NAME", "SenderName"]),
    senderPhone: getFirstValue(row, ["SenderPhone", "Phone", "PHONE"]),
    senderEmail: getFirstValue(row, ["SenderEmail", "EMAIL", "Email"]),
    senderAuthorizationNo: getFirstValue(row, ["SenderAuthorizationNo", "SenderAuthNo"]),
    manifestDocumentNo: getFirstValue(row, ["ManifestDocumentNo", "IDDID", "ID"]),
    transporterNameAddress: [transporterName, transporterAddress].filter(Boolean).join(" "),
    transporterPhone: getFirstValue(row, ["TransporterPhone"]),
    transporterEmail: getFirstValue(row, ["TransporterEmail"]),
    vehicleType: mapVehicleType(getFirstValue(row, ["VehicleType", "VTID"])),
    transporterRegistrationNo: getFirstValue(row, ["TransporterRegNo", "TransporterRegistrationNo"]),
    vehicleRegistrationNo: getFirstValue(row, ["VehicleRegNo", "VehicleRegistrationNo"]),
    receiverNameAddress: [receiverName, receiverAddress].filter(Boolean).join(" "),
    receiverPhone: getFirstValue(row, ["ReceiverPhone"]),
    receiverEmail: getFirstValue(row, ["ReceiverEmail"]),
    receiverAuthorizationNo: getFirstValue(row, ["ReceiverAuthorizationNo", "ReceiverAuthNo"]),
    wasteDescription: getFirstValue(row, ["WasteDescription", "Waste"]),
    totalQuantity: getFirstValue(row, ["TotalQuantity", "TotalQty"]),
    quantityUnit: getFirstValue(row, ["QuantityUnit"]) || "m3",
    noOfContainers: getFirstValue(row, ["NoOfContainers"]),
    physicalForm: mapPhysicalForm(getFirstValue(row, ["PhysicalForm", "PSID"])),
    specialHandlingInfo: getFirstValue(row, ["SpecialHandlingInfo", "SpecialHandlingInstructions"]),
    senderNameStamp: getFirstValue(row, ["SenderNameStamp"]),
    senderSignature: getFirstValue(row, ["SenderSignature"]),
    senderMonth: getFirstValue(row, ["SenderMonth"]),
    senderDay: getFirstValue(row, ["SenderDay"]),
    senderYear: getFirstValue(row, ["SenderYear"]),
    transporterNameStamp: getFirstValue(row, ["TransporterNameStamp"]),
    transporterSignature: getFirstValue(row, ["TransporterSignature"]),
    transporterMonth: getFirstValue(row, ["TransporterMonth"]),
    transporterDay: getFirstValue(row, ["TransporterDay"]),
    transporterYear: getFirstValue(row, ["TransporterYear"]),
    receiverNameStamp: getFirstValue(row, ["ReceiverNameStamp"]),
    receiverSignature: getFirstValue(row, ["ReceiverSignature"]),
    receiverMonth: getFirstValue(row, ["ReceiverMonth"]),
    receiverDay: getFirstValue(row, ["ReceiverDay"]),
    receiverYear: getFirstValue(row, ["ReceiverYear"]),
  };
};

const createForm3Html = (entry: FormEntry): string => {
  const typeWithCategory = [entry.waste || entry.wasteType, entry.sapWasteCode]
    .filter(Boolean)
    .join(" / ");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Form3_${esc(entry.code)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color: #111827; }
    h1, h2, p { margin: 0; }
    .center { text-align: center; }
    .mt2 { margin-top: 8px; } .mt4 { margin-top: 16px; } .mt10 { margin-top: 40px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 13px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; }
    .small { font-size: 13px; }
  </style>
</head>
<body>
  <div class="center">
    <h1>FORM 3</h1>
    <p class="small"><i>[See rules 6(5), 13(7), 14(6), 16(5) and 20(1)]</i></p>
    <h2 class="mt2">FORMAT FOR MAINTAINING RECORDS OF HAZARDOUS AND OTHER WASTES</h2>
  </div>
 
  <div class="mt4 small">
    <p>1. Name and address of the facility : ${esc(entry.unitDesc)}</p>
    <p class="mt2">2. Date of issuance of authorisation and its reference number : ${esc(
    [entry.dateOfIssuance, entry.referenceNo].filter(Boolean).join(" ")
  )}</p>
    <p class="mt2">3. Description of hazardous and other wastes handled (Generated or Received)</p>
  </div>
 
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type of waste with category</th>
        <th>Total quantity(MT)</th>
        <th>Method of Storage</th>
        <th>Destined to or received from</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${esc(entry.date)}</td>
        <td>${esc(typeWithCategory)}</td>
        <td>${esc(entry.quantity)}</td>
        <td>${esc(entry.storageMethod)}</td>
        <td>${esc(getDestinedDisplay(entry))}</td>
      </tr>
    </tbody>
  </table>
 
  <p class="mt4 small"><i>* Fill up above table separately for indigenous and imported waste.</i></p>
 
  <div class="mt4 small">
    <p>4. Date wise description of management of hazardous and other wastes including products sent and to whom in case of recyclers or pre-processor or utiliser:</p>
    <p class="mt2">5. Date of environmental monitoring (as per authorisation or guidelines of Central Pollution Control Board):</p>
  </div>
 
  <div class="mt10 small" style="display:flex;justify-content:space-between;align-items:flex-end;">
    <div>
      <p>Date: ${esc(entry.date)}</p>
      <p class="mt2">Place: </p>
    </div>
    <p><b>Signature of occupier</b></p>
  </div>
</body>
</html>`;

};

const createForm10Html = (form: Form10Data, code: string): string => {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Form10_${esc(code)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 0; color: #111827; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #334155; padding: 8px; font-size: 13px; vertical-align: top; }
    .center { text-align: center; padding: 16px; }
    .small { font-size: 12px; }
  </style>
</head>
<body>
  <div class="center">
    <h1>FORM 10</h1>
    <p class="small"><i>[See rule 19 (1)]</i></p>
    <h2>MANIFEST FOR HAZARDOUS AND OTHER WASTE</h2>
  </div>
  <table>
    <tr><td style="width:40px;"><b>1.</b></td><td><b>Sender's name and mailing address (including Phone No. and e-mail)</b></td><td>${esc(form.senderNameAddress)}<br>${esc(form.senderPhone)}<br>${esc(form.senderEmail)}</td></tr>
    <tr><td><b>2.</b></td><td><b>Sender's authorisation No.</b></td><td>${esc(form.senderAuthorizationNo)}</td></tr>
    <tr><td><b>3.</b></td><td><b>Manifest Document No.</b></td><td>${esc(form.manifestDocumentNo)}</td></tr>
    <tr><td><b>4.</b></td><td><b>Transporter's name and address (including Phone No. and e-mail)</b></td><td>${esc(form.transporterNameAddress)}<br>${esc(form.transporterPhone)}<br>${esc(form.transporterEmail)}</td></tr>
    <tr><td><b>5.</b></td><td><b>Type of vehicle</b></td><td>${esc(form.vehicleType)}</td></tr>
    <tr><td><b>6.</b></td><td><b>Transporter's registration No.</b></td><td>${esc(form.transporterRegistrationNo)}</td></tr>
    <tr><td><b>7.</b></td><td><b>Vehicle registration No.</b></td><td>${esc(form.vehicleRegistrationNo)}</td></tr>
    <tr><td><b>8.</b></td><td><b>Receiver's name and mailing address (including Phone No. and e-mail)</b></td><td>${esc(form.receiverNameAddress)}<br>${esc(form.receiverPhone)}<br>${esc(form.receiverEmail)}</td></tr>
    <tr><td><b>9.</b></td><td><b>Receiver's authorisation No.</b></td><td>${esc(form.receiverAuthorizationNo)}</td></tr>
    <tr><td><b>10.</b></td><td><b>Waste description</b></td><td>${esc(form.wasteDescription)}</td></tr>
    <tr><td><b>11.</b></td><td><b>Total quantity<br>No. of Containers</b></td><td>${esc(form.totalQuantity)} ${esc(form.quantityUnit)}<br>${esc(form.noOfContainers)}</td></tr>
    <tr><td><b>12.</b></td><td><b>Physical form</b></td><td>${esc(form.physicalForm)}</td></tr>
    <tr><td><b>13.</b></td><td><b>Special handling instructions and additional information</b></td><td>${esc(form.specialHandlingInfo)}</td></tr>
    <tr><td><b>14.</b></td><td><b>Sender's Certificate</b></td><td>I hereby declare that the contents of the consignment are fully and accurately described above by proper shipping name and are categorised, packed, marked, and labelled, and are in all respects in proper conditions for transport by road according to applicable national government regulations.</td></tr>
    <tr><td></td><td colspan="2">Name and stamp: ${esc(form.senderNameStamp)} | Signature: ${esc(form.senderSignature)} | Month: ${esc(form.senderMonth)} | Day: ${esc(form.senderDay)} | Year: ${esc(form.senderYear)}</td></tr>
    <tr><td><b>15.</b></td><td colspan="2"><b>Transporter acknowledgement of receipt of Wastes</b></td></tr>
    <tr><td></td><td colspan="2">Name and stamp: ${esc(form.transporterNameStamp)} | Signature: ${esc(form.transporterSignature)} | Month: ${esc(form.transporterMonth)} | Day: ${esc(form.transporterDay)} | Year: ${esc(form.transporterYear)}</td></tr>
    <tr><td><b>16.</b></td><td colspan="2"><b>Receiver's certification for receipt of hazardous and other waste</b></td></tr>
    <tr><td></td><td colspan="2">Name and stamp: ${esc(form.receiverNameStamp)} | Signature: ${esc(form.receiverSignature)} | Month: ${esc(form.receiverMonth)} | Day: ${esc(form.receiverDay)} | Year: ${esc(form.receiverYear)}</td></tr>
  </table>
</body>
</html>`;
};

export default function WasteViewPage() {
  const [rows, setRows] = useState<ViewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<FormEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadRows = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("flag", "GWT-ALL");
        const res = await fetch(`/api/auth/waste/view?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await res.json()) as ApiResponse;
        if (!res.ok || !payload.success || !Array.isArray(payload.data)) {
          setRows([]);
          setError(payload.message || payload.error || "Failed to load waste data");
          return;
        }
        setRows(payload.data);
      } catch {
        setRows([]);
        setError("Request failed while loading waste data");
      } finally {
        setLoading(false);
      }
    };

    void loadRows();
  }, []);

  const tableRows = useMemo<FormEntry[]>(() => {
    const sortedRows = [...rows].sort((a, b) => {
      const aCode = toText(a.ID ?? a.Code).trim();
      const bCode = toText(b.ID ?? b.Code).trim();
      const aNum = Number(aCode);
      const bNum = Number(bCode);
      if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum;
      return aCode.localeCompare(bCode, undefined, { numeric: true, sensitivity: "base" });
    });

    return sortedRows.map((row) => toForm3Entry(row as Record<string, unknown>) as FormEntry);
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return tableRows;

    return tableRows.filter((item) =>
      [
        item.code,
        item.date,
        item.targetDate,
        item.wasteCategory,
        item.waste,
        item.quantity,
        item.storageMethod,
        item.physicalState,
        item.disposer,
        item.receiver,
        item.approvalStatus,
        item.wcid,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [tableRows, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [rows.length, searchTerm]);

  const onDownload = (entry: FormEntry) => {
    const formHtml = createForm3Html(entry);

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Form3_${entry.code}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: white;
      font-family: Arial, sans-serif;
    }

    body {
      display: flex;
      justify-content: center;
    }

    #print-box {
      width: 100%;
      max-width: 800px;
      background: white;
    }

    #print-box table {
      width: 100%;
      border-collapse: collapse;
    }

    #print-box th,
    #print-box td {
      border: 1px solid #334155;
      padding: 8px;
      font-size: 12px;
      vertical-align: top;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }

      #print-box {
        box-shadow: none;
        margin: 0;
        width: 100%;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div id="print-box">
    ${formHtml}
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Please allow popups to download Form 3 as PDF.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    };
  };



  const fetchForm10Data = async (id: string): Promise<Form10Data> => {
    const res = await fetch("/api/GetData/GetForm10Details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ID: id }),
    });

    const payload = await res.json();

    if (!res.ok || !payload.success) {
      throw new Error(payload.message || "Failed to load Form 10 details");
    }

    const row = Array.isArray(payload.data) ? payload.data[0] : payload.data;
    return toForm10DataFromApiRow((row ?? {}) as Record<string, unknown>);
  };

  const openForm10 = (entry: FormEntry) => {
    const linkedId = entry.iddid || entry.code;
    if (!linkedId) {
      alert("Form 10 link is missing.");
      return;
    }
    window.open(
      `/Form/Form10?fddid=${encodeURIComponent(entry.code)}&iddid=${encodeURIComponent(linkedId)}`,
      "_blank"
    );
  };

  const onDownloadForm10 = async (entry: FormEntry) => {
    let form: Form10Data;
    try {
      form = await fetchForm10Data(entry.iddid || entry.code);
    } catch (err) {
      console.error("Failed to load Form 10 for download", err);
      alert("Failed to load Form 10.");
      return;
    }

    const formHtml = createForm10Html(form, entry.code);

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Form10_${entry.code}</title>
  <style>
    @media print {
      body { margin: 0; }
      #print-box { margin: 0; }
    }
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="print-box">
    ${formHtml}
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=900,height=650");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };


  return (
    <section className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-teal-600">View Waste Details</h1>
      </div>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading records...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 space-y-3">
          <input
            id="waste-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, date, waste category, approval status..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 sm:max-w-sm"
          />

          <div className="overflow-x-auto rounded-xl border border-slate-300">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-900">ID</th>
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-900">Date</th>
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-900">Waste Category</th>
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-900">Waste</th>
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-900">Approval Status</th>
                  <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-900">Target Date</th>
                  {/* <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-900">Form 3</th> */}
                  {/* <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-900">Form 10</th> */}
                </tr>
              </thead>
              <tbody>
                {pagedRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="border border-slate-300 px-2 py-3 text-center text-slate-600">
                      No records found for the current search.
                    </td>
                  </tr>
                )}

                {pagedRows.map((item, index) => (
                  <tr
                    key={`waste-entry-${(currentPage - 1) * PAGE_SIZE + index}`}
                    className={getApprovalRowClass(item.approvalStatus)}
                    onClick={() => setSelectedEntry(item)}
                  >
                    <td className="border border-slate-300 px-2 py-1 text-slate-800">{item.code}</td>
                    <td className="border border-slate-300 px-2 py-1 text-slate-800">{item.date}</td>
                    <td className="border border-slate-300 px-2 py-1 text-slate-800">{item.wasteCategory}</td>
                    <td className="border border-slate-300 px-2 py-1 text-slate-800">{item.waste}</td>
                    <td className="border border-slate-300 px-2 py-1 text-slate-800">{item.approvalStatus}</td>
                    <td className="border border-slate-300 px-2 py-1 text-slate-800">{item.targetDate}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && filteredRows.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 sm:text-sm">
          <p>
            Showing {pagedRows.length} of {filteredRows.length} records
            {searchTerm.trim() ? " (filtered)" : ""} (Code Ascending)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setPage(1)} disabled={currentPage === 1} className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50">First</button>
            <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50">Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50">Next</button>
            <button type="button" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50">Last</button>
          </div>
        </div>
      )}

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-2 md:p-4">
          <div className="max-h-[96vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-3 shadow-2xl md:p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Waste Form - {selectedEntry.code || "Entry"}
              </h3>
              <div className="flex items-center gap-2">
                {selectedEntry.wcid === "1" && selectedEntry.stsCode === "3" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onDownload(selectedEntry)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4" />
                      Form 3 PDF
                    </button>
                  </>

                ) : null}
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-300">
              <table className="min-w-full border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-2 py-2 text-left">Field</th>
                    <th className="border border-slate-300 px-2 py-2 text-left">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {buildDetailRows(selectedEntry).map(([label, value]) => (
                    <tr key={`${selectedEntry.code}-${label}`}>
                      <td className="border border-slate-300 px-2 py-2 font-medium text-slate-900">{label}</td>
                      <td className="border border-slate-300 px-2 py-2 text-slate-800">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* <div className="mt-4 text-center">
              <h1 className="text-xl font-bold text-slate-900">FORM 3</h1>
              <p className="text-xs italic text-slate-700">
                [See rules 6(5), 13(7), 14(6), 16(5) and 20(1)]
              </p>
              <h2 className="mt-2 text-sm font-semibold text-slate-900">
                FORMAT FOR MAINTAINING RECORDS OF HAZARDOUS AND OTHER WASTES
              </h2>
            </div> */}
            {/* <div className="mt-4 space-y-2 text-xs text-slate-800 sm:text-sm">
              <p>1. Name and address of the facility : {selectedEntry.unitDesc}</p>
              <p>
                2. Date of issuance of authorisation and its reference number :{" "}
                {[selectedEntry.dateOfIssuance, selectedEntry.referenceNo].filter(Boolean).join(" ")}
              </p>
              <p>3. Description of hazardous and other wastes handled (Generated or Received)</p>
            </div> */}
            {/* <div className="mt-3 overflow-x-auto rounded-lg border border-slate-300">
              <table className="min-w-[760px] border-collapse text-xs sm:min-w-full sm:text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-2 py-2 text-left">Date</th>
                    <th className="border border-slate-300 px-2 py-2 text-left">Type of waste with category</th>
                    <th className="border border-slate-300 px-2 py-2 text-left">Total quantity(MT)</th>
                    <th className="border border-slate-300 px-2 py-2 text-left">Method of Storage</th>
                    <th className="border border-slate-300 px-2 py-2 text-left">Destined to or received from</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-2 py-2">{selectedEntry.date}</td>
                    <td className="border border-slate-300 px-2 py-2">
                      {[selectedEntry.waste || selectedEntry.wasteType, selectedEntry.sapWasteCode]
                        .filter(Boolean)
                        .join(" / ")}
                    </td>
                    <td className="border border-slate-300 px-2 py-2">{selectedEntry.quantity}</td>
                    <td className="border border-slate-300 px-2 py-2">{selectedEntry.storageMethod}</td>
                    <td className="border border-slate-300 px-2 py-2">{getDestinedDisplay(selectedEntry)}</td>
                  </tr>
                </tbody>
              </table>
            </div> */}
            {/* 
            <p className="mt-4 text-xs italic text-slate-700 sm:text-sm">
              * Fill up above table separately for indigenous and imported waste.
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-800 sm:text-sm">
              <p>
                4. Date wise description of management of hazardous and other wastes including products sent and to whom in case of
                recyclers or pre-processor or utiliser:
              </p>
              <p>5. Date of environmental monitoring (as per authorisation or guidelines of Central Pollution Control Board):</p>
            </div>

            <div className="mt-8 flex flex-col gap-3 text-xs text-slate-900 sm:flex-row sm:items-end sm:justify-between sm:text-sm">
              <div>
                <p>Date: {selectedEntry.date || "...................."}</p>
                <p className="mt-2">Place: ....................</p>
              </div>
              <p className="font-semibold">Signature of occupier</p>
            </div> */}
          </div>
        </div>
      )}
    </section>
  );
}