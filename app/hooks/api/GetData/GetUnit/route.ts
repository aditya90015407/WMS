import { NextResponse } from "next/server";
import { getConnection } from "@/lib/dbConnect";
// import { NVarChar } from "mssql";
import sql from "mssql";


export async function GET(req:Request){

    try{
    const pool = await getConnection();

    if(!pool || !pool.connected){
         throw new Error("SQL pool is not connected");
    }
   
    const result=await pool
           .request()
           .input("FLAG",sql.VarChar,"DROP-UNIT")
           .execute("PRO-WMS_GET");
            console.log(result)
           return NextResponse.json(result.recordset);

    
}catch(err:any){
        return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 });
}


}