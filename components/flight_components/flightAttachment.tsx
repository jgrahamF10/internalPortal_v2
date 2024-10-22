"use client";
import { useState, useEffect, JSX, SVGProps } from "react";
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
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface UploadProps {
    params: { flight: string; uploader: string, fileSuffix: string };
}

export default function FlightAttatchment({ params }: UploadProps) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");
    const [fileDescription, setFileDescription] = useState("");

    //console.log("params", params);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setSelectedFile(file as unknown as null); // fix casting issue here
            setFileDescription(file.name); // Set the file name as the description
        }
    };

    const handleDescriptionChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFileDescription(event.target.value);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file first!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("parentId", params.flight);
            formData.append("uploader", params.uploader);
            formData.append("AttachmentType", 'Flight');
            formData.append("description", fileDescription+params.fileSuffix);
            const response = await fetch("/api/upload/trackerAttachments", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload file.");
            }

            setUploadStatus("File uploaded successfully!");
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
                    Add Attachment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <Card className="w-full max-w-md p-6 grid gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary rounded-md p-3 flex items-center justify-center">
                            <UploadIcon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">Upload Files</h3>
                    </div>
                    <div className="text-muted-foreground">
                        Upload your files here.
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="file-upload">
                            Choose files to upload
                        </Label>
                        <Input
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="file-description">
                            File Description
                        </Label>
                        <Input
                            id="file-description"
                            type="text"
                            placeholder="Enter file description"
                            value={fileDescription}
                            onChange={handleDescriptionChange}
                        />
                    </div>
                </Card>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={handleUpload}>Submit</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
    );
}
