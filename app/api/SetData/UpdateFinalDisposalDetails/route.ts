import {getConnection} from "@/lib/dbConnect";
import {getServerSession} from "next-auth";
import {NextRequest, NextResponse} from "next/server";
import sql from "mssql";

export async function POST(req: NextRequest) {
     try{

          const pool =await getConnection();

            if (!pool || !pool.connected) {
            throw new Error("Could Not Connect to DataBase")
            }


    const body =await req.json();
     console.log(body,"BBBB")
    // console.log(body.payload)
    const {ID,
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
        TotalQty,
        AID,
        PhysicalState,

       
    }=body;
      
    // const FDDID=body;
    

     console.log(ID,"ID")
     console.log(TransporterName,"TN")

    if(!ID) return NextResponse.json("FDDID is required");

    //  console.log(ID,"ID2")
    
  
     const result = await pool
           .request()
           .input("FLAG", sql.VarChar, "UpdateFinalDisposalDetails")
           
           .input("FDDID", sql.Int, ID)
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
           .input("TotalQty",sql.Int,TotalQty??"")
           .input("AID",sql.Int,AID??"")
        //    .input("PhysicalState",sql.VarChar,"")
        //    .input("MUnit",sql.NVarChar,MUnit?? "")
           .execute("PRO-WMS_SET");


           console.log(result,"RRRRR");
            return NextResponse.json(
             {
                    success: true,
                    data: result.recordset,
                    message:
                    result.recordset?.[0]?.STATUS ||
                    "Updated Successfully",
                },
                { status: 200 }
                );


        } catch (error: any) {

    console.error(error);

    // VERY IMPORTANT
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}