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
    const session = await getServerSession(authOptions);

    if (!session) {
        await signOut({ callbackUrl: '/sign-in', redirect: true })
        return NextResponse.json("Invalid Request")
    }

    var EmpCode = "", EmpName = "", WMSUnit = '';
    if (session) {
        EmpCode = session?.user?.id || "";
        EmpName = session?.user?.username || "";
        WMSUnit = session.user.WMSUnit || "";
    }

    const pool = await getConnection();

    if (!pool || !pool.connected) {
        throw new Error("DB Not Connected");
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
        const Waste = body.Waste
        const Quantity = body.TotalQty
        const MUID = body.MUID

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
        const senderName = sender[0].NAME
        // console.log(sender)


        const CCMails = [senderMail];
        const CCEmails = CCMails.join(",")


        const getEnvApproversRes = await pool
            .request()
            .input("FLAG", "GetMailofEnvironmentApprovers")
            .execute("PRO-WMS_GET")

        const EnvApprovers = await getEnvApproversRes.recordset

        const EnvApproversEmails = EnvApprovers.map((el) => el.EMAIL).join(",")
        const toEmail = EnvApproversEmails

        // console.log(disposers, disposerMails, toEmail)


        const now = new Date();
        const generatedOn = DateTime.now()
            .setZone('Asia/Kolkata')
            .toFormat('dd/MM/yyyy HH:mm');


        const mailBody = `
        <p>Dear ${senderName},</p>

        <p>A new Internal disposal has been initiated.</p>

        <p><strong>Initiated Disposal Details:</strong></p>
        <ul>
          <li>Disposal ID : ${IDDID}</li>
          <li>Generating Unit : ${WMSUnit}</li>
          <li>Waste : ${Waste}</li>
          <li>Quantity : ${Quantity}${MUID == 2 ? " KG" : " No."}</li>
          <li>Initiated By : ${EmpName}</li>
          <li>Initiated On : ${generatedOn}</li>
        </ul>
        

        <p>Please log in to the Waste Management System and navigate to <strong> Dispose </strong> menu . Complete the required details before each dispatch.</p>
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
                "subject": `WMS : New Disposal Initiated_Action Required_${Waste}`,
                "emailBody": mailBody,
                "fromEmail": "no-reply@jindalstainless.com",
                "fromName": "WMS",
                "toEmail": CCEmails, // because here sending to disposal initiator only
                "ccEmail": toEmail,  // sending to env 
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