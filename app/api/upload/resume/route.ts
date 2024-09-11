import { NextRequest, NextResponse } from "next/server";
import {
    S3Client,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { db } from "@/db/index";
import { user_Attatchments } from "@/db/schema/member_management";
import { auth } from "@/auth";
import { Session } from "next-auth";


const Bucket = process.env.S3_BUCKET_NAME as string;
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS as string,
    },
});
  
export async function POST(request: NextRequest) {
    const session: Session | null = await auth();
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) {
        return NextResponse.json({ error: "Invalid file upload" }, { status: 400 });
    }

    const key = `resumes/${(file as File).name}`;

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
        db.insert(user_Attatchments).values({
            memberId: 1,
            description: key,
            uploadDate: new Date(),
            uploader: session?.user?.name || "",
            resume: true, 
        });
        return NextResponse.json({ message: "File uploaded successfully!" });
    } catch (error) {
        console.error("S3 upload error:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}