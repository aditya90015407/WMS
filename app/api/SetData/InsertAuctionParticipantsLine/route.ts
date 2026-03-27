import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";
import { generateUniqueFileName } from "@/lib/filename"

export async function POST(req: Request) {
    try {
        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("Could not connect to Database");
        }

        const form = await req.formData();

        const apid = String(form.get("APID") || "");
        const empCode = String(form.get("EmpCode") || "");
        const remarks = String(form.get("Remarks") || "");

        if (!apid) {
            return NextResponse.json(
                { success: false, message: "APID is required" },
                { status: 400 }
            );
        }

        const ctoFile = form.get("CtoRespectiveFile") as File | null;
        const hwOspcbFile = form.get("HwAuthorizationOspcbFile") as File | null;
        const hwSpcbFile = form.get("HwAuthorizationSpcbFile") as File | null;
        const blueBookFile = form.get("BlueBookFile") as File | null;
        const regCertFile = form.get("RegistrationCertificateFile") as File | null;


        const ctoFileName = generateUniqueFileName(ctoFile?.name!);
        const hwOspcbFileName = generateUniqueFileName(hwOspcbFile?.name!);
        const hwSpcbFileName = generateUniqueFileName(hwSpcbFile?.name!);
        const blueBookFileName = generateUniqueFileName(blueBookFile?.name!);
        const regCertFileName = generateUniqueFileName(regCertFile?.name!);

        const ctoBytes = ctoFile ? Buffer.from(await ctoFile.arrayBuffer()) : null;
        const hwOspcbBytes = hwOspcbFile ? Buffer.from(await hwOspcbFile.arrayBuffer()) : null;
        const hwSpcbBytes = hwSpcbFile ? Buffer.from(await hwSpcbFile.arrayBuffer()) : null;
        const blueBookBytes = blueBookFile ? Buffer.from(await blueBookFile.arrayBuffer()) : null;
        const regCertBytes = regCertFile ? Buffer.from(await regCertFile.arrayBuffer()) : null;
        console.log("APID:", apid);
        console.log("CTO:", ctoFile?.name);
        console.log("OSPCB:", hwOspcbFile?.name);
        console.log("SPCB:", hwSpcbFile?.name);
        console.log("BlueBook:", blueBookFile?.name);
        console.log("RegCert:", regCertFile?.name);

        const result = await pool
            .request()
            .input("FLAG", sql.VarChar, "Insert-Auction-Participants-Line")
            .input("APID", sql.VarChar, apid)
            // change to VarChar if APID is string
            .input("CtoRespectiveFile", sql.VarChar, ctoFileName)
            .input("HwAuthorizationOspcbFile", sql.VarChar, hwOspcbFileName)
            .input("HwAuthorizationSpcbFile", sql.VarChar, hwSpcbFileName)
            .input("BlueBookFile", sql.VarChar, blueBookFileName)
            .input("RegistrationCertificateFile", sql.VarChar, regCertFileName)

            .input("Remarks", sql.VarChar, remarks)
            .input("EmpCode", sql.VarChar, empCode)
            .execute("PRO-WMS_SET");

        console.log("rowsAffected:", result.rowsAffected);
        console.log("recordset:", result.recordset);




        return NextResponse.json({ success: true, message: "Documents saved" });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 }
        );
    }
}
