import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";

export async function POST(req:Request) {

    try{
      const pool=await getConnection()
      if(!pool || !pool.connected)
      {
        throw new Error("Could Not Connect to DataBase")
      }

     const {
      APID,
      TransporterName,
      TransporterAddress,
      TransporterPhone,
      TransporterEmail,
      VTID,
      TransporterRegNo,
      VehicleRegNo,
      ReceiverName,
      ReceiverAddress,
      ReceiverAuthNo,
    } = await req.json();

    if (!APID) {
      return NextResponse.json(
        { success: false, message: "APID is required" },
        { status: 400 }
      );
    }

    const result=await pool
      .request()
      .input("FLAG", sql.VarChar, "SetTransportationDetails")
      .input("APID", sql.Int, Number(APID)) // change to VarChar if APID is string
      .input("TransporterName", sql.VarChar, TransporterName ?? "")
      .input("TransporterAddress", sql.VarChar, TransporterAddress ?? "")
      .input("TransporterPhone", sql.VarChar, TransporterPhone ?? "")
      .input("TransporterEmail", sql.VarChar, TransporterEmail ?? "")
      .input("VTID", sql.Int, Number(VTID) || 0)
      .input("TransporterRegNo", sql.VarChar, TransporterRegNo ?? "")
      .input("VehicleRegNo", sql.VarChar, VehicleRegNo ?? "")
      .input("ReceiverName", sql.VarChar, ReceiverName ?? "")
      .input("ReceiverAddress", sql.VarChar, ReceiverAddress ?? "")
      .input("ReceiverAuthNo", sql.VarChar, ReceiverAuthNo ?? "")
      .execute("PRO-WMS_SET");
      console.log(result)

    return NextResponse.json({ success: true, message: "Transporter saved" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}


    
