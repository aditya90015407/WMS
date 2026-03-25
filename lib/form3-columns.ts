export type ViewRow = Record<string, unknown>;

export type FormEntry = {
  code: string;
  date: string;
  targetDate: string;
  wasteCategory: string;
  wasteType: string;
  waste: string;
  quantity: string;
  sapWasteCode: string;

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

const toText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const firstText = (...values: unknown[]): string => {
  for (const value of values) {
    const text = toText(value).trim();
    if (text) return text;
  }
  return "";
};

const asDisplayDate = (value: unknown): string => {
  const raw = toText(value).trim();
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!iso) return raw;
  return `${iso[3]}-${iso[2]}-${iso[1]}`;
};

export const toForm3Entry = (row: ViewRow): FormEntry => ({
  code: toText(row.ID ?? row.Code),
  date: asDisplayDate(row.GD ?? row["Date"]),
  targetDate: asDisplayDate(row.TD ?? row["Target Date"]),
  wasteCategory: toText(row.WC ?? row["Waste Category"]),
  wasteType: toText(row.WT ?? row["Waste Type"]),
  waste: toText(row.WW ?? row["Waste"]),
  
  sapWasteCode: toText(row.SapWasteCode ?? row["SapWasteCode"] ?? row["SAPWASTECODE"]),
  
  
  unitDesc: firstText(row.UnitDesc, row["UnitDesc"], row["Unit Desc"]),
  dateOfIssuance: asDisplayDate(
    firstText(row.DateofIssuance, row["DateofIssuance"], row["Date of Issuance"]),
  ),
  referenceNo: firstText(
    row.ReferenceNo,
    row["ReferenceNo"],
    row["Reference No"],
    row["Reference No."],
  ),
  quantity: toText(row.WQ ?? row["Waste Quantity"]),
  storageMethod: toText(row.SM ?? row["Storage Method"]),
  physicalState: toText(row.PS ?? row["Physical State"]),
  disposer: toText(row.WD ?? row["WD"] ?? row["Waste Disposer"]),
  receiver: toText(row.WR ?? row["WR"] ?? row["Waste Receiver"]),
  dispId: toText(row.DispID ?? row["DispID"] ?? row["Disp Id"]),
  dept: toText(row.Dept ?? row["Dept"]),
  deptId: toText(row.DeptID ?? row["DeptID"]),
  receiverId: toText(row.ReceiverID ?? row["ReceiverID"] ?? row["Receiver Id"]),
  approvalStatus: toText(row.ApprovalStatus ?? row["ApprovalStatus"]),
  wcid: toText(row.WCID ?? row["WCID"]),
  stsCode: toText(row.StsCode ?? row["StsCode"]),
});

