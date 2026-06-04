import { getConnection } from "@/lib/dbConnect";
import { NextRequest,NextResponse } from "next/server";
import sql from "mssql";

export async function POST(req : Request) {
    try
    {   
         const pool= await getConnection();
    if(!pool || !pool.connected)
    {
        throw new Error("DB NOT CONNECTED");
    }

    const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ success: false, message: "ID missing" }, { status: 400 });
        }
    //  console.log(id)
    const result = await pool.request()
                    .input("FLAG",sql.VarChar,"GetAllInitiateDisposalDetailbyIDNI")
                    .input("IDDID", sql.VarChar, id)
                    .execute("PRO-WMS_GET");
                    // console.log(result.recordset)

    return NextResponse.json({
        success: true,
      data: result.recordset ?? [],
    });
    }catch(err : any)
    {
        return NextResponse.json(
           { success:false,message:err?.message||"Server Error"},
           {status : 500}
        )
    }

}