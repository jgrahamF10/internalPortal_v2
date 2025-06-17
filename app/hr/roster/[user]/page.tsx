"use client";
import { Button } from "@/components/ui/button";
import { getMember, getTsaApproval } from "../../hrActions";
import React, { useState, useEffect } from "react";
import { EosIconsBubbleLoading } from "@/components/spinner";
import { useSession } from "next-auth/react";
import NotAuth from "@/components/auth/notAuth";
import Link from "next/link";
import ProjectApprovalModal from "@/components/hr_components/projectApproval";
import ClearanceApprovalModal from "@/components/hr_components/clearanceApproval";
import NewNoteModal from "@/components/hr_components/newNote";
import EditProjectApproval from "@/components/hr_components/editProjectApproval";
import EditMember from "@/components/hr_components/editMember";
import ResumeUpload from "@/components/hr_components/uploadResume";
import { getFile } from "@/lib/aws";
import { useRouter } from "next/navigation";
import { AttachmentDelete } from "@/components/hr_components/deleteResume";
import MemberAttatchment from "@/components/hr_components/memberAttachment";
import NoteDelete from "@/components/hr_components/deleteMemberNote";
import EditApprovalForm from "../../tsa/editApproval";

interface UserName {
    params: { user: string };
}

type SearchParamProps = {
    searchParams: Record<string, string> | null | undefined;
};

