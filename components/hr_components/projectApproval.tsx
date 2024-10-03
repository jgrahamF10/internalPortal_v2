"use client";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, Control, FieldValues } from "react-hook-form";
import {
    getMemberId,
    NewProjectApproval,
    getProjects,
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
    CardFooter,
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";

interface UserName {
    params: { person: string; uploader: string };
    onNoteCreated: () => void; // Pass callback function from the parent
}

const FormSchema = z.object({
    projectId: z.string(),
    memberId: z.number(),
    bgStatus: z.enum(["In Progress", "Failed", "Completed"]),
    documentsCollected: z.boolean(),
    updatedBy: z.string(),
    approvalDate: z.date().nullable(),
});

export default function ProjectApprovalModal({
    params,
    onNoteCreated,
}: UserName) {
    const router = useRouter();
    const [projects, setProjects] = useState<any>([]);
    //console.log("updater", params.uploader);

    // Access errors from the form state
    const {
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: async () => {
            const memberId = await getMemberId(params.person);
            const projectId = projects.find(
                (project: { projectName: string }) =>
                    project.projectName === params.person
            )?.id;
            return {
                projectId: projectId ?? 1,
                memberId: memberId ?? 0,
                bgStatus: "In Progress",
                documentsCollected: false,
                updatedBy: params.uploader,
                approvalDate: new Date(),
            };
        },
    });

    useEffect(() => {
        async function fetchData() {
            const fetchedProjects = await getProjects();
            setProjects(fetchedProjects);
        }
        fetchData();
        console.log("useEffect");
    }, []);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: async () => {
            const memberId = await getMemberId(params.person);
            const projectId = projects.find(
                (project: { projectName: string }) =>
                    project.projectName === params.person
            )?.id;
            return {
                projectId: projectId ?? 1,
                memberId: memberId ?? 0,
                bgStatus: "In Progress",
                documentsCollected: false,
                updatedBy: params.uploader,
                approvalDate: new Date() ?? null,
            };
        },
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const updatedValues = {
                ...values,
                submissionDate: new Date().toISOString(),
                approvalDate: values.approvalDate
                    ? values.approvalDate.toISOString()
                    : null,
                projectId: Number(values.projectId),
            };
            await NewProjectApproval(updatedValues);
            onNoteCreated();
        } catch (error) {
            console.error("Error creating note:", error);
        } finally {
            reset();
            router.push(`/hr/roster/${params.person}`);
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <Card className="w-full max-w-xl bg-white dark:bg-gray-800">
                <CardHeader>
                    <CardTitle className="flex flex-row justify-between ">
                        <div className="pt-4">Project Intake Form</div>
                        <Button variant="ghost" className="ml-auto pb-2">
                            <Link href={`/hr/roster/${params.person}`}>
                                <XIcon className="w-4 h-4" />
                                <span className="sr-only">Close</span>
                            </Link>
                        </Button>
                    </CardTitle>

                    <CardDescription>
                        Fill in the details for the new project intake.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Project Field */}
                            <FormField
                                control={control}
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
                                        {errors.projectId && (
                                            <FormMessage>
                                                {errors.projectId.message}
                                            </FormMessage>
                                        )}
                                    </FormItem>
                                )}
                            />

                            {/* Intake Status Field */}
                            <FormField
                                control={control}
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
                                        {errors.bgStatus && (
                                            <FormMessage>
                                                {errors.bgStatus.message}
                                            </FormMessage>
                                        )}
                                    </FormItem>
                                )}
                            />

                            {/* Documents Collected Field */}
                            <FormField
                                control={control}
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
                                        {errors.documentsCollected && (
                                            <FormMessage>
                                                {
                                                    errors.documentsCollected
                                                        .message
                                                }
                                            </FormMessage>
                                        )}
                                    </FormItem>
                                )}
                            />

                            {/* Approval Date Field */}
                            <FormField
                                control={control}
                                name="approvalDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <div className="font-bold pt-2">
                                                Approval Date
                                            </div>
                                        </FormLabel>
                                        <Input
                                            type="date"
                                            {...field}
                                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                        />
                                        {errors.approvalDate && (
                                            <FormMessage>
                                                {errors.approvalDate.message}
                                            </FormMessage>
                                        )}
                                    </FormItem>
                                )}
                            />

                            {/* Submit Button */}
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
