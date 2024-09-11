'use server';
import {
    S3Client,
    ListObjectsV2Command,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl} from "@aws-sdk/s3-request-presigner";



const Bucket = process.env.S3_BUCKET_NAME as string;
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS as string,
    },
  });

export async function GetBucketContents() {
    const command = new ListObjectsV2Command(({ Bucket }));
    const response = await s3.send(command);
    return response.Contents;
}
  
export async function getFile(key: string) {
    const command = new GetObjectCommand({ Bucket: Bucket, Key: key });
    return await getSignedUrl(s3, command, { expiresIn: 3600 });
  };
  

export async function uploadFile(key: string, body: string) {
    const command = new PutObjectCommand(({ Bucket, Key: key, Body: body }));
    const response = await s3.send(command);
    return response;
}

