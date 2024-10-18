import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/db/index";
import { attachments } from "@/db/schema/tracker_db";

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
    //console.log("formData", formData);

    let aType = ""; // Initialize outside the if statement
    let keyPrefix = ""; // Initialize outside the if statement

    const attachmentType = formData.get("AttachmentType");
    if (attachmentType === "Rental") {
        aType = "Rental";
        keyPrefix = `rentalAttachments/`;
    } else if (attachmentType === "Flight") {
        aType = "Flight";
        keyPrefix = `flightAttachments/`;
    } else if (attachmentType === "Hotel") {
        aType = "Hotel";
        keyPrefix = `hotelAttachments/`;
    }

    const parentId = formData.get("parentId");
    const uploader = formData.get("uploader");
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
        return NextResponse.json(
            { error: "Invalid file upload" },
            { status: 400 }
        );
    }

    const fileName = file.name;
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));
    const key = `${keyPrefix}${formData.get("description")}${fileExtension}`;

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
        const rentalIdNumber = parentId
            ? parseInt(parentId.toString(), 10)
            : 0; // Provide a default value (0) when parentId is undefined
        await db.insert(attachments).values({
            attachmentType: aType as "Rental" | "Flight" | "Hotel",
            parentId: rentalIdNumber,
            description: key,
            uploadDate: new Date(),
            uploader: uploader?.toString() ?? "",
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
