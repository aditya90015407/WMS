import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";

export async function POST() {
  try{
    const pool= await getConnection();

    if(!pool || !pool.connected)
    {
        throw new Error("DB Not Connected")
    }

    const result= await pool
       .request()
       .input("FLAG",sql.VarChar,'Drop-VehicleType')
       .execute("PRO-WMS_GET");
        console.log(result.recordset);
       return NextResponse.json({ success: true, data: result.recordset ?? [] });

            }catch(err: any)
            {
                return NextResponse.json( { success: false, message: err?.message || "Server error" },
                { status: 500 })
            }
    
}