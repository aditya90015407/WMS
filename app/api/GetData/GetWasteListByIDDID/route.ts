import { getConnection } from "@/lib/dbConnect";
import { NextRequest,NextResponse } from "next/server";
import sql from "mssql";
export async function POST(req:Request) {
    try{
    const pool = await getConnection();
    const {id}= await req.json();
    if(!pool || !pool.connected)
    {
        throw new Error ("Db not connected");
    }
    if(!id)
    {
         return NextResponse.json({ success: false, message: "ID missing" }, { status: 400 });
    }

    const result =await pool.request()
                .input("FLAG",sql.VarChar,"GetWasteListByIDDID")
                .input("IDDID",sql.VarChar,id)
                .execute("PRO-WMS_GET");
                    console.log(result.recordset)

      return NextResponse.json({
        success: true,
      data: result.recordset ?? [],
    });
}catch(err : any)
{
      return NextResponse.json(
           { success:false,message:err?.message||"Server Error"},
           {status : 500}
        );
}
}