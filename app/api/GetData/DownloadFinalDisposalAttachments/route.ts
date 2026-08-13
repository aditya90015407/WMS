import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { authOptions } from "../../auth/[...nextauth]/options";
import { signOut } from "next-auth/react";

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            await signOut({ callbackUrl: '/sign-in', redirect: true })
            return NextResponse.json("Invalid Request")
        }

        var EmpCode = "", EmpName = ""
        if (session) {
            EmpCode = session?.user?.id || "";
            EmpName = session?.user?.username || "";
        }

        const body = await req.json()
        const Attachments = body.Attachments

        // console.log(body)

        if (!Attachments || Attachments.length === 0) {
            return NextResponse.json(
                { error: "File Not found" },
                { status: 404 }
            )
        }

        const baseDir = path.join(process.cwd(), "Attachments")

        const files: { name: string; url: string }[] = []

        for (const attachment of Attachments) {
            const relativePath = attachment.AttachPath
            // console.log(relativePath)

            if (relativePath.includes("..")) {
                throw new Error("Invalid file path")
            }

            const fullPath = path.join(baseDir, relativePath)

            const fileName = path.basename(fullPath)

            files.push({
                name: fileName,
                url: `/Attachments/${relativePath.replace(/\\/g, "/")}`,
            })
        }

        return NextResponse.json({
            success: true,
            files: files.map(f => ({
                name: f.name,
                id: f.name,
            })),
        })
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Request failed" },
            { status: 400 }
        )
    }
}