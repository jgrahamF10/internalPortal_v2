"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DialogTrigger,
    DialogTitle,
    DialogHeader,
    DialogFooter,
    DialogContent,
    Dialog,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, Control, FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {updateProjectApproval, getProjectIntake } from "@/app/hr/hrActions"; // Add updateProject and getProject functions
import { ProjectBGStatus } from "@/db/schema/member_management";

interface EditProjectFormProps {
    errorStatusChange: (status: boolean) => void;
    projectApprovalId: number;
    editingUser: string;
}

const FormSchema = z.object({
    projectId: z.string(),
    memberId: z.number(),
    bgStatus: z.enum(["In Progress", "Failed", "Completed"]),
    documentsCollected: z.boolean(),
    updatedBy: z.string(),
    approvalDate: z.date().nullable(),
});

export default function EditProjectApproval({ errorStatusChange, projectApprovalId, editingUser }: EditProjectFormProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ProjectBGStatus>();
    
    const [projectApproval, setProjectApproval] = useState<any>(null); // Use null to represent the initial state

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            projectId: "1",
            memberId: 0,
            bgStatus: "In Progress",
            documentsCollected: false,
            updatedBy: editingUser,
            approvalDate: null,
        },
    });

    useEffect(() => {
        async function fetchData() {
            const fetchedIntake = await getProjectIntake(projectApprovalId);
            if (fetchedIntake) {
                setProjectApproval(fetchedIntake);
                form.reset({
                    projectId: fetchedIntake.projectId.toString(),
                    memberId: fetchedIntake.memberId,
                    bgStatus: fetchedIntake.bgStatus,
                    documentsCollected:
                        fetchedIntake.documentsCollected ?? false,
                    updatedBy: editingUser,
                    approvalDate: fetchedIntake.approvalDate
                        ? new Date(fetchedIntake.approvalDate)
                        : null,
                });
            }
        }
        fetchData();
    }, [projectApprovalId, form, editingUser]);

    //console.log("fetchedProject", projectApproval);
    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const updatedValues = {
                ...values,
                approvalDate: values.approvalDate
                    ? values.approvalDate.toISOString()
                    : null,
                projectId: Number(values.projectId),
                intakeId: projectApprovalId,
                submissionDate: new Date().toISOString(),
            };
            await updateProjectApproval(updatedValues);
            errorStatusChange(false);
        } catch (error) {
            console.error("Error updating project intake:", error);
            errorStatusChange(true);
        } finally {
            form.reset();    
        }
    };

    return (
        <Dialog key="1">
        <DialogTrigger asChild>
            <Button variant={"destructive"} className="hover:text-black">
                Edit 
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Make an edit to this approval</DialogTitle>
            </DialogHeader>
            <Card className="w-full max-w-xl bg-white dark:bg-gray-800">
                
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                            <DialogFooter>
                        <DialogClose asChild>
                            <Button type="submit">Update</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
                    </Form>
                </CardContent>
                </Card>
                
            </DialogContent>
        </Dialog>
    );
}