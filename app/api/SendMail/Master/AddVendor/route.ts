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

    if (!session) {
        return NextResponse.json("Invalid Request")
    }

    var EmpCode = "", EmpName = ""
    if (session) {
        EmpCode = session?.user?.id || "";
        EmpName = session?.user?.username || "";
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
        const VendorCode = body.VendorCode
        const VendorName = body.VendorName
        const VendorEmail = body.VendorEmail

        // console.log(body, VendorEmail)
        // console.log(EmpCode, EmpName)
        // if (SegLeadEmpCode) return NextResponse.json("No Employee Code")

        const getVendorRes = await pool
            .request()
            .input("FLAG", "GetVendorDetailsByVendorCode")
            .input("EmpCode", EmpCode)
            .execute("PRO-WMS_GET")

        const sender = await getVendorRes.recordset
        const senderMail = sender[0].Email
        // console.log(sender)


        const CCMails = [senderMail];
        const CCEmails = CCMails.join(",")


        const now = new Date();
        const generatedOn = DateTime.now()
            .setZone('Asia/Kolkata')
            .toFormat('dd/MM/yyyy HH:mm');


        const mailBody = `
        <p>Dear ${VendorName},</p>

        <p>You have been successfully added as a vendor to the JSL Waste Management System by ${EmpName}.</p>

        <p><strong>Profile Details:</strong></p>
        <ul>
          <li>Vendor Code : ${VendorCode}</li>
          <li>Email : ${VendorEmail}</li>
          <li>Added On : ${generatedOn}</li>
        </ul>


        <p>Please log in to the portal using your vendor code and email as credentials.</p>
        <a href="https://jslaisrv01.jindalstainless.com:4433"> WMS </a>



        <p>If you need any clarification or experience any technical difficulties accessing the portal, feel free to reach out to ${EmpName}.</p>

        <p>Thank you for your prompt attention.</p>

        <p>
        Regards,<br/>
        WMS Team<br/>
        Jindal Stainless Limited
        `

        // <p>Please log in to the Waste Management System using your vendor code as username and email as password.</p>

        const sendMail = await fetch(`https://jajitapps.jindalstainless.com:9234/api/AutoEmail/InstantEmailSend`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${data.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "subject": `WMS : Vendor Added`,
                "emailBody": mailBody,
                "fromEmail": "no-reply@jindalstainless.com",
                "fromName": "WMS",
                "toEmail": VendorEmail,
                "ccEmail": "aditya_mishra@jindalstainless.com",
                "bccEmail": "aditya_mishra@jindalstainless.com,abhishek.silawat@jindalstainless.com"
            })
        });
        // console.log(await response)
        const mailSent = await sendMail.json()
        // console.log(mailSent)
        return NextResponse.json({ mailSent })

        // return new Response(JSON.stringify(result.recordset), { status: 200 });

    }
    catch (err) {
        return NextResponse.json(
            { error: "Bad request" },
            { status: 400 }
        );
    }
} 