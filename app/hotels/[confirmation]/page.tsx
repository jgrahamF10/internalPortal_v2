"use client";
import { Button } from "@/components/ui/button";
import { getRez } from "../actions";
import React, { useState, useEffect } from "react";
import { EosIconsBubbleLoading } from "@/components/spinner";
import { useSession } from "next-auth/react";
import NotAuth from "@/components/auth/notAuth";
import RentalNoteModal from "@/components/hotel_components/newNote";
import EditHotelRezForm from "@/components/hotel_components/editHotelRez";
import { getFile } from "@/lib/aws";
import { AttachmentDelete } from "@/components/hotel_components/deleteAttachment";
import RentalAttatchment from "@/components/hotel_components/hotelAttachment";

interface HotelRez {
    params: { confirmation: string };
}

export default function MemberDetails({ params }: HotelRez) {
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
            const fetchRental: any = await getRez(params.confirmation);
            if (!fetchRental) {
                // Check for null or undefined
                setNotFound(true);
                setLoading(false);
                return;
            }
            console.log("RentalData", fetchRental);
            setData(fetchRental);

            // Ensure 'attachment' exists and is an array before processing
            const attachments = fetchRental.attachments || [];

            // Store the URLs in an object
            const urlMap: { [key: string]: string } = {};

            // Iterate over the non-resume attachments and fetch the URLs
            await Promise.all(
                attachments.map(async (attachment: any) => {
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
    }, [params.confirmation]);

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
            ["Managers", "Human Resources", "Finance"].includes(role)
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
                            {params.confirmation}
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
                    All Hotel Reservations
                </a>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">Details</span>
            </nav>

            <div className="container mx-auto py-8 px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="rounded-lg shadow-md dark:shadow-slate-700 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">
                                Hotel Reservation -{" "}
                                <span className="font-semibold text-green-700">
                                    {data?.hotelConfirmationNumber}
                                </span>
                            </h2>
                            <EditHotelRezForm
                                hotelData={data}
                                updatingUser={session?.user?.name ?? ""}
                                onNoteCreated={() => refresh()}
                            />
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">
                                Status:{" "}
                                <span
                                    className={
                                        data?.verified === false
                                            ? "text-orange-500 dark:text-orange-400" // Red for canceled
                                            : data?.dropOffMileage === 0
                                            ? "text-green-700"
                                            : "text-red-500 dark:text-red-400"
                                    }
                                >
                                    {data?.canceled === true
                                        ? "Canceled"
                                        : data?.verified === false
                                        ? "Unverified"
                                        : data?.verified === true
                                        ? "Verified"
                                        : "Active"}
                                </span>
                            </h3>
                            <h3 className="block text-lg font-bold pr-[11.3rem]">
                                Final Charges:{" "}
                                <span>${data?.finalcharges}</span>
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="block text-sm font-bold">
                                Technician:{" "}
                                <span className="font-medium underline">
                                    {data?.memberID?.firstname}{" "}
                                    {data?.memberID?.lastname}
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
                                    {data?.hotelConfirmationNumber}
                                </span>
                            </div>
                            <div className="block text-sm font-bold">
                                Check In Date:{" "}
                                <span className="font-medium underline">
                                    {data?.arrivalDate}
                                </span>
                            </div>
                            <div className="block text-sm font-bold">
                                Check Out Date:{" "}
                                <span className="font-medium underline">
                                    {data?.departureDate}
                                </span>
                            </div>

                            <div className="block text-sm font-bold">
                                Hotel Location:{" "}
                                <span className="font-medium underline">
                                    {data?.hotelCity},{data?.hotelState}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg shadow-md dark:shadow-slate-700 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold mb-4 underline">
                                Additional Info
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="block text-md font-bold">
                                Hotel Chain:{" "}
                                <span className="font-medium capitalize">
                                    {data?.hotelChain.hotelName}
                                </span>
                            </div>
                            <div className="block text-md font-bold">
                                Canceled:{" "}
                                <span className="font-medium capitalize">
                                    {data?.canceled === true ? "Yes" : "No"}
                                </span>
                            </div>
                            <div className="block text-md font-bold">
                                Archived:{" "}
                                <span className="font-medium capitalize">
                                    {data?.archived === true ? "Yes" : "No"}
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
                                {data.hotelNotes.map((note: any) => (
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

                        <RentalAttatchment
                            params={{
                                rental: data.id,
                                uploader: session?.user?.name ?? "",
                                fileSuffix: `-${data?.rentalAgreement}-${data?.memberID?.firstname}-${data?.memberID?.lastname}`,
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
                                {data?.attachments.map((attachment: any) => (
                                    <tr
                                        className="border-b border-gray-200 dark:border-gray-700"
                                        key={attachment.id}
                                    >
                                        <td className="px-4 py-2 text-sm">
                                            <a
                                                href={
                                                    urls[
                                                        attachment.description
                                                    ] || "#"
                                                }
                                                target="_blank"
                                                className={`underline hover:text-green-700 ${
                                                    urls[attachment.description]
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
                                            {/* Delete button */}
                                            <AttachmentDelete
                                                attachmentId={attachment.id}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
