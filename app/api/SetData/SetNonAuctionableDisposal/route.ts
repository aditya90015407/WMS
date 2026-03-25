import { NextResponse } from "next/server";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { AuthOptions } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";



export async function POST(req : Request){
    try{
        const body =await req.json();
        const session=await getServerSession(authOptions);
        const pool=await getConnection();
        const empCode=String(session?.user?.id??"").trim();

        if(!pool || !pool.connected){
           throw new Error("DB Not Connected")
        }
        if(!empCode)
        {
            return NextResponse.json(
                {success:false,message:"Session not found. Please sign in again." },
                {status:401}
            );

        }

        
        const Date = String(body.Date ?? "").trim();
        const remarks = String(body.Remarks ?? "").trim();

        const result= await pool
            .request()
            .input("FLAG",sql.NVarChar(50),'InitiateDiposal')
            .input("Auctionable",sql.Int,0)
            .input("EmpCode",sql.Int,empCode )
            .input("Remarks",sql.NVarChar(sql.MAX),remarks )
            .execute("PRO-WMS_SET");


            console.log(result.recordset[0].STATUS)
            const refNo=result.recordset[0].STATUS.split('-')[1];
            
            const wasteIdsCsv = Array.isArray(body.wasteIds) ? body.wasteIds.join(",") : "";

            const wasteResult=await pool
                .request()
                .input("FLAG",sql.NVarChar(50),'InsertAuctionWasteDetails')
                .input("IDDID",sql.Int,refNo)
                .input("WCID",sql.NVarChar(20),body.wasteCategoryId ?? "")
                .input("WID",sql.NVarChar(sql.MAX),wasteIdsCsv)
                .input("EmpCode",sql.Int,empCode )
                .execute("PRO-WMS_SET");
            
         return NextResponse.json({
                success: true,
                data: {
                    a1: result.recordset ?? [],
                    a2: wasteResult.recordset ?? [],
                   
                },
                });

    }catch(e : any){
        return NextResponse.json({ success:false,message:e.message},{status:500});
    }
    }
