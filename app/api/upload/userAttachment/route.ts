import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/db/index";
import { user_Attachments } from "@/db/schema/member_management";

const Bucket = process.env.S3_BUCKET_NAME as string;
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS as string,
    },
});

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    console.log("formData", formData);
    const memberId = formData.get('memberId');
    const uploader = formData.get('uploader');
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
        return NextResponse.json(
            { error: "Invalid file upload" },
            { status: 400 }
        );
    }

    const key = `userAttachments/${(file as File).name}`;

    // Convert Blob/File to ArrayBuffer and then to Buffer
    const arrayBuffer = await (file as Blob).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
        Bucket: Bucket,
        Key: key,
        Body: buffer, // Use Buffer instead of File
        ContentType: file.type, // Optional: Set content type
    });

    try {
        await s3.send(command);
        const memberIdNumber = memberId
            ? parseInt(memberId.toString(), 10)
            : null;
        if (memberIdNumber === null || isNaN(memberIdNumber)) {
            throw new Error("Invalid memberId");
        }
        await db.insert(user_Attachments).values({
            memberId: memberIdNumber,
            description: key,
            uploadDate: new Date(),
            uploader: uploader ? uploader.toString() : "",
            resume: false,
        });
        console.log("file uploaded successfully!");
        return NextResponse.json({ message: "File uploaded successfully!" });
    } catch (error) {
        console.error("S3 upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
