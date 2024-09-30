"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { JSX, SVGProps } from "react";
import { getApprovedTechs } from "../../hrActions";
import { EditProjectForm } from "@/components/hr_components/editProject";
import Link from "next/link";
import NotAuth from "@/components/auth/notAuth";
import { EosIconsBubbleLoading } from "@/components/spinner";

interface Project {
    params: {
        projectName: string;
    };
}

export default function ProjectPage({ params }: Project) {
    const { data: session } = useSession();
    const { projectName } = params;
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorStatus, setErrorStatus] = useState<boolean>(false);

    useEffect(() => {
        async function fetchData() {
            const response = await getApprovedTechs(
                decodeURIComponent(projectName)
            );

            if (Array.isArray(response)) {
                setTechnicians(response);
                
            } else if (response && "technicians" in response) {
                setTechnicians(response.technicians);
                setLoading(false);
            }

            if (response && "project" in response) {
                setProject(response.project);
            }
        }
        fetchData();
    }, [projectName]);

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


    return (
        <div className="container mx-auto p-4">
            <Card className="mb-8">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>{project?.projectName}</CardTitle>
                        <CardDescription>
                            Total of approved technicians -{" "}
                            <span className="font-semibold text-green-700">
                                {technicians.length} - {project?.projectName}
                            </span>
                        </CardDescription>
                    </div>
                    <EditProjectForm
                        errorStatusChange={errorStatusChange}
                        projectName={project?.projectName}
                    />

                    
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="bg-muted rounded-md flex items-center justify-center aspect-square w-12">
                            <CodeIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Status</p>
                            <p className="text-xs">
                                <span
                                    className={
                                        project?.inactive === false
                                            ? "text-green-700" // If inactive is false, show "Active"
                                            : project?.inactive === true
                                            ? "text-red-500 dark:text-red-400" // If inactive is true, show "Inactive"
                                            : ""
                                    }
                                >
                                    {project?.inactive === false
                                        ? "Active"
                                        : project?.inactive === true
                                        ? "Inactive"
                                        : ""}
                                </span>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Approved Technicians</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {technicians.map((technician: any) => (
                                <TableRow key={technician.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm font-medium leading-none">
                                                <Link
                                                    href={`/hr/roster/${technician.member.preferedName}-${technician.member.lastname}`}
                                                    className="font-medium text-green-700 capitalize hover:underline"
                                                >
                                                    {
                                                        technician.member
                                                            .preferedName
                                                    }{" "}
                                                    {technician.member.lastname}
                                                </Link>
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-md">
                                            {technician.member.city},{" "}
                                            {technician.member.state}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function CodeIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    );
}
