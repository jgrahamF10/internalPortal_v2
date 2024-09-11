"use client";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, Control, FieldValues } from "react-hook-form";
import {
    getProjectIntake,
    getProjects,
    updateProjectApproval,
} from "@/app/hr/hrActions";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface ModalParams {
    params: { person: string; uploader: string; intakeId: number };
    onNoteCreated: () => void;
}

const FormSchema = z.object({
    projectId: z.string(),
    memberId: z.number(),
    bgStatus: z.enum(["In Progress", "Failed", "Completed"]),
    documentsCollected: z.boolean(),
    updatedBy: z.string(),
    approvalDate: z.date().nullable(),
});

export default function EditProjectApprovalModal({
    params,
    onNoteCreated,
}: ModalParams) {
    const router = useRouter();
    const [projects, setProjects] = useState<any>([]);
    const [intakeData, setIntakeData] = useState<any>(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            projectId: "1",
            memberId: 0,
            bgStatus: "In Progress",
            documentsCollected: false,
            updatedBy: params.uploader,
            approvalDate: null,
        },
    });

    useEffect(() => {
        async function fetchData() {
            const fetchedProjects = await getProjects();
            setProjects(fetchedProjects);

            const fetchedIntake = await getProjectIntake(params.intakeId);
            setIntakeData(fetchedIntake);

            if (fetchedIntake) {
                form.reset({
                    projectId: fetchedIntake.projectId.toString(),
                    memberId: fetchedIntake.memberId,
                    bgStatus: fetchedIntake.bgStatus,
                    documentsCollected: fetchedIntake.documentsCollected ?? false,
                    updatedBy: params.uploader,
                    approvalDate: fetchedIntake.approvalDate
                        ? new Date(fetchedIntake.approvalDate)
                        : null,
                });
            }
        }
        fetchData();
    }, [params.intakeId, form, params.uploader]);

    
    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const updatedValues = {
                ...values,
                submissionDate: new Date(),
                approvalDate: values.approvalDate
                    ? values.approvalDate.toISOString()
                    : null,
                projectId: Number(values.projectId),
                intakeId: params.intakeId, // Ensure intakeId is sent
            };
            await updateProjectApproval(updatedValues); // Only update the record with this intakeId
            onNoteCreated();
        } catch (error) {
            console.error("Error updating project intake:", error);
        } finally {
            form.reset();
            router.push(`/hr/roster/${params.person}`);
        }
    }
    const handleClose = () => {
        router.push(`/hr/roster/${params.person}`);
        form.reset();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <Card className="w-full max-w-xl bg-white">
                <CardHeader>
                    <CardTitle className="flex flex-row justify-between ">
                        <div className="pt-4">Edit Project Intake Form</div>
                        <Button variant="ghost" className="ml-auto pb-2" onClick={handleClose}>
                            <XIcon className="w-4 h-4" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </CardTitle>

                    <CardDescription>
                        Make changes to an existing project intake.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={
                                    form.control as unknown as Control<FieldValues>
                                }
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <div className="font-bold">
                                                Project
                                            </div>
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger id="project">
                                                <SelectValue placeholder="Select a project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projects.map(
                                                    (project: any) => (
                                                        <SelectItem
                                                            key={project.id}
                                                            value={project.id.toString()}
                                                        >
                                                            {
                                                                project.projectName
                                                            }
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bgStatus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <div className="pt-2 font-bold">
                                                Intake Status
                                            </div>
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger id="intake-status">
                                                <SelectValue placeholder="Select intake status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="In Progress">
                                                    In Progress
                                                </SelectItem>
                                                <SelectItem value="Failed">
                                                    Failed
                                                </SelectItem>
                                                <SelectItem value="Completed">
                                                    Completed
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="documentsCollected"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center space-x-2 pt-2">
                                            <Switch
                                                id="documents-collected"
                                                onCheckedChange={field.onChange}
                                                checked={field.value}
                                            />
                                            <Label htmlFor="documents-collected">
                                                <div className="font-bold">
                                                    Documents Collected
                                                </div>
                                            </Label>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="approvalDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <div className="font-bold pt-2">
                                                Approval Date
                                            </div>
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start"
                                                >
                                                    <CalendarDaysIcon className="mr-1 h-4 w-4" />
                                                    {field.value
                                                        ? field.value.toDateString()
                                                        : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={
                                                        field.value ?? undefined
                                                    }
                                                    onSelect={field.onChange}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-center pt-4">
                                <Button type="submit" className="w-half">
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

function CalendarDaysIcon(
    props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) {
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
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
            <path d="M8 14h.01" />
            <path d="M12 14h.01" />
            <path d="M16 14h.01" />
            <path d="M8 18h.01" />
            <path d="M12 18h.01" />
            <path d="M16 18h.01" />
        </svg>
    );
}

function XIcon(
    props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) {
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
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}
