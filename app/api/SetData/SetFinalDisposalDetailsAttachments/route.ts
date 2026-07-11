import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {

    try {

        const pool = await getConnection();

        if (!pool || !pool.connected) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Database connection failed",
                },
                { status: 500 }
            );
        }

        const session =
            await getServerSession(authOptions);

        const empCode = String(
            session?.user?.id ?? ""
        ).trim();

        if (!empCode) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Session not found",
                },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        // console.log(formData, "ffff")
        // const finalPartyDocs = formData.getAll("finalPartyDoc{i}");

        // console.log("fffffff",finalPartyDocs);
        const fddid = String(
            formData.get("FDDID") ?? ""
        ).trim();

        if (!fddid) {

            return NextResponse.json(
                {
                    success: false,
                    message: "FDDID is required",
                },
                { status: 400 }
            );
        }

        // Get files
        const salePoSoDoc =
            formData.get("salePoSoDoc");

        const finalPartyDoc1 = formData.get("finalPartyDoc1");
        const finalPartyDoc2 = formData.get("finalPartyDoc2");
        const finalPartyDoc3 = formData.get("finalPartyDoc3");
        const finalPartyDoc4 = formData.get("finalPartyDoc4");
        const finalPartyDoc5 = formData.get("finalPartyDoc5");
        const documentProof = formData.get("documentProof");


        // console.log("tttttttt", finalPartyDoc1, finalPartyDoc2, finalPartyDoc3, finalPartyDoc4, finalPartyDoc5, documentProof)
        // console.log(finalPartyDoc,"ppppppppp")
        // for (const file of finalPartyDocs) {
        // if (file instanceof File) {
        // console.log("File Name:", file.name);
        // console.log("File Size:", file.size);
        // console.log("File Type:", file.type);

        // // const bytes = await file.arrayBuffer();
        // // const buffer = Buffer.from(bytes);

        // // save file here
        //   }
        // }

        // Create folder
        const saveDir = path.join(
            process.cwd(),
            "Attachments"
        );

        if (!fs.existsSync(saveDir)) {

            fs.mkdirSync(saveDir, {
                recursive: true,
            });
        }

        // Save file function
        const saveFile = async (
            file: FormDataEntryValue | null
        ) => {

            if (
                !file ||
                typeof file === "string"
            ) {
                return "";
            }

            const uploadedFile =
                file as File;

            const uniqueName =
                `${Date.now()}-${uploadedFile.name}`;

            const filePath = path.join(
                saveDir,
                uniqueName
            );

            const buffer = Buffer.from(
                await uploadedFile.arrayBuffer()
            );

            fs.writeFileSync(
                filePath,
                buffer
            );

            return uniqueName;
        };

        // Save files
        const salePoSoDocName =
            await saveFile(salePoSoDoc);

        const finalPartyDoc1Name =
            await saveFile(finalPartyDoc1);

        const finalPartyDoc2Name =
            await saveFile(finalPartyDoc2);

        const finalPartyDoc3Name =
            await saveFile(finalPartyDoc3);

        const finalPartyDoc4Name =
            await saveFile(finalPartyDoc4);

        const finalPartyDoc5Name =
            await saveFile(finalPartyDoc5);

        const documentProofName =
            await saveFile(documentProof);

        // console.log({
        //     salePoSoDocName,
        //     finalPartyDoc1Name,
        //     finalPartyDoc2Name,
        //     finalPartyDoc3Name,
        //     finalPartyDoc4Name,
        //     finalPartyDoc5Name,
        //     documentProofName
        // });

        if (documentProofName) {
            await pool
                .request()
                .input(
                    "FLAG",
                    sql.VarChar,
                    "SetFinalDisposalDetailsAttachments"
                )
                .input(
                    "FDDID",
                    sql.Int,
                    Number(fddid)
                )
                .input(
                    "EmpCode",
                    sql.VarChar,
                    empCode
                )
                .input(
                    "AttachPath",
                    sql.VarChar,
                    documentProofName
                )
                .execute("PRO-WMS_SET");


            return NextResponse.json({
                success: true,
                message:
                    "All files saved successfully",
            });

        }


        // Database Save
        await pool
            .request()
            .input(
                "FLAG",
                sql.VarChar,
                "SetFinalDisposalDetailsAttachments"
            )
            .input(
                "FDDID",
                sql.Int,
                Number(fddid)
            )
            .input(
                "EmpCode",
                sql.VarChar,
                empCode
            )
            .input(
                "AttachPath",
                sql.VarChar,
                salePoSoDocName ??
                documentProofName
            )
            .input(
                "CtoRespectiveFile",
                sql.VarChar,
                finalPartyDoc1Name
            )
            .input(
                "HwAuthorizationOspcbFile",
                sql.VarChar,
                finalPartyDoc2Name
            )
            .input(
                "HwAuthorizationSpcbFile",
                sql.VarChar,
                finalPartyDoc3Name
            )
            .input(
                "BlueBookFile",
                sql.VarChar,
                finalPartyDoc4Name
            )
            .input(
                "RegistrationCertificateFile",
                sql.VarChar,
                finalPartyDoc5Name
            )
            // .input(
            //     "AttachPath",
            //     sql.VarChar,
            //     documentProofName
            // )
            .execute("PRO-WMS_SET");

        return NextResponse.json({
            success: true,
            message:
                "All files saved successfully",
        });

    } catch (err: any) {

        console.error(err);

        return NextResponse.json(
            {
                success: false,
                message:
                    err?.message ||
                    "Server error",
            },
            { status: 500 }
        );
    }
}