import { getConnection } from "@/lib/dbConnect";
import { NVarChar } from "mssql";
import { NextRequest,NextResponse } from "next/server";

export async function POST (req: NextRequest)
{
  try{
    const pool = await getConnection();
    if(!pool || !pool.connected)
    {
        throw new Error("Couldn't connect to Database");
    }
      
     const body=await req.json();
     const empCode = String(body?.EmpCode ?? body?.empCode ?? "").trim();
     
     console.log(empCode);

     if (!empCode) {
      return NextResponse.json(
        { success: false, message: "EmpCode is required" },
        { status: 400 },
      );
    }

    const result = await pool.request()
                .input("FLAG",NVarChar,"GetRole")
                .input("EmpCode",NVarChar,empCode)
                .execute("PRO-WMS_GET");
 

                console.log(result.recordset)
        return NextResponse.json(result.recordset);
}  catch (err:any){
    return NextResponse.json({success:false,message:err?.message},
        {status:500});
        }
    
  }
