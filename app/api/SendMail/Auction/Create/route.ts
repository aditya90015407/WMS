import { NextRequest, NextResponse } from "next/server";
import * as sql from "mssql";
export const dynamic = "force-dynamic";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { getServerSession } from "next-auth";
import { DateTime } from 'luxon';
import { getConnection } from "@/lib/dbConnect";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

function sanitizeInput(obj: any) {
    if (typeof obj !== "object" || obj === null) return obj;

    for (const key of Object.keys(obj)) {
        if (
            key === "__proto__" ||
            key === "constructor" ||
            key === "prototype"
        ) {
            throw new Error("Invalid input");
        }
        sanitizeInput(obj[key]);
    }
    return obj;
}

export async function POST(req: NextRequest) {
    const pool = await getConnection();

    if (!pool || !pool.connected) {
        throw new Error("DB Not Connected");
    }

    const session = await getServerSession(authOptions);
    var EmpCode = "", EmpName = ""
    if (session) {
        EmpCode = session?.user?.id || "";
        EmpName = session?.user?.username || "";
    }
    if (!session) {
        return NextResponse.json("Invalid Request")
    }

    const res = await fetch("https://jajitapps.jindalstainless.com:9234/api/Auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(
            {
                "ccmsUser": process.env.NEXT_PUBLIC_Token_CCMSUser,
                "password": process.env.NEXT_PUBLIC_Token_Password,
                "regiKey": process.env.NEXT_PUBLIC_Token_RegiKey,
                "appId": process.env.NEXT_PUBLIC_Token_AppId,
            })
    });

    const data = await res.json();

    // console.log(data)

    try {

        const body = await req.json();
        // const body = sanitizeInput(rawbody);

        // const body = await req.json();



        const IDDID = body.IDDID
        const VID = body.VID
        const AuctionDate = body.AuctionDate
        const Waste = body.Waste
        const Quantity = body.TotalQty
        const MUnit = body.MUnit

        // console.log(body)
        // console.log(EmpCode, EmpName)
        // if (SegLeadEmpCode) return NextResponse.json("No Employee Code")

        const getAuctioneerRes = await pool
            .request()
            .input("FLAG", "GetMailofAuctioneer")
            .execute("PRO-WMS_GET")

        const auctioneer = await getAuctioneerRes.recordset

        const auctioneerMail = auctioneer.map((el) => el.EMAIL).join(",")
        const ccEmail = auctioneerMail

        // console.log(disposers, disposerMails, toEmail)


        const getVendorRes = await pool
            .request()
            .input("FLAG", "GetMailofVendor")
            .input("ID", VID)
            .execute("PRO-WMS_GET")

        const vendorData = await getVendorRes.recordset
        const vendorName = vendorData[0].NAME
        const vendorEmail = vendorData[0].EMAIL
        const toEmail = vendorEmail

        // console.log(vendorData)


        const now = new Date();
        const generatedOn = DateTime.now()
            .setZone('Asia/Kolkata')
            .toFormat('dd/MM/yyyy HH:mm');


        const mailBody = `
        <p>Dear ${vendorName},</p>

        <p>You have been invited to participate in an Auction.</p>

        <p><strong>Auction Details:</strong></p>
        <ul>
          <li>ID : ${IDDID}</li>
          <li>Auction Date : ${AuctionDate}</li>
          <li>Waste : ${Waste}</li>
          <li>Quantity : ${Quantity} ${MUnit}</li>
        </ul>

        <p>Please log in to the Waste Management System and participate in the Auction by filling all the required details.</p>
        <a href="https://jslaisrv01.jindalstainless.com:4433"> WMS </a>


        <p>If you need any clarification, feel free to reach out to the Auctioneer.</p>

        <p>Thank you for your prompt attention.</p>

        <p>
        Regards,<br/>
        WMS Team<br/>
        Jindal Stainless Limited
        `

        const sendMail = await fetch(`https://jajitapps.jindalstainless.com:9234/api/AutoEmail/InstantEmailSend`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${data.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "subject": `WMS : New Auction Invitation_Action Required_${Waste}`,
                "emailBody": mailBody,
                "fromEmail": "no-reply@jindalstainless.com",
                "fromName": "WMS",
                "toEmail": toEmail,
                "ccEmail": ccEmail,
                "bccEmail": "aditya_mishra@jindalstainless.com,abhishek.silawat@jindalstainless.com"
            })
        });
        // console.log(await response)
        const mailSent = await sendMail.json()
        // console.log(mailSent)
        return NextResponse.json(mailSent)

        // return new Response(JSON.stringify(result.recordset), { status: 200 });

    }
    catch (err) {
        return NextResponse.json(
            { error: "Bad request" },
            { status: 400 }
        );
    }
} 