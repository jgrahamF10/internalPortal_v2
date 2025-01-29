"use client";
import { Button } from "@/components/ui/button";
import { getFlight } from "../actions";
import React, { useState, useEffect } from "react";
import { EosIconsBubbleLoading } from "@/components/spinner";
import { useSession } from "next-auth/react";
import NotAuth from "@/components/auth/notAuth";
import FlightNoteModal from "@/components/flight_components/newNote";
import EditFlightForm from "@/components/flight_components/editFlight";
import { getFile } from "@/lib/aws";
import { AttachmentDelete } from "@/components/flight_components/deleteAttachment";
import FlightAttatchment from "@/components/flight_components/flightAttachment";
import NewCreditForm from "@/components/flight_components/newCredit";
import NoteDelete from "@/components/deleteNote";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import ApplyCredit from "../applycredits";

interface FlightConfirm {
    params: { confirmation: string };
}

export default function MemberDetails({ params }: FlightConfirm) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [availableCredit, setAvailableCredit] = useState<number>(0);
    const [auditLogVisible, setAuditLogVisible] = useState<boolean>(false);
    const { data: session } = useSession();
    const [errorStatus, setErrorStatus] = useState<boolean>(false);
    const [resumeUrl, setResumeUrl] = useState<string>("");
    const [urls, setUrls] = useState<{ [key: string]: string }>({}); // Map of attachment descriptions to URLs

    //console.log("Rental Agreement", params.confirmation);

    useEffect(() => {
        async function fetchData() {
            const fetchFlight: any = await getFlight(params.confirmation);
            if (!fetchFlight) {
                // Check for null or undefined
                setNotFound(true);
                setLoading(false);
                return;
            }
            console.log("FlightData", fetchFlight);
            setData(fetchFlight);
            const credits = fetchFlight.members.memberFlightCredit || [];
            console.log("Credits", credits);
            const totalAvailableCredit = credits.reduce(
                (total: number, item: { amount: number; airlinesID: number }) => {
                    // Only add amount if airlinesID is 12
                    if (item.airlinesID === fetchFlight.airlinesID) {
                        return total + item.amount;
                    }
                    return total; // If not airlinesID 12, just return the current total without adding
                },
                0
            );
            const creditUsage =
                fetchFlight.credits[0]?.creditUsage.reduce(
                    (total: number, item: { amount: number }) => {
                        const amount = item.amount;
                        return total + amount;
                    },
                    0
                ) || 0;
            //console.log("total credits", totalAvailableCredit, creditUsage);
            setAvailableCredit(Number((totalAvailableCredit - creditUsage).toFixed(2)));

            // Ensure 'attachment' exists and is an array before processing
            const attachments = fetchFlight.attachments || [];

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
                        Flight Not Found -{" "}
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
                <a href="/flights" className="text-muted-foreground">
                    All Flights
                </a>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">Details</span>
            </nav>

            <div className="container mx-auto py-8 px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="rounded-lg shadow-md dark:shadow-slate-700 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">
                                Flight Confirmation -{" "}
                                <span className="font-semibold text-green-700">
                                    {data?.flightConfirmationNumber}
                                </span>
                            </h2>

                            <EditFlightForm
                                flightData={data}
                                updatingUser={session?.user?.name ?? ""}
                                onNoteCreated={() => refresh()}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <h3 className="text-lg font-bold">
                                Status:{" "}
                                <span
                                    className={
                                        data?.verified === false
                                            ? "text-orange-500 dark:text-orange-400" // Red for canceled
                                            : data?.verified !== false
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
                            <h3 className="block text-lg font-bold ">
                                Final Charges: <span>${data?.totalCost}</span>
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="block text-md font-bold">
                                Technician:{" "}
                                <span className="font-medium underline">
                                    {data?.members?.firstname}{" "}
                                    {data?.members?.lastname}
                                </span>
                            </div>
                            <div className="block text-md font-bold ">
                                Project:{" "}
                                <span className="font-medium underline">
                                    {data?.project?.projectName}
                                </span>
                            </div>
                            <div className="block text-md font-bold">
                                Airline:{" "}
                                <span className="font-medium underline">
                                    {data?.airlines.airlines}
                                </span>
                            </div>
                            <div className="block text-md font-bold">
                                Trip Type:{" "}
                                <span className="font-medium underline">
                                    {data?.tripType}
                                </span>
                            </div>
                            <div className="block text-md font-bold">
                                Travel Date:{" "}
                                <span className="font-medium underline">
                                    {data?.travelDate}
                                </span>
                            </div>
                            <div className="block text-md font-bold">
                                Departing Airport:{" "}
                                <span className="font-medium underline">
                                    {data?.departureAirport}
                                </span>
                            </div>
                            <div className="block text-md font-bold">
                                Arrival Airport:{" "}
                                <span className="font-medium underline">
                                    {data?.arrivalAirport}
                                </span>
                            </div>
                            <div className="block text-md font-bold">
                                Return Date:{" "}
                                <span className="font-medium underline">
                                    {data?.returnDate}
                                </span>
                            </div>
                            <div className="block text-md font-bold">
                                Baggage Fees:{" "}
                                <span className="font-medium underline">
                                    ${data?.baggageFee}
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
                    <div className="rounded-lg shadow-md dark:shadow-slate-700 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold mb-4 underline">
                                Flight Credits
                            </h2>
                            <NewCreditForm
                                flightNum={data?.id}
                                memberNum={data?.members?.id}
                                creatingUser={session?.user?.name ?? ""}
                                airlinesID={data?.airlinesID}
                                onNoteCreated={() => refresh()}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="block text-md font-bold">
                                Available Credits:{" "}
                                <span className=" font-bold text-lg underline pr-4">
                                    {availableCredit === 0
                                        ? "No Credits"
                                        : `$${availableCredit}`}
                                </span>
                                {availableCredit === 0 ? (
                                    ""
                                ) : (
                                    <Popover>
                                        <PopoverTrigger>
                                            <span className="text-green-700 hover:text-green-800 hover:underline">Apply Credit</span>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-96">
                                            <ApplyCredit
                                                credit={availableCredit}
                                                flightNum={data?.id}
                                                creditOwnerID={data?.members?.id}
                                                creatingUser={
                                                    session?.user?.name ?? ""
                                                }
                                                    onNoteCreated={() => refresh()}
                                                creditId = {data?.credits[0]?.id}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                        </div>
                        {/* 
                        <div className="mt-4">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-tableBoarder">
                                        <th className="px-4 py-2 text-left text-sm font-medium uppercase tracking-wide">
                                            Amount
                                        </th>
                                        <th className="px-4 py-2 text-left text-sm font-medium uppercase tracking-wide">
                                            Type
                                        </th>
                                        <th className="px-4 py-2 text-left text-sm font-medium uppercase tracking-wide">
                                            Entered By
                                        </th>
                                        <th className="px-4 py-2 text-left text-sm font-medium uppercase tracking-wide">
                                            Entered Date{" "}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.creditUsage.map((credit: any) => (
                                        <tr
                                            className="border-b border-gray-200 dark:border-gray-700"
                                            key={credit.id}
                                        >
                                            <td className="px-4 py-2 text-md">
                                                $<span className={credit.creditType === "Credit" ? "text-green-600" : "text-red-600"}>
                                                {credit.amount}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-md">
                                                {credit.creditType}
                                            </td>
                                            <td className="px-4 py-2 text-md">
                                                {credit.creator}
                                            </td>
                                            <td className="px-4 py-2 text-md">
                                                {credit.createdDate.toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div> */}
                    </div>
                </div>
                <div className=" rounded-lg shadow-md dark:shadow-slate-700 p-6 mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold mb-4">Notes</h2>
                        <FlightNoteModal
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
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">
                                        Delete
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.flightNotes.map((note: any) => (
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
                                        <td className="px-4 py-2 text-sm">
                                            <NoteDelete noteId={note.id} />
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
                        <FlightAttatchment
                            params={{
                                flight: data.id,
                                uploader: session?.user?.name ?? "",
                                fileSuffix: `-${data?.flightConfirmationNumber}-${data?.members?.firstname}-${data?.members?.lastname}`,
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
