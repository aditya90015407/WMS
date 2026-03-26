import { NextResponse   } from "next/server";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { AuthOptions } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
 
export async function POST(req:Request){
    try{
        const body=await req.json();
        const session=await getServerSession(authOptions);
        const pool=await getConnection();
       
        const empCode=String(session?.user?.id??"").trim();
       
        if(!empCode)
        {
            return NextResponse.json(
                {success:false,message:"Session not found. Please sign in again." },
                {status:401}
            );
 
        }
 
 
        if(!pool || !pool.connected)
        {
            throw new Error("DB Not Connected")
        }
       
 
            const auctionDate = String(body.AuctionDate ?? "").trim();
            const remarks = String(body.Remarks ?? "").trim();
 
       
 
        const result= await pool
             .request()
             .input("FLAG",sql.NVarChar(50),'InitiateDiposal')
             .input("Auctionable",sql.Int,1)
             .input("AuctionDate",sql.Date,auctionDate )
             .input("EmpCode",sql.Int,empCode )
 
            //  .input("VendorIDs",sql.NVarChar(sql.MAX),vendorIdsCsv ?? "")
             .input("Remarks",sql.NVarChar(sql.MAX),remarks )
             .execute("PRO-WMS_SET");
   
             console.log(result.recordset[0].STATUS)
             const refNo=result.recordset[0].STATUS.split('-')[1];
 
             const wcid=String(body.wasteCategoryId ?? "").trim();
             const wasteIds =
                Array.isArray(body.wasteIds)
                    ? body.wasteIds
                    : String(body.wasteIds ?? "")
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean);
 
             const vendorIds =
                Array.isArray(body.vendorIds)
                    ? body.vendorIds
                    : String(body.vendorIds ?? "")
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean);
 
           
            const wasteResults: any[] = [];
 
            console.log(vendorIds)
 
            for (const wid of wasteIds) {
            const wasteResult = await pool
                .request()
                .input("FLAG", sql.NVarChar(50), "InsertAuctionWasteDetails")
                .input("IDDID", sql.Int, refNo)
                .input("WCID",sql.NVarChar(50),wcid)
                .input("WID", sql.NVarChar(50), wid)
                .input("EmpCode", sql.Int, Number(empCode))
                .execute("PRO-WMS_SET");
 
            wasteResults.push(wasteResult.recordset?.[0] ?? null);
            }
 
               
                 
 
             const vendorResults: any[] = [];
 
            for (const vid of vendorIds) {
            const vendorResult = await pool
                .request()
                .input("FLAG", sql.NVarChar(50), "InsertAuctionVendorDetails")
                .input("IDDID", sql.Int, refNo)
                .input("VID", sql.NVarChar(50), vid)
                .input("EmpCode", sql.Int, Number(empCode))
                .execute("PRO-WMS_SET");
 
            vendorResults.push(vendorResult.recordset?.[0] ?? null);
            }
 
 
         
        // return NextResponse.json({  success:true ,data: result.recordset ?? [] });
        return NextResponse.json({
                success: true,
                data: {
                    a1: result.recordset ?? [],
                    a2: wasteResults,
                    a3: vendorResults,
                },
                });
 
 
    }catch(e : any)
    {
        return NextResponse.json({  success:false ,message:e.message },{status:500});
    }
}