import { NextRequest, NextResponse } from "next/server";
import * as sql from "mssql";
export const dynamic = "force-dynamic";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { getServerSession } from "next-auth";
import { DateTime } from 'luxon';
import { authOptions } from "../../auth/[...nextauth]/options";
import { getConnection } from "@/lib/dbConnect";

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
    var EmpCode = "", EmpName = "", WMSDept = '';
    if (session) {
        EmpCode = session?.user?.id || "";
        EmpName = session?.user?.username || "";
        WMSDept = session.user.WMSDept || ""
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


        const FDDID = body.FDDID
        const RefNo = body.RefNo
        const IDDID = body.IDDID
        const Waste = body.Waste
        const Quantity = body.TotalQty
        const MUnit = body.MUnit
        const GeneratedBy = body.GeneratedBy

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


        const getGeneratorRes = await pool
            .request()
            .input("FLAG", "EMP-DTLS-BY-CODE")
            .input("EmpCode", GeneratedBy)
            .execute("PRO-WMS_GET")

        const generator = await getGeneratorRes.recordset

        const generatorMail = generator[0].EMAIL
        const generatorName = generator[0].NAME
        const toEmail = generatorMail

        // const disposerMails = [senderMail];
        // const CCEmails = CCMails.join(",")
        // console.log(generator)




        const now = new Date();
        const approvedOn = DateTime.now()
            .setZone('Asia/Kolkata')
            .toFormat('dd/MM/yyyy HH:mm');


        const mailBodyforGenerator = `
        <p>Dear ${generatorName},</p>

        <p>The dispatch requested by you has been approved by ${EmpName}.</p>

        <p><strong>Disposal Details:</strong></p>
        <ul>
          <li>Disposal Ref No.: ${RefNo}</li>
          <li>Initiated Disposal ID : ${IDDID}</li>
          <li>Waste : ${Waste}</li>
          <li>Quantity : ${Quantity} ${MUnit}</li>
          <li>Approved By : ${EmpName} (${WMSDept})</li>
          <li>Approved On : ${approvedOn}</li>
        </ul>


        <p>Please log in to Waste Management System to download Form 10 (if applicable).</p>
        <a href="https://jslaisrv01.jindalstainless.com:4433"> WMS </a>


        <p>If you experience any technical difficulties accessing the portal, feel free to reach out to the Environment team.</p>

        <p>Thank you for your prompt attention.</p>

        <p>
        Regards,<br/>
        WMS Team<br/>
        Jindal Stainless Limited
        `


        const sendMailtoGenerator = await fetch(`https://jajitapps.jindalstainless.com:9234/api/AutoEmail/InstantEmailSend`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${data.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "subject": `WMS : Generated Disposal Record Approved_${Waste}`,
                "emailBody": mailBodyforGenerator,
                "fromEmail": "no-reply@jindalstainless.com",
                "fromName": "WMS",
                "toEmail": toEmail,
                "ccEmail": CCEmails,
                "bccEmail": "aditya_mishra@jindalstainless.com,abhishek.silawat@jindalstainless.com"
            })
        });
        // console.log(await response)
        const mailSenttoGenerator = await sendMailtoGenerator.json()
        // console.log(mailSenttoGenerator, sendMailtoGenerator)
        // console.log(mailSent)
        return NextResponse.json(mailSenttoGenerator)
        // return NextResponse.json("Ok")

        // return new Response(JSON.stringify(result.recordset), { status: 200 });

    }
    catch (err) {
        return NextResponse.json(
            { error: "Bad request" },
            { status: 400 }
        );
    }
} 