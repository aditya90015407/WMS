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
import { signOut } from "next-auth/react";

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
        await signOut({ callbackUrl: '/sign-in', redirect: true })
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
        const VendorCode = body.VendorCode
        const VendorName = body.VendorName
        const Acceptance = body.Acceptance
        const Remarks = body.Remarks

        // console.log(body)
        // console.log(EmpCode, EmpName)
        // if (SegLeadEmpCode) return NextResponse.json("No Employee Code")


        const getSenderMail = await pool
            .request()
            .input("FLAG", "EMP-DTLS-BY-CODE")
            .input("EmpCode", EmpCode)
            .execute("PRO-WMS_GET")

        const sender = await getSenderMail.recordset
        const senderMail = sender[0].EMAIL
        // console.log(sender)


        const CCMails = [senderMail];
        const CCEmails = CCMails.join(",")

        const getVendorRes = await pool
            .request()
            .input("FLAG", "GetVendorDetailsByVendorCode")
            .input("EmpCode", VendorCode)
            .execute("PRO-WMS_GET")

        const vendorData = await getVendorRes.recordset
        const vendorName = vendorData[0].Name
        const vendorEmail = vendorData[0].Email

        // console.log(vendorData)


        const getAuctioneerRes = await pool
            .request()
            .input("FLAG", "GetMailofAuctioneer")
            .execute("PRO-WMS_GET")

        const auctioneer = await getAuctioneerRes.recordset

        const auctioneerMails = auctioneer[0].EMAIL
        const auctioneerName = auctioneer[0].NAME
        const toEmail = auctioneerMails

        // console.log(auctioneer, auctioneerMails, auctioneerName)


        const now = new Date();
        const generatedOn = DateTime.now()
            .setZone('Asia/Kolkata')
            .toFormat('dd/MM/yyyy HH:mm');


        const mailBodyonRejection = `
        <p>Dear ${VendorName},</p>

        <p>Your auction application has been rejected. You will no longer be considered for this auction.</p>

        <p><strong>Auction Details:</strong></p>
        <ul>
          <li>Auction ID : ${IDDID}</li>
          <li>Rejected On : ${generatedOn}</li>
          <li>Remarks : ${Remarks}</li>
        </ul>

        <p>Please log in to the Waste Management System to reapply.</p>
        <a href="https://jslaisrv01.jindalstainless.com:4433"> WMS </a> 


        <p>Thank you for your prompt attention.</p>

        <p>
        Regards,<br/>
        WMS Team<br/>
        Jindal Stainless Limited
        `


        const mailBodyonApprovaltoVendor = `
        <p>Dear ${VendorName},</p>

        <p>Your application for Auction ${IDDID} has been approved and you are now eligible to participate in the Auction. </p>

        <p><strong>Auction Details:</strong></p>
        <ul>
          <li>Auction ID : ${IDDID}</li>
          <li>Approved On : ${generatedOn}</li>
        </ul>


        <a href="https://jslaisrv01.jindalstainless.com:4433"> WMS </a> 


        <p>Thank you for your prompt attention.</p>

        <p>
        Regards,<br/>
        WMS Team<br/>
        Jindal Stainless Limited
        `



        const mailBodyonApprovaltoAuctioneer = `
        <p>Dear ${auctioneerName},</p>

        <p>An application submitted by ${VendorName} for the Auction ${IDDID} has been approved.</p>

        <p><strong>Auction Details:</strong></p>
        <ul>
          <li>Auction ID : ${IDDID}</li>
          <li>Submitted By : ${VendorName} (${VendorCode})</li>
          <li>Approved On : ${generatedOn}</li>
        </ul>

       
        <a href="https://jslaisrv01.jindalstainless.com:4433"> WMS </a> 


        <p>Thank you for your prompt attention.</p>

        <p>
        Regards,<br/>
        WMS Team<br/>
        Jindal Stainless Limited
        `

        if (Acceptance == 1) {
            const sendMailtoAuctioneer = await fetch(`https://jajitapps.jindalstainless.com:9234/api/AutoEmail/InstantEmailSend`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "subject": `WMS : Vendor Application Approved_${IDDID}`,
                    "emailBody": mailBodyonApprovaltoAuctioneer,
                    "fromEmail": "no-reply@jindalstainless.com",
                    "fromName": "WMS",
                    "toEmail": toEmail,
                    "ccEmail": toEmail,
                    "bccEmail": "aditya_mishra@jindalstainless.com,abhishek.silawat@jindalstainless.com"
                })
            });

            // console.log(await response)
            const mailSenttoAuctioneer = await sendMailtoAuctioneer.json()
            // console.log(mailSent)


            const sendMailtoVendor = await fetch(`https://jajitapps.jindalstainless.com:9234/api/AutoEmail/InstantEmailSend`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "subject": `WMS : Auction Application Approved_${IDDID}`,
                    "emailBody": mailBodyonApprovaltoVendor,
                    "fromEmail": "no-reply@jindalstainless.com",
                    "fromName": "WMS",
                    "toEmail": vendorEmail,
                    "ccEmail": vendorEmail,
                    "bccEmail": "aditya_mishra@jindalstainless.com,abhishek.silawat@jindalstainless.com"
                })
            });

            // console.log(await response)
            const mailSenttoVendor = await sendMailtoVendor.json()

            return NextResponse.json(mailSenttoAuctioneer)
        }



        else if (Acceptance == 2) {
            const sendMail = await fetch(`https://jajitapps.jindalstainless.com:9234/api/AutoEmail/InstantEmailSend`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "subject": `WMS : Auction Application Rejected_${IDDID}`,
                    "emailBody": mailBodyonRejection,
                    "fromEmail": "no-reply@jindalstainless.com",
                    "fromName": "WMS",
                    "toEmail": vendorEmail,
                    "ccEmail": vendorEmail,
                    "bccEmail": "aditya_mishra@jindalstainless.com,abhishek.silawat@jindalstainless.com"
                })
            });

            // console.log(await response)
            const mailSent = await sendMail.json()
            // console.log(mailSent)
            return NextResponse.json(mailSent)
        }

        // return new Response(JSON.stringify(result.recordset), { status: 200 });

    }
    catch (err) {
        return NextResponse.json(
            { error: "Bad request" },
            { status: 400 }
        );
    }
} 