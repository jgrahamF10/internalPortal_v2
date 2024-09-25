"use client";
import { useState, useEffect } from "react";
import { getFile } from "@/lib/aws";


export default function Page() {
    const fileKey = "attachments/2023_06_24_12_20_PM_pickup_2.jpg";
    const [imageUrl, setImageUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");


    useEffect(() => {
        async function fetchImage() {
          try {
              const url = await getFile(fileKey);
              console.log("url", url);
            setImageUrl(url);
          } catch (error) {
            console.error("Error loading image:", error);
          }
        }
        fetchImage();
    }, [fileKey]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0] as unknown as null); // fix casting issue here
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file first!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            //formData.append("rentalId", "1");
            //formData.append("uploader", "1");

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload file.");
            }

            setUploadStatus("File uploaded successfully!");
            console.log("Upload response:", await response.json());
        } catch (error) {
            setUploadStatus("Failed to upload file.");
            console.error("Upload error:", error);
        }
    };


      return (
        <div>
            <h2>Upload a File</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
              {uploadStatus && <p>{uploadStatus}</p>}
              <div>{imageUrl ? <img src={imageUrl} alt="S3 File" /> : <p>Loading...</p>}</div>
          </div>
          
    );
}
