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
import { createTsaApproval, getRoster } from "@/app/hr/hrActions";
import { toast } from "sonner"
import { db } from "@/db";

const FormSchema = z.object({
    member: z.string(),
    approvalStatus: z.string(),
    piv: z.string(),
    emailSetup: z.boolean(),
    approvalDate: z.string(),
    submittedDate: z.string(),
});

interface NewApprovalFormProps {
    creatingUser: string;
    onCreated: () => void;
}

export default function TSAApprovalForm({
    creatingUser,
    onCreated,
}: NewApprovalFormProps) {
    const [member, setMember] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        defaultValues: {
            member: "",
            approvalStatus: "In Progress",
            piv: "Awaiting PIV",
            emailSetup: false,
            approvalDate: "",
            submittedDate: "",
        },
        mode: "onTouched",
        resolver: zodResolver(FormSchema),
    });

    useEffect(() => {
        async function fetchData() {
            const fetchedMember = await getRoster();
            setMember(fetchedMember);
        }
        fetchData();
    }, []);

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const updatedValues = {
                ...values,
                memberId: parseInt(values.member),
                submittedBy: creatingUser,
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
            };
            const dbResult = await createTsaApproval(updatedValues);
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
                    className="bg-green-700 text-white hover:bg-green-800 hover:text-black"
                    onClick={() => setIsDialogOpen(true)}
                >
                    New Approval
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] bg-background-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-secondary">
                        Create A New Approval
                    </DialogTitle>
                </DialogHeader>
                <Card className="w-full max-w-xl bg-background">
                    <CardContent className="grid gap-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="member"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Person
                                                    </div>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger id="member">
                                                        <SelectValue placeholder="Select Person" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {member.map(
                                                            (person: any) => (
                                                                <SelectItem
                                                                    key={
                                                                        person.id
                                                                    }
                                                                    value={person.id.toString()}
                                                                >
                                                                    {person.preferedName +
                                                                        " " +
                                                                        person.lastname}
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
                                                    value={field.value || ""}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value ||
                                                                null
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
                                                    value={field.value || ""}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value ||
                                                                null
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
