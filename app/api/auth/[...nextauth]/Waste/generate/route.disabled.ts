export { };
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";
import { authOptions } from "../../options";
import { signOut } from "next-auth/react";

type MasterOptionRow = {
  ID?: string | number;
  NAME?: string;
  [key: string]: unknown;
};

type WasteAssignmentRow = {
  [key: string]: unknown;
};

type SavePayload = {
  date?: string;
  categoryId?: string;
  wasteId?: string;
  unitId?: string;
  receiver?: string;
  disposer?: string;
  physicalState?: string;
  storage?: string;
  disposalTarget?: string;
  quantity?: string;
  UID: string
  DeptID: string
  // DID: string
  storageMethod: string
};

const toOption = (row: MasterOptionRow) => {
  const id = getMappedId(row, [
    "ID",
    "MUID",
    "QUID",
    "UID",
    "UnitID",
    "QuantityUnitID",
    "WTID",
  ]);
  const name = getMappedId(row, [
    "NAME",
    "MUnit",
    "Unit",
    "UNIT",
    "UnitName",
    "QuantityUnit",
    "QuantityUnitName",
    "Description",
  ]);

  return {
    id: String(id ?? ""),
    name: String(name ?? ""),
  };
};

const getMappedId = (
  row: MasterOptionRow,
  keys: string[],
): string | undefined => {
  const entries = Object.entries(row);
  const normalizeKey = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (const key of keys) {
    const directValue = row[key];
    if (directValue !== null && directValue !== undefined) {
      const text = String(directValue).trim();
      if (text.length > 0) return text;
    }

    const normalizedTarget = normalizeKey(key);
    const matched = entries.find(
      ([entryKey]) => normalizeKey(entryKey) === normalizedTarget,
    );
    const value = matched?.[1];
    if (value !== null && value !== undefined) {
      const text = String(value).trim();
      if (text.length > 0) return text;
    }
  }

  return undefined;
};

const toWasteOption = (row: MasterOptionRow) => {
  const wid = getMappedId(row, ["WID", "Wid", "WasteID", "ID"]);
  return {
    id: String(wid ?? row.ID ?? ""),
    name: String(row.NAME ?? ""),
    wid,
    waid: getMappedId(row, ["WAID", "WASTEASSIGNID"]),
    receiverId: getMappedId(row, ["AID", "ReceiverID", "RCVRID", "RCVID", "RID"]),
    disposerId: getMappedId(row, ["DID", "DisposerID", "DISPOID", "DeptID"]),
  };
};

