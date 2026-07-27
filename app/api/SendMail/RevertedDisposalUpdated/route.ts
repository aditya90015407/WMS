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

    var EmpCode = "", EmpName = "", WMSDept = ''
    if (session) {
        EmpCode = session?.user?.id || "";
        EmpName = session?.user?.username || "";
        WMSDept = session.user.WMSDept || ""
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
        const FDDID = body.FDDID
        const IDDID = body.IDDID
        const Waste = body.Waste
        const Quantity = body.TotalQty
        const MUnit = body.MUnit
        const RefNo = body.RefNo

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


        const getEnvApproversRes = await pool
            .request()
            .input("FLAG", "GetMailofEnvironmentApprovers")
            .execute("PRO-WMS_GET")

        const disposers = await getEnvApproversRes.recordset

        const disposerMails = disposers.map((el) => el.EMAIL).join(",")
        const toEmail = disposerMails

        // console.log(disposers, disposerMails, toEmail)


        const now = new Date();
        const generatedOn = DateTime.now()
            .setZone('Asia/Kolkata')
            .toFormat('dd/MM/yyyy HH:mm');


        const mailBody = `
        <p>Dear Environment Approver,</p>

         <p>A disposal record reverted by you has been updated and is awaiting your review and approval.</p>

        <p><strong> Disposal Details:</strong></p>
        <ul>
          <li>Final Ref No. : ${RefNo}</li>
          <li>Initiated Disposal ID : ${IDDID}</li>
          <li>Waste : ${Waste}</li>
          <li>Quantity : ${Quantity} ${MUnit}</li>
          <li>Updated By : ${EmpName} (${WMSDept})</li>
          <li>Updated On : ${generatedOn}</li>
        </ul>

        <p>Please log in to the Waste Management System to review the updated disposal and take necessary action.</p>
        <a href="https://jslaisrv01.jindalstainless.com:4433"> WMS </a>



        <p>If you experience any technical difficulties accessing the portal, feel free to reach out to the Environment team.</p>

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
                "subject": `WMS : Reverted Disposal Updated_Action Required_${Waste}`,
                "emailBody": mailBody,
                "fromEmail": "no-reply@jindalstainless.com",
                "fromName": "WMS",
                "toEmail": "abhishek.silawat@jindalstainless.com",
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