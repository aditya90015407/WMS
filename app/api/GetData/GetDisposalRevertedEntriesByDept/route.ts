import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";


export async function POST(req : Request) {

    try{
      const body = await req.json();
      const DeptID = String(body?.DeptID ?? body?.DeptId ?? "").trim();
       
      if (!DeptID) {
        return NextResponse.json(
            { success: false, message: "DeptID is Required" },
            { status: 400 },
        );
    }


        const pool = await getConnection();

        

        if(!pool || !pool.connected)
        {
            throw new Error("Couldn't connect to Database");
        }

        const result = await pool
        .request()
        .input("FLAG", sql.NVarChar, "GetDisposalRevertedEntriesByDept")
        .input("DeptID" , sql.NVarChar , DeptID)
        .execute("PRO-WMS_GET");

        console.log(result)

        return NextResponse.json(
            {
                success : true,
                data: result.recordset ?? [],   
            }
        )


    }catch(err : any)
    {

        return NextResponse.json(
            {
                success : false,
                message : err?.message||"Server Error"
            }
        ,{status : 500}
        )
    }
    
}
