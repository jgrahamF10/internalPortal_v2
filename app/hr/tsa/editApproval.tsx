import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    DialogTrigger,
    DialogTitle,
    DialogHeader,
    DialogFooter,
    DialogContent,
    Dialog,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { updateTsaApproval, getRoster } from "@/app/hr/hrActions";
import { toast } from "sonner"



const FormSchema = z.object({
    id: z.number(),
    member: z.number(),
    approvalStatus: z.string(),
    piv: z.string(),
    emailSetup: z.boolean(),
    approvalDate: z.string(),
    submittedBy: z.string(),
    submittedDate: z.string(),
    updatedBy: z.string(),
});

interface NewApprovalFormProps {
    creatingUser: string;
    approvalData: any;
    onCreated: () => void;
}

export default function EditApprovalForm({
    creatingUser,
    approvalData,
    onCreated,
}: NewApprovalFormProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);


    const form = useForm<z.infer<typeof FormSchema>>({
        defaultValues: {
            id: approvalData.id,
            member: approvalData.memberId,  
            approvalStatus: approvalData.approvalStatus,
            piv: approvalData.piv,
            emailSetup: approvalData.emailSetup,
            approvalDate: approvalData.approvalDate ? new Date(approvalData.approvalDate).toISOString().split('T')[0] : '',
            submittedDate: approvalData.submittedDate ? new Date(approvalData.submittedDate).toISOString().split('T')[0] : '',
            submittedBy: approvalData.submittedBy,
            updatedBy: approvalData.updatedBy,
        },
        mode: "onTouched",
        resolver: zodResolver(FormSchema),
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const updatedValues = {
                ...values,
                updatedBy: creatingUser,
                lastActivity: new Date(),
                createdDate: new Date(),
                submittedDate: new Date(values.submittedDate),
                approvalDate: values.approvalDate
                    ? new Date(values.approvalDate).toISOString().split("T")[0]
                    : null,
                approvalStatus: values.approvalStatus as
                    | "In Progress"
                    | "Approved"
                    | "Rejected",
                piv: values.piv as
                    | "Awaiting PIV"
                    | "Issued"
                    | "Activated"
                    | "Needs Provisioning",
                emailSetup: values.emailSetup,
                memberId: approvalData.memberId,
            };
            const dbResult = await updateTsaApproval(updatedValues);
            if (dbResult === true) {
                form.reset();
                setIsDialogOpen(false); // Close the dialog only if submission succeeds
                onCreated();
            }
            else {
                console.log("dbResult", dbResult);
                toast.error(`Missing data for ${dbResult}`);
            }
        } catch (error) {
            console.error("Error creating member:", error);
           
            // Dialog remains open if an error occurs
        }
    }


    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} key="1">
            <DialogTrigger asChild>
                <Button
                    className="bg-red-700 text-white hover:bg-red-800 hover:text-black"
                    onClick={() => setIsDialogOpen(true)}
                >
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] bg-background-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-secondary">
                        Edit Approval for {approvalData.member.firstname} {approvalData.member.lastname}
                    </DialogTitle>
                </DialogHeader>
                <Card className="w-full max-w-xl bg-background">
                    <CardContent className="grid gap-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="approvalStatus"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Approval Status
                                                    </div>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger id="designation">
                                                        <SelectValue placeholder="Select intake status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="In Progress">
                                                            In Progress
                                                        </SelectItem>
                                                        <SelectItem value="Approved">
                                                            Approved
                                                        </SelectItem>
                                                        <SelectItem value="Rejected">
                                                            Rejected
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="piv"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        PIV Card Status
                                                    </div>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger id="piv">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Awaiting PIV">
                                                            Awaiting PIV
                                                        </SelectItem>
                                                        <SelectItem value="Issued">
                                                            Issued
                                                        </SelectItem>
                                                        <SelectItem value="Needs Provisioning">
                                                            Needs Provisioning
                                                        </SelectItem>
                                                        <SelectItem value="Activated">
                                                            Activated
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                                {form.formState.errors.piv && (
                                                    <FormMessage>
                                                        {String(
                                                            form.formState
                                                                .errors.piv
                                                                .message
                                                        )}
                                                    </FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="submittedDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Submission Date
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value 
                                                        )
                                                    }
                                                />
                                                {form.formState.errors
                                                    .submittedDate && (
                                                    <FormMessage>
                                                        {String(
                                                            form.formState
                                                                .errors
                                                                .submittedDate
                                                                .message
                                                        )}
                                                    </FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="approvalDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Approval Date
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value 
                                                        )
                                                    }
                                                />
                                                {form.formState.errors
                                                    .approvalDate && (
                                                    <FormMessage>
                                                        {String(
                                                            form.formState
                                                                .errors
                                                                .approvalDate
                                                                .message
                                                        )}
                                                    </FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="emailSetup"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center space-x-2 pt-2">
                                                    <FormLabel>
                                                        <span className="font-bold">
                                                            Email Issued:{" "}
                                                        </span>
                                                    </FormLabel>
                                                    <Switch
                                                        id="emailSetup"
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                        checked={field.value}
                                                    />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button
                                        className="bg-green-700 text-white hover:bg-green-800 hover:text-black"
                                        type="submit"
                                    >
                                        Submit
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