export async function handleGenerateGet(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") ?? "").toLowerCase();
    const wcid = searchParams.get("wcid") ?? "";
    const wid = (searchParams.get("WID") ?? searchParams.get("wid") ?? "").trim();
    // const uid = (searchParams.get("UID") ?? searchParams.get("uid") ?? "").trim();
    // const deptId = (searchParams.get("DeptID") ?? searchParams.get("DeptId") ?? "").trim();
    const waid = (searchParams.get("WAID") ?? searchParams.get("waid") ?? "").trim();
    const optionId = (searchParams.get("ID") ?? searchParams.get("id") ?? "").trim();
    const plantunitid = (searchParams.get("plantunitid") ?? "").trim();

    const session = await getServerSession(authOptions);

    if (!session) {
      await signOut({ callbackUrl: '/sign-in', redirect: true })
      return NextResponse.json("Invalid Request")
    }
    const uid = session?.user.uid
    const deptId = session?.user.deptId

    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("SQL pool is not connected after getConnection()");
    }

    if (type === "drop-wc") {
      const result = await pool.request().input("FLAG", "DROP-WC").execute("PRO-WMS_GET");
      return NextResponse.json({
        success: true,
        data: (result.recordset as MasterOptionRow[]).map(toOption),
      });
    }

    if (type === "drop-waste") {
      if (!wcid) {
        return NextResponse.json(
          { success: false, message: "Missing wcid" },
          { status: 400 },
        );
      }

      const result = await pool
        .request()
        .input("FLAG", "DROP-WASTE")
        .input("WCID", wcid)
        .execute("PRO-WMS_GET");

      return NextResponse.json({
        success: true,
        data: (result.recordset as MasterOptionRow[]).map(toWasteOption),
      });
    }


    if (type === "drop-waste-for-unit") {
      if (!wcid || !uid) {
        return NextResponse.json(
          { success: false, message: "Missing wcid or uid" },
          { status: 400 },
        );
      }

      const result = await pool
        .request()
        .input("FLAG", "DROP-WASTE-For-Unit")
        .input("WCID", wcid)
        .input("UID", uid)
        .execute("PRO-WMS_GET");

      return NextResponse.json({
        success: true,
        data: (result.recordset as MasterOptionRow[]).map(toWasteOption),
      });
    }

    if (type === "drop-waste-for-plantunit") {
      if (!wcid || !plantunitid) {
        return NextResponse.json(
          { success: false, message: "Missing wcid or plantunitid" },
          { status: 400 },
        );
      }

      const result = await pool
        .request()
        .input("FLAG", "DROP-WASTE-For-Unit")
        .input("WCID", wcid)
        .input("UID", plantunitid)
        .execute("PRO-WMS_GET");

      return NextResponse.json({
        success: true,
        data: (result.recordset as MasterOptionRow[]).map(toWasteOption),
      });
    }


    if (type === "drop-item-select") {
      // console.log("i was called ")
      if (!wid && !waid && !optionId) {
        return NextResponse.json(
          { success: false, message: "Missing wid/waid/id" },
          { status: 400 },
        );
      }

      // console.log( wid, waid)


      const candidates = Array.from(
        new Set([wid, waid, optionId].map((value) => value.trim()).filter(Boolean)),
      );

      const uid = session?.user.uid

      let result: sql.IProcedureResult<unknown> | null = null;
      for (const candidate of candidates) {
        result = await pool
          .request()
          .input("FLAG", "DROP-ITEM-SELECT")
          .input("WID", sql.NVarChar(20), candidate)
          .input("UID", uid)
          .execute("PRO-WMS_GET");
        if ((result.recordset?.length ?? 0) > 0) break;
      }

      // const firstRow = result?.recordset?.[0] as WasteAssignmentRow | undefined;
      // // console.log(firstRow)
      // const mappingRow = (firstRow ?? {}) as MasterOptionRow;
      // const receiverId =
      //   getMappedId(mappingRow, ["AID", "ReceiverID", "RCVRID", "RID"]) ?? "";
      // // const disposerId =
      // //   getMappedId(mappingRow, ["DeptID", "DID", "DisposerID", "DISPOID"]) ?? "";
      // const receiverName =
      //   getMappedId(mappingRow, ["Receiver", "ReceiverName", "RName"]) ?? "";
      // const disposerName =
      //   getMappedId(mappingRow, ["Dept", "Department", "Disposer", "DName"]) ?? "";

      // console.log(result?.recordset, uid, wid, waid)
      return NextResponse.json({
        success: true,
        data: result?.recordset
      });
    }

    if (type === "drop-rcvr") {
      const result = await pool.request().input("FLAG", "DROP-RCVR").execute("PRO-WMS_GET");
      return NextResponse.json({
        success: true,
        data: (result.recordset as MasterOptionRow[]).map(toOption),
      });
    }

    if (type === "drop-quantityunit") {


      const result = await pool.request().input("FLAG", "DROP-QUANTITYUNIT").execute("PRO-WMS_GET");
      // console.log(result.recordset)
      return NextResponse.json({
        success: true,
        data: (result.recordset as MasterOptionRow[])
          .map(toOption)
          .filter((item) => item.id.trim().length > 0 && item.name.trim().length > 0),
      });

    }

    if (type === "drop-dispo") {
      const result = await pool.request().input("FLAG", "DROP-DISPO").execute("PRO-WMS_GET");
      return NextResponse.json({
        success: true,
        data: (result.recordset as MasterOptionRow[]).map(toOption),
      });
    }

    if (type === "drop-phstate") {
      const result = await pool
        .request()
        .input("FLAG", "DROP-PHSTATE")
        .execute("PRO-WMS_GET");
      return NextResponse.json({
        success: true,
        data: (result.recordset as MasterOptionRow[]).map(toOption),
      });
    }

    if (type === "drop-smethod") {
      const result = await pool
        .request()
        .input("FLAG", "DROP-SMETHOD")
        .execute("PRO-WMS_GET");
      return NextResponse.json({
        success: true,
        data: (result.recordset as MasterOptionRow[]).map(toOption),
      });
    }


    if (type === "getdisposer") {
      if (!wcid || !wid || !uid) {
        return NextResponse.json(
          { success: false, message: "Missing required parameters" },
          { status: 400 },
        );
      }
      // console.log("hii am ", wcid, uid, wid)

      const result = await pool
        .request()
        .input("FLAG", "GetDisposer")
        .input("WCID", wcid)
        .input("UID", uid)
        .input("WID", wid)
        .execute("PRO-WMS_GET");

      // console.log(result.recordset)

      return NextResponse.json({
        success: true,
        data: (result.recordset as MasterOptionRow[]).map(toOption),
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Unsupported type. Use type=drop-wc, type=drop-waste&wcid=<id>, type=drop-waste-for-unit&wcid=<id>&uid=<id>, type=drop-item-select&wid=<id>, type=DROP-QUANTITYUNIT, type=drop-rcvr, type=drop-dispo, type=drop-phstate, type=drop-smethod or type=getDisposer&<wid,uid,wcid>",

      },
      { status: 400 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown Message";
    return NextResponse.json(
      {
        success: false,
        message: "Generate API failed",
        error: message,
      },
      { status: 500 },
    );
  }
}

export async function handleGeneratePost(request: Request) {
  try {
    const body = (await request.json()) as SavePayload;
    const authSession = await getServerSession(authOptions);
    const createdBy = String(authSession?.user?.id ?? "").trim();

    if (!createdBy) {
      return NextResponse.json(
        {
          success: false,
          message: "Session not found. Please sign in again.",
        },
        { status: 401 },
      );
    }

    const requiredFields: Array<keyof SavePayload> = [
      "date",
      "categoryId",
      "wasteId",
      "unitId",
      "receiver",
      "disposer",
      "physicalState",
      "storage",
      "disposalTarget",
      "quantity",
      "storageMethod"
    ];

    const missing = requiredFields.find((key) => {
      const value = body[key];
      return typeof value !== "string" || value.trim().length === 0;
    });

    if (missing) {
      return NextResponse.json(
        { success: false, message: `Missing required field: ${missing}` },
        { status: 400 },
      );
    }

    const wasteQty = Number(body.quantity);
    if (!Number.isFinite(wasteQty) || wasteQty <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be a valid number greater than 0",
        },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("SQL pool is not connected after getConnection()");
    }

    const validateQty = await pool
      .request()
      .input("FLAG", sql.NVarChar(20), "VLDT-YEARLY-QTY")
      .input("WID", sql.NVarChar(20), body.wasteId as string)
      .input("UID", sql.NVarChar(20), body.UID as string)
      .input("WasteQty", sql.Decimal(18, 2), wasteQty)
      .execute("PRO-WMS_GET")

    const validateRes = validateQty.recordset?.[0] as Record<string, unknown> | undefined;
    const validated = validateRes!.STATUS

    if (validated == 'VIOLATED') {
      return NextResponse.json({
        success: false,
        message: "Maximum allowed annual waste quantity exceeded. ",
        // refId: referenceId,
      });
    }

    // console.log(body)

    const result = await pool
      .request()
      .input("FLAG", sql.NVarChar(20), "GWT-INS")
      .input("WCID", sql.NVarChar(20), body.categoryId as string)
      .input("WID", sql.NVarChar(20), body.wasteId as string)
      .input("WTID", sql.NVarChar(20), body.unitId as string)
      .input("MUID", sql.NVarChar(20), body.unitId as string)
      .input("PSID", sql.NVarChar(20), body.physicalState as string)
      .input("UID", sql.NVarChar(20), body.UID as string)
      .input("DeptID", sql.NVarChar(20), body.DeptID as string)
      .input("DID", sql.NVarChar(20), body.disposer as string)
      .input("SMID", sql.NVarChar(20), body.storage as string)
      .input("StorageMethod", sql.NVarChar(200), body.storageMethod as string)
      .input("AID", sql.NVarChar(20), body.receiver as string)
      .input("WasteQty", sql.Decimal(18, 2), wasteQty)
      .input("GenerationDate", sql.Date, body.date as string)
      .input("TargetDate", sql.Date, body.disposalTarget as string)
      .input("CRBY", sql.NVarChar(50), createdBy)
      .execute("PRO-WMS_SET");

    const firstRow = result.recordset?.[0] as Record<string, unknown> | undefined;
    const values = firstRow ? Object.values(firstRow) : [];
    const responseMessage =
      typeof values[0] === "string" ? values[0] : "Waste generated successfully";
    const referenceId =
      values.length > 1 && values[1] !== null && values[1] !== undefined
        ? String(values[1])
        : "";

    return NextResponse.json({
      success: true,
      message: responseMessage,
      refId: referenceId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown Message";
    return NextResponse.json(
      {
        success: false,
        message: "Save API failed",
        error: message,
      },
      { status: 500 },
    );
  }
}