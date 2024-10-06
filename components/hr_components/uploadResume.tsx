"use client";
import { useState, useEffect } from "react";
import { getFile } from "@/lib/aws";
import {
    DialogTrigger,
    DialogTitle,
    DialogHeader,
    DialogFooter,
    DialogContent,
    Dialog,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ResumeUploadProps {
    params: { person: string; uploader: string };
}

export default function ResumeUpload({params}: ResumeUploadProps) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");

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
            formData.append("memberId", params.person);


            const response = await fetch("/api/upload/resume", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload file.");
            }

            setUploadStatus("File uploaded successfully!");
            console.log("Upload response:", await response.json());
            window.location.reload();
        } catch (error) {
            setUploadStatus("Failed to upload file.");
            console.error("Upload error:", error);
        }
    };

    return (
        <Dialog key="1">
            <DialogTrigger asChild>
                <Button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-800 dark:bg-green-700">
                    Upload Resume
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <div>
                    <h2>Upload a File</h2>
                    <input type="file" onChange={handleFileChange} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={handleUpload}>Submit</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
