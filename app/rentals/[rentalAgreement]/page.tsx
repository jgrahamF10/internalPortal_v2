"use client";
import { Button } from "@/components/ui/button";
import { getRental } from "../rentalActions";
import React, { useState, useEffect } from "react";
import { EosIconsBubbleLoading } from "@/components/spinner";
import { useSession } from "next-auth/react";
import NotAuth from "@/components/auth/notAuth";
import Link from "next/link";
import ProjectApprovalModal from "@/components/hr_components/projectApproval";
import RentalNoteModal from "@/components/rental_components/newNote";
import EditProjectApproval from "@/components/hr_components/editProjectApproval";
import EditMember from "@/components/hr_components/editMember";
import ResumeUpload from "@/components/hr_components/uploadResume";
import { getFile } from "@/lib/aws";

import { AttachmentDelete } from "@/components/hr_components/deleteResume";
import MemberAttatchment from "@/components/hr_components/memberAttachment";


interface RentalAgreement {
    params: { rentalAgreement: string };
}

type SearchParamProps = {
    searchParams: Record<string, string> | null | undefined;
};

export default function MemberDetails({ params }: RentalAgreement) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [resume, setResume] = useState<any>(null);
    const [auditLogVisible, setAuditLogVisible] = useState<boolean>(false);
    const [intakeStatus, setIntakeStatus] = useState<any>(null);
    const { data: session } = useSession();
    const [errorStatus, setErrorStatus] = useState<boolean>(false);
    const [resumeUrl, setResumeUrl] = useState<string>("");
    const [urls, setUrls] = useState<{ [key: string]: string }>({}); // Map of attachment descriptions to URLs

    // console.log("Rental Agreement", params.rentalAgreement);

    useEffect(() => {
        async function fetchData() {
            const fetchRental: any = await getRental(params.rentalAgreement);
            if (!fetchRental) {
                
                // Check for null or undefined
                setNotFound(true);
                setLoading(false);
                return;
            }
            console.log("RentalData", fetchRental)
            setData(fetchRental);

            // Ensure 'attachment' exists and is an array before processing
            const attachments = fetchRental.attachment || [];

            // Filter out resumes
            const resumeDescriptions = attachments
                .filter((item: any) => item.resume === true)
                .map((item: any) => item.description);

            // Set the resume descriptions
            setResume(resumeDescriptions);

            // Now fetch URLs for non-resume attachments asynchronously
            const nonResumeAttachments = attachments.filter(
                (attachment: any) => attachment.resume === false
            );

            // Store the URLs in an object
            const urlMap: { [key: string]: string } = {};

            // Iterate over the non-resume attachments and fetch the URLs
            await Promise.all(
                nonResumeAttachments.map(async (attachment: any) => {
                    try {
                        const url = await getFile(attachment.description);
                        urlMap[attachment.description] = url; // Map the URL to the description
                    } catch (error) {
                        console.error(
                            `Error fetching file URL for ${attachment.description}:`,
                            error
                        );
                    }
                })
            );

            // Update state with the fetched URLs
            setUrls(urlMap);

            setLoading(false);
        }

        fetchData();
    }, [params.rentalAgreement]);

    const errorStatusChange = (estatus: boolean) => {
        setErrorStatus(estatus);
        if (estatus) {
            setErrorStatus(true);
        } else {
            window.location.reload();
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <EosIconsBubbleLoading />
            </div>
        );
    }

    if (
        !session?.roles?.some((role) =>
            ["Managers", "Human Resources"].includes(role)
        )
    ) {
        return <NotAuth />;
    }

    if (notFound) {
        return (
            <div className="container mx-auto py-8 px-4 md:px-6">
                <div className="bg-white rounded-lg  p-6 dark:bg-gray-950">
                    <h2 className="text-2xl font-bold">
                        Rental Not Found -{" "}
                        <span className="text-red-600">
                            {params.rentalAgreement}
                        </span>
                    </h2>
                </div>
            </div>
        );
    }

    const refresh = () => {
        window.location.reload();
    };

    return (
        <div className="p-2">
            <nav className="flex justify-end space-x-2">
                <a href="/rentals" className="text-muted-foreground">
                    All Rentals
                </a>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">Details</span>
            </nav>

            <div className="container mx-auto py-8 px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="rounded-lg shadow-md dark:shadow-slate-700 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">
                                <span className=" underline">
                                    Rental Agreement -  {data?.rentalAgreement}
                                </span>
                            </h2>
                            <EditMember
                                params={{
                                    person: params.rentalAgreement,
                                    editingUser: session?.user?.name ?? "",
                                }}
                                onNoteCreated={() => refresh()}
                            />
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">
                                Status:{" "}
                                <span
                                    className={
                                        data?.dropOffMileage === 0
                                            ? "text-green-700"
                                            : data?.verified != 0
                                            ? "text-red-500 dark:text-red-400"
                                            : ""
                                    }
                                >
                                    {data?.dropOffMileage === 0? "Active" : "Returned"}
                                </span>
                            </h3>
                            <h3 className="block text-lg font-bold pr-[11.3rem]">
                                Final Charges:{" "}
                                <span>
                                    ${data?.finalCharges + data.tolls}
                                </span>
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="block text-sm font-bold">
                                Driver:{" "}
                                <span className="font-medium underline">
                                    {data?.memberID?.firstname} {data?.memberID?.lastname}
                                </span>
                            </div>
                            <div className="block text-sm font-bold ">
                                Project:{" "}
                                <span className="font-medium underline">
                                    {data?.project?.projectName}
                                </span>
                            </div>
                            <div className="block text-sm font-bold">
                                Reservation #:{" "}
                                <span className="font-medium capitalize">
                                    {data?.reservation}
                                </span>
                            </div>
                            <div className="block text-sm font-bold">
                                Pick Up Date:{" "}
                                <span className="font-medium underline">
                                    {data?.pickUpDate}
                                </span>
                            </div>
                            <div className="block text-sm font-bold">
                                Pick Up Location:{" "}
                                <span className="font-medium underline">
                                    {data?.pickUpLocation}
                                </span>
                            </div>

                            <div className="block text-sm font-bold">
                                Return Location:{" "}
                                <span className="font-medium underline">
                                    {data?.returnLocation}
                                </span>
                            </div>
                            <div className="block text-sm font-bold">
                                Due Date:{" "}
                                <span className="font-medium capitalize">
                                    {data?.dueDate}
                                </span>
                            </div>
                            <div className="block text-sm font-bold">
                                Actual Return Date:{" "}
                                <span className="font-medium capitalize">
                                    {data?.returnDate}
                                </span>
                            </div>
                           
                            
                        </div>
                    </div>
                    <div className="rounded-lg shadow-md dark:shadow-slate-700 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold mb-4 underline">
                                Vehicle Info
                            </h2>
                        </div>
                        <div className="overflow-x-auto"></div>
                        <div className="grid grid-cols-1 gap-4">
                        <div className="block text-md font-bold">
                                Vendor:{" "}
                                <span className="font-medium capitalize">
                                    {data?.vendors}
                                </span>
                            </div>
                        <div className="block text-md font-bold">
                                Vehicle Type:{" "}
                                <span className="font-medium capitalize">
                                    {data?.vehicleType}
                                </span>
                            </div>
                           
                            <div className="block text-md font-bold ">
                                Vin Number:{" "}
                                <span>
                                    {data?.vehicleVIN ? data.vehicleVIN : "N/A"}
                                </span>
                            </div>
                        
                            <div className="block text-md font-bold">
                                License Plate:{" "}
                                <span className="font-medium capitalize">
                                    {data?.LicensePlate ? data.LicensePlate : "N/A"}
                                </span>
                            </div>
                            <div className="flex items-center text-md font-bold">
                                {/* Resume label */}
                                Tolls:{" "}
                               <span className="font-medium underline pl-2">
                                   ${data?.tolls ? data.tolls : "0"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className=" rounded-lg shadow-md dark:shadow-slate-700 p-6 mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold mb-4">Notes</h2>

                        <RentalNoteModal
                            params={{
                                rentalId: data.id,
                                uploader: session?.user?.name ?? "",
                            }}
                            onNoteCreated={() => refresh()}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-tableBoarder">
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">
                                        Note
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">
                                        Created By
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">
                                        Created Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.rentalNotes.map((note: any) => (
                                    <tr
                                        className="border-b border-gray-200 dark:border-gray-700"
                                        key={note.id}
                                    >
                                        <td className="px-4 py-2 text-sm">
                                            {note.note}
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            {note.noteAuthor}
                                        </td>

                                        <td className="px-4 py-2 text-sm">
                                            {note.createdDate.toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className=" rounded-lg shadow-md dark:shadow-slate-700 p-6 mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold mb-4">Attachments</h2>

                        <MemberAttatchment
                            params={{
                                person: data.id,
                                uploader: session?.user?.name ?? "",
                            }}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-tableBoarder">
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">
                                        Description
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">
                                        Uploaded By
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">
                                        Upload Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">
                                        Delete
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* 
                                {member?.attachment
                                    .filter(
                                        (attachment: any) =>
                                            attachment.resume === false
                                    )
                                    .map((attachment: any) => (
                                        <tr
                                            className="border-b border-gray-200 dark:border-gray-700"
                                            key={attachment.id}
                                        >
                                            <td className="px-4 py-2 text-sm">
                                                <a
                                                    href={
                                                        urls[
                                                            attachment
                                                                .description
                                                        ] || "#"
                                                    }
                                                    target="_blank"
                                                    className={`underline hover:text-green-700 ${
                                                        urls[
                                                            attachment
                                                                .description
                                                        ]
                                                            ? ""
                                                            : "text-gray-400" // Gray out if the URL hasn't loaded yet
                                                    }`}
                                                >
                                                    {attachment.description.replace(
                                                        /userAttachments\//i,
                                                        ""
                                                    )}
                                                </a>
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {attachment.uploader}
                                            </td>

                                            <td className="px-4 py-2 text-sm">
                                                {attachment.uploadDate.toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {/* Delete button 
                                                <AttachmentDelete
                                                    attachmentId={attachment.id}
                                                />
                                            </td>
                                        </tr>
                                    ))}*/}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