export default function MemberDetails({
    params,
    searchParams,
}: UserName & SearchParamProps) {
    const [member, setMember] = useState<any>(null);
    const [tsaApproval, setTsaApproval] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [resume, setResume] = useState<any>(null);
    const [auditLogVisible, setAuditLogVisible] = useState<boolean>(false);
    const [intakeStatus, setIntakeStatus] = useState<any>(null);
    const { data: session } = useSession();
    const showProjectApproval = searchParams?.showProjectApproval;
    const showProjectClearance = searchParams?.showProjectClearance;
    const newNote = searchParams?.newNote;
    const [errorStatus, setErrorStatus] = useState<boolean>(false);
    const [resumeUrl, setResumeUrl] = useState<string>("");
    const [urls, setUrls] = useState<{ [key: string]: string }>({});
    const router = useRouter();
    const decondedUser = decodeURIComponent(params.user);
    //console.log("params", params.user);

    useEffect(() => {
        async function fetchData() {
            const fetchedMember: any = await getMember(decondedUser);
            //console.log("fetchedMember", fetchedMember);
            if (!fetchedMember) {
                // Check for null or undefined
                setNotFound(true);
                setLoading(false);
                return;
            }
            setMember(fetchedMember);
            const tsaData = await getTsaApproval(fetchedMember.id);
            if (tsaData) {
                setTsaApproval(tsaData);
            }

            // Ensure 'attachment' exists and is an array before processing
            const attachments = fetchedMember.attachment || [];

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
    }, [decondedUser]);

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
            ["Managers", "Human Resources", "Internal Portal Admins"].includes(
                role
            )
        )
    ) {
        return <NotAuth />;
    }

    if (notFound) {
        return (
            <div className="container mx-auto py-8 px-4 md:px-6">
                <div className="bg-white rounded-lg  p-6 dark:bg-gray-950">
                    <h2 className="text-2xl font-bold">
                        Person Not Found -{" "}
                        <span className="text-red-600">{params.user}</span>
                    </h2>
                </div>
            </div>
        );
    }

    const refreshUser = (updatedUser: string) => {
        if (updatedUser !== params.user) {
            router.push(`/hr/roster/${updatedUser}`);
        } else {
            window.location.reload();
        }
    };

    const refresh = () => {
        window.location.reload();
    };

    return (
        <div className="p-2">
            <nav className="flex justify-end space-x-2">
                <a href="/hr/roster" className="text-muted-foreground">
                    All Members
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
                                    {member?.preferedName} {member?.lastname}
                                </span>
                            </h2>
                            {session?.roles?.some((role) =>
                                [
                                    "Internal Portal Admins",
                                    "Human Resources",
                                ].includes(role)
                            ) && (
                                <EditMember
                                    params={{
                                        person: decondedUser,
                                        editingUser: session?.user?.name ?? "",
                                    }}
                                    onNoteCreated={(updatedUser) =>
                                        refreshUser(updatedUser)
                                    }
                                />
                            )}
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <h3
                                className={
                                    member?.status === "Inactive"
                                        ? "text-red-500 text-lg font-bold"
                                        : "text-lg font-bold"
                                }
                            >
                                Status:{" "}
                                <span
                                    className={
                                        member?.status === "Do not Contact"
                                            ? "text-red-500 dark:text-red-400"
                                            : member?.status === "Active"
                                            ? "text-green-700"
                                            : ""
                                    }
                                >
                                    {member?.status}
                                </span>
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="block text-sm font-bold">
                                Classification:{" "}
                                <span className="font-medium underline">
                                    {member?.designation}
                                </span>
                            </div>
                            <div className="block text-sm font-bold ">
                                Email:{" "}
                                <span className="font-medium underline">
                                    {member?.email}
                                </span>
                            </div>
                            <div className="block text-sm font-bold">
                                Actual First Name:{" "}
                                <span className="font-medium capitalize">
                                    {member?.firstname}
                                </span>
                            </div>
                            <div className="block text-sm font-bold">
                                Middle Name:{" "}
                                <span className="font-medium capitalize">
                                    {member?.middleName}
                                </span>
                            </div>
                            {session?.roles?.some((role) =>
                                [
                                    "Internal Portal Admins",
                                    "Human Resources",
                                ].includes(role)
                            ) && (
                                <div className="block text-sm font-bold">
                                    Date Of Birth:{" "}
                                    <span className="font-medium underline">
                                        {member?.dob.toString()}
                                    </span>
                                </div>
                            )}

                            <div className="block text-sm font-bold">
                                Phone:{" "}
                                <span className="font-medium underline">
                                    {member?.phone}
                                </span>
                            </div>

                            <div className="block text-sm font-bold">
                                Address:{" "}
                                <span className="font-medium capitalize">
                                    {member?.address}
                                </span>
                            </div>
                            <div className="block text-sm font-bold">
                                City:{" "}
                                <span className="font-medium capitalize">
                                    {member?.city}
                                </span>
                            </div>
                            <div className="block text-sm font-bold">
                                State:{" "}
                                <span className="font-medium capitalize">
                                    {member?.state}
                                </span>
                            </div>
                            <div className="block text-sm font-bold">
                                Zip:{" "}
                                <span className="font-medium capitalize">
                                    {member?.zipcode}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg shadow-md dark:shadow-slate-700 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold mb-4 underline">
                                Onboarding Status
                            </h2>
                            {session?.roles?.some((role) =>
                                [
                                    "Internal Portal Admins",
                                    "Human Resources",
                                ].includes(role)
                            ) && (
                                <ResumeUpload
                                    params={{
                                        person: member.id,
                                        uploader: session?.user?.name ?? "",
                                    }}
                                />
                            )}
                        </div>
                        <div className="overflow-x-auto"></div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="block text-lg font-bold ">
                                Status:{" "}
                                <span
                                    className={
                                        member?.intakeStatus === "Failed"
                                            ? "text-red-500 dark:text-red-400 underline"
                                            : member?.intakeStatus ===
                                              "Approved"
                                            ? "text-green-700 dark:text-green-700 underline"
                                            : member?.intakeStatus ===
                                              "In Progress"
                                            ? "text-blue-700 dark:text-blue-400 underline"
                                            : ""
                                    }
                                >
                                    {member?.intakeStatus}
                                </span>
                            </div>
                            <div className="block text-md font-bold ">
                                Documents Collected:{" "}
                                <span
                                    className={
                                        member?.documentsCollected === false
                                            ? "text-red-500 dark:text-red-400 underline"
                                            : member.documentsCollected === true
                                            ? "text-green-700 underline"
                                            : ""
                                    }
                                >
                                    {member?.documentsCollected
                                        ? " Collected"
                                        : " Missing"}
                                </span>
                            </div>
                            <div className="block text-md font-bold ">
                                Credit Card Issued:{" "}
                                <span
                                    className={
                                        member?.companyCard === false
                                            ? "text-red-500 dark:text-red-400 underline"
                                            : member.companyCard === true
                                            ? "text-green-700 underline"
                                            : ""
                                    }
                                >
                                    {member?.companyCard
                                        ? " Card Issued"
                                        : " Not Issued"}
                                </span>
                            </div>
                            <div className="block text-md font-bold">
                                Submission Date:{" "}
                                <span className="font-medium capitalize">
                                    {member?.startDate
                                        ? member.startDate.toString()
                                        : "N/A"}
                                </span>
                            </div>
                            <div className="block text-md font-bold">
                                Approval Date:{" "}
                                <span className="font-medium capitalize">
                                    {member?.approvalDate.toString()}
                                </span>
                            </div>
                            {session?.roles?.some((role) =>
                                [
                                    "Internal Portal Admins",
                                    "Human Resources",
                                ].includes(role)
                            ) && (
                                <div className="flex items-center text-md font-bold">
                                    {/* Resume label */}
                                    Resume:{" "}
                                    {/* Resume Description and Download Link */}
                                    {member?.attachment
                                        .filter(
                                            (item: any) => item.resume === true
                                        )
                                        .map((item: any) => (
                                            <span
                                                key={item.id}
                                                className="flex items-center font-medium capitalize ml-2"
                                            >
                                                {/* Resume Description */}
                                                {item.description.replace(
                                                    /resumes\//i,
                                                    ""
                                                )}

                                                {/* Download Link */}
                                                <a
                                                    href={resumeUrl}
                                                    download
                                                    className="ml-4 underline hover:text-green-700"
                                                >
                                                    Download
                                                </a>

                                                {/* Trash Icon */}
                                                <span className="ml-4">
                                                    <AttachmentDelete
                                                        attachmentId={item.id}
                                                    />
                                                </span>
                                            </span>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className=" rounded-lg shadow-md dark:shadow-slate-700 p-6 mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold mb-4">
                            Project Approval Status
                        </h2>
                        <Link
                            href={`/hr/roster/${params.user}/?showProjectApproval=true`}
                        >
                            <Button className="bg-green-700">
                                Add Project Approval
                            </Button>
                        </Link>
                        {showProjectApproval && (
                            <ProjectApprovalModal
                                params={{
                                    person: decondedUser,
                                    uploader: session?.user?.name ?? "",
                                }}
                                onNoteCreated={() => refresh()}
                            />
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto ">
                            <thead className="bg-tableBoarder">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Background Status
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Project Name
                                    </th>

                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Documents Collected
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Submission Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Approval Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Updated By
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Edit
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {member.ProjectIntake.filter((projectIntake: any) => projectIntake.project.isClearance === false).map(
                                    (projectIntake: any) => (
                                        <tr
                                            key={projectIntake.id}
                                            className="border-b border-gray-200 dark:border-gray-700"
                                        >
                                            <td
                                                className={
                                                    projectIntake.bgStatus ===
                                                    "Failed"
                                                        ? "text-red-500  underline px-8"
                                                        : projectIntake.bgStatus ===
                                                          "Completed"
                                                        ? "text-green-700  underline px-8"
                                                        : projectIntake.bgStatus ===
                                                          "In Progress"
                                                        ? "text-blue-700  underline px-8"
                                                        : ""
                                                }
                                            >
                                                {projectIntake.bgStatus}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {
                                                    projectIntake.project
                                                        ?.projectName
                                                }
                                            </td>
                                            <td
                                                className={`px-4 py-2 text-sm ${
                                                    projectIntake.documentsCollected
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }`}
                                            >
                                                {projectIntake.documentsCollected
                                                    ? "Yes"
                                                    : "No"}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {projectIntake.submissionDate}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {projectIntake.approvalDate}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {projectIntake.updatedBy}
                                            </td>
                                            {session?.roles?.some((role) =>
                                                [
                                                    "Internal Portal Admins",
                                                    "Human Resources",
                                                ].includes(role)
                                            ) && (
                                                <td className="px-4 py-2 text-sm">
                                                    <EditProjectApproval
                                                        errorStatusChange={
                                                            errorStatusChange
                                                        }
                                                        projectApprovalId={
                                                            projectIntake.id
                                                        }
                                                        editingUser={
                                                            session?.user
                                                                ?.name ?? ""
                                                        }
                                                    />
                                                </td>
                                            )}
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
		{/* Clearance Approval Section */}			
                <div className=" rounded-lg shadow-md dark:shadow-slate-700 p-6 mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold mb-4">
                            Clearance Status
                        </h2>
                        <Link
                            href={`/hr/roster/${params.user}/?showProjectClearance=true`}
                        >
                            <Button className="bg-green-700">
                                Add Clearance
                            </Button>
                        </Link>
                        {showProjectClearance && (
                            <ClearanceApprovalModal
                                params={{
                                    person: decondedUser,
                                    uploader: session?.user?.name ?? "",
                                }}
                                onNoteCreated={() => refresh()}
                            />
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto ">
                            <thead className="bg-tableBoarder">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Name
                                    </th>

                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Documents Collected
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Submission Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Approval Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Updated By
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Edit
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {member.ProjectIntake.filter((projectIntake: any) => projectIntake.project.isClearance === true).map(
                                    (projectIntake: any) => (
                                        <tr
                                            key={projectIntake.id}
                                            className="border-b border-gray-200 dark:border-gray-700"
                                        >
                                            <td
                                                className={
                                                    projectIntake.bgStatus ===
                                                    "Failed"
                                                        ? "text-red-500  underline px-8"
                                                        : projectIntake.bgStatus ===
                                                          "Completed"
                                                        ? "text-green-700  underline px-8"
                                                        : projectIntake.bgStatus ===
                                                          "In Progress"
                                                        ? "text-blue-700  underline px-8"
                                                        : ""
                                                }
                                            >
                                                {projectIntake.bgStatus}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {
                                                    projectIntake.project
                                                        ?.projectName
                                                }
                                            </td>
                                            <td
                                                className={`px-4 py-2 text-sm ${
                                                    projectIntake.documentsCollected
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }`}
                                            >
                                                {projectIntake.documentsCollected
                                                    ? "Yes"
                                                    : "No"}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {projectIntake.submissionDate}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {projectIntake.approvalDate}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {projectIntake.updatedBy}
                                            </td>
                                            {session?.roles?.some((role) =>
                                                [
                                                    "Internal Portal Admins",
                                                    "Human Resources",
                                                ].includes(role)
                                            ) && (
                                                <td className="px-4 py-2 text-sm">
                                                    <EditProjectApproval
                                                        errorStatusChange={
                                                            errorStatusChange
                                                        }
                                                        projectApprovalId={
                                                            projectIntake.id
                                                        }
                                                        editingUser={
                                                            session?.user
                                                                ?.name ?? ""
                                                        }
                                                    />
                                                </td>
                                            )}
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {member?.tsaApproval.length > 0 && (
                    <div className="rounded-lg shadow-md dark:shadow-slate-700 p-6 mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold mb-4">
                                TSA Approval Status
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto ">
                                <thead className="bg-tableBoarder">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                            PIV Status
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                            Email Setup
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                            Submission Date
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                            Approval Date
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                            Updated By
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                            Edit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                   
                                        <tr
                                            key={tsaApproval.id}
                                            className="border-b border-gray-200 dark:border-gray-700"
                                        >
                                            <td
                                                className={
                                                    tsaApproval.approvalStatus ===
                                                    "Rejected"
                                                        ? "text-red-500  underline px-8"
                                                        : tsaApproval.approvalStatus ===
                                                          "Approved"
                                                        ? "text-green-700  underline px-8"
                                                        : tsaApproval.approvalStatus ===
                                                          "In Progress"
                                                        ? "text-blue-700  underline px-8"
                                                        : ""
                                                }
                                            >
                                                {tsaApproval.approvalStatus}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {tsaApproval.piv}
                                            </td>
                                            <td
                                                className={`px-4 py-2 text-sm ${
                                                    tsaApproval.emailSetup
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }`}
                                            >
                                                {tsaApproval.emailSetup
                                                    ? "Yes"
                                                    : "No"}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {tsaApproval.submittedDate.toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {tsaApproval.approvalDate}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {tsaApproval.updatedBy}
                                            </td>
                                            {session?.roles?.some((role) =>
                                                [
                                                    "Internal Portal Admins",
                                                    "Human Resources",
                                                ].includes(role)
                                            ) && (
                                                <td className="px-4 py-2 text-sm">
                                                   <EditApprovalForm 
                                                        approvalData={tsaApproval}
                                                        creatingUser={
                                                            session?.user
                                                                ?.name ?? ""
                                                        }
                                                        onCreated={() =>
                                                            refresh()
                                                        }
                                                    />
                                                </td>
                                            )}
                                        </tr>
                              
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                <div className=" rounded-lg shadow-md dark:shadow-slate-700 p-6 mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold mb-4">Notes</h2>

                        <NewNoteModal
                            params={{
                                person: decondedUser,
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
                                    {session?.roles?.some((role) =>
                                        [
                                            "Internal Portal Admins",
                                            "Human Resources",
                                        ].includes(role)
                                    ) && (
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">
                                            Delete
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {member.Notes.map((note: any) => (
                                    <tr
                                        className="border-b border-gray-200 dark:border-gray-700"
                                        key={note.id}
                                    >
                                        <td className="px-4 py-2 text-sm">
                                            {note.note}
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            {note.enteredBy}
                                        </td>

                                        <td className="px-4 py-2 text-sm">
                                            {note.createdDate.toLocaleDateString()}
                                        </td>
                                        {session?.roles?.some((role) =>
                                            [
                                                "Internal Portal Admins",
                                                "Human Resources",
                                            ].includes(role)
                                        ) && (
                                            <td className="px-4 py-2 text-sm">
                                                <NoteDelete noteId={note.id} />
                                            </td>
                                        )}
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
                                person: member.id,
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

                {/* Alert component for error handling 
                <Alert
                    variant="destructive"
                    className={errorStatus ? "" : "hidden"}
                >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {errorMsg ? errorMsg : "Error editing member."}
                    </AlertDescription>
                </Alert>
                */}
            </div>
        </div>
    );
}
