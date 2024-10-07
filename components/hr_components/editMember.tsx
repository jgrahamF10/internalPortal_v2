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
import { editMember, getMember } from "@/app/hr/hrActions"; // Add updateProject and getProject functions
import { NewMember } from "@/db/schema/member_management";
import { on } from "events";

interface MemmberFormProps {
    params: { person: string; editingUser: string };
    onNoteCreated: () => void;
}

const FormSchema = z.object({
    designation: z.string(),
    firstname: z.string(),
    lastname: z.string(),
    preferedName: z.string(),
    dob: z.date(),
    email: z.string(),
    phone: z
        .string()
        .regex(
            /^\d{3}-\d{3}-\d{4}$/,
            "Phone number must be in the format XXX-XXX-XXXX"
        ),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipcode: z.string(),
    startDate: z.date(),
    intakeStatus: z.string(),
    documentsCollected: z.boolean(),
    approvalDate: z.date().nullable(),
    enteredBy: z.string(),
});

export default function EditMember({
    params,
    onNoteCreated,
}: MemmberFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<NewMember>();


    const [member, setMember] = useState<any>(null); // Use null to represent the initial state

    const form = useForm<z.infer<typeof FormSchema>>({
        defaultValues: {
            designation: "Contractor",
            firstname: "",
            lastname: "",
            preferedName: "",
            dob: new Date(),
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zipcode: "",
            startDate: new Date(),
            intakeStatus: "In Progress",
            documentsCollected: false,
            enteredBy: params.editingUser,
            approvalDate: new Date(),
        },
        mode: "onTouched",
        resolver: zodResolver(FormSchema),
    });

    useEffect(() => {
        async function fetchData() {
            const fetchedMember = await getMember(params.person);
            if (fetchedMember) {
                setMember(fetchedMember);
                form.reset({
                    designation: fetchedMember.designation,
                    firstname: fetchedMember.firstname,
                    lastname: fetchedMember.lastname,
                    preferedName: fetchedMember.preferedName,
                    dob: fetchedMember.dob ? new Date(fetchedMember.dob) : new Date(),
                    email: fetchedMember.email,
                    phone: fetchedMember.phone,
                    address: fetchedMember.address || "",
                    city: fetchedMember.city,
                    state: fetchedMember.state,
                    zipcode: fetchedMember.zipcode,
                    startDate: fetchedMember.startDate ? new Date(fetchedMember.startDate) : new Date(),
                    intakeStatus: fetchedMember.intakeStatus || "In Progress",
                    documentsCollected: fetchedMember.documentsCollected ?? false,
                    approvalDate: fetchedMember.approvalDate ? new Date(fetchedMember.approvalDate) : null,
                    enteredBy: params.editingUser,
                });
            }
        }
        fetchData();
    }, [params.person, form, params.editingUser]);

    //console.log("fetchedProject", projectApproval);
    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const updatedValues = {
                ...values,
                startDate: values.approvalDate
                    ? values.approvalDate.toISOString()
                    : undefined,
                dob: values.dob ? values.dob.toISOString() : null,
                designation: values.designation as "Contractor" | "Employee",
                state: values.state as
                    | "Alabama"
                    | "Alaska"
                    | "Arizona"
                    | "Arkansas"
                    | "California"
                    | "Colorado"
                    | "Connecticut"
                    | "Delaware"
                    | "Florida"
                    | "Georgia"
                    | "Hawaii"
                    | "Idaho"
                    | "Illinois"
                    | "Indiana"
                    | "Iowa"
                    | "Kansas"
                    | "Kentucky"
                    | "Louisiana"
                    | "Maine"
                    | "Maryland"
                    | "Massachusetts"
                    | "Michigan"
                    | "Minnesota"
                    | "Mississippi"
                    | "Missouri"
                    | "Montana"
                    | "Nebraska"
                    | "Nevada"
                    | "New Hampshire"
                    | "New Jersey"
                    | "New Mexico"
                    | "New York"
                    | "North Carolina"
                    | "North Dakota"
                    | "Ohio"
                    | "Oklahoma"
                    | "Oregon"
                    | "Pennsylvania"
                    | "Rhode Island"
                    | "South Carolina"
                    | "South Dakota"
                    | "Tennessee"
                    | "Texas"
                    | "Utah"
                    | "Vermont"
                    | "Virginia"
                    | "Washington"
                    | "West Virginia"
                    | "Wisconsin"
                    | "Wyoming",
                approvalDate: values.approvalDate
                    ? values.approvalDate.toISOString()
                    : new Date().toISOString(),
                intakeStatus: values.intakeStatus as
                    | "In Progress"
                    | "Failed"
                    | "Approved"
                    | null
                    | undefined,
            };
            await editMember(updatedValues);
        } catch (error) {
            console.error("Error creating member:", error);
        } finally {
            form.reset();
            onNoteCreated();
        }
    }

    return (
        <Dialog key="1">
            <DialogTrigger asChild>
                <Button className="bg-red-700 text-white hover:bg-red-800 hover:text-black">
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>Create A New Person</DialogTitle>
                </DialogHeader>
                <Card className="w-full max-w-xl bg-background">
                    <CardContent className="grid gap-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="designation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Designation
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
                                                        <SelectItem value="Contractor">
                                                            Contractor
                                                        </SelectItem>
                                                        <SelectItem value="Employee">
                                                            Employee
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="firstname"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        First Name
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter First Name"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value.trim()
                                                        )
                                                    }
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastname"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Last Name
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Last Name"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value.trim()
                                                        )
                                                    }
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="preferedName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Prefered Name
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Prefered Name"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value.trim()
                                                        )
                                                    }
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dob"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Date of Birth
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    value={
                                                        field.value
                                                            ? field.value
                                                                  .toISOString()
                                                                  .split("T")[0]
                                                            : ""
                                                    }
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                ? new Date(
                                                                      e.target.value
                                                                  )
                                                                : null
                                                        )
                                                    }
                                                />
                                                {errors.dob && (
                                                    <FormMessage>
                                                        {errors.dob.message}
                                                    </FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Email
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Email"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Phone
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Phone"
                                                />
                                                {form.formState.errors
                                                    .phone && (
                                                    <FormMessage>
                                                        {
                                                            form.formState
                                                                .errors.phone
                                                                .message
                                                        }
                                                    </FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Address
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Address"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        City
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter City"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        State
                                                    </div>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger id="member-state">
                                                        <SelectValue placeholder="Select State" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Alabama">
                                                            Alabama
                                                        </SelectItem>
                                                        <SelectItem value="Alaska">
                                                            Alaska
                                                        </SelectItem>
                                                        <SelectItem value="Arizona">
                                                            Arizona
                                                        </SelectItem>
                                                        <SelectItem value="Arkansas">
                                                            Arkansas
                                                        </SelectItem>
                                                        <SelectItem value="California">
                                                            California
                                                        </SelectItem>
                                                        <SelectItem value="Colorado">
                                                            Colorado
                                                        </SelectItem>
                                                        <SelectItem value="Connecticut">
                                                            Connecticut
                                                        </SelectItem>
                                                        <SelectItem value="Delaware">
                                                            Delaware
                                                        </SelectItem>
                                                        <SelectItem value="Florida">
                                                            Florida
                                                        </SelectItem>
                                                        <SelectItem value="Georgia">
                                                            Georgia
                                                        </SelectItem>
                                                        <SelectItem value="Hawaii">
                                                            Hawaii
                                                        </SelectItem>
                                                        <SelectItem value="Idaho">
                                                            Idaho
                                                        </SelectItem>
                                                        <SelectItem value="Illinois">
                                                            Illinois
                                                        </SelectItem>
                                                        <SelectItem value="Indiana">
                                                            Indiana
                                                        </SelectItem>
                                                        <SelectItem value="Iowa">
                                                            Iowa
                                                        </SelectItem>
                                                        <SelectItem value="Kansas">
                                                            Kansas
                                                        </SelectItem>
                                                        <SelectItem value="Kentucky">
                                                            Kentucky
                                                        </SelectItem>
                                                        <SelectItem value="Louisiana">
                                                            Louisiana
                                                        </SelectItem>
                                                        <SelectItem value="Maine">
                                                            Maine
                                                        </SelectItem>
                                                        <SelectItem value="Maryland">
                                                            Maryland
                                                        </SelectItem>
                                                        <SelectItem value="Massachusetts">
                                                            Massachusetts
                                                        </SelectItem>
                                                        <SelectItem value="Michigan">
                                                            Michigan
                                                        </SelectItem>
                                                        <SelectItem value="Minnesota">
                                                            Minnesota
                                                        </SelectItem>
                                                        <SelectItem value="Mississippi">
                                                            Mississippi
                                                        </SelectItem>
                                                        <SelectItem value="Missouri">
                                                            Missouri
                                                        </SelectItem>
                                                        <SelectItem value="Montana">
                                                            Montana
                                                        </SelectItem>
                                                        <SelectItem value="Nebraska">
                                                            Nebraska
                                                        </SelectItem>
                                                        <SelectItem value="Nevada">
                                                            Nevada
                                                        </SelectItem>
                                                        <SelectItem value="New Hampshire">
                                                            New Hampshire
                                                        </SelectItem>
                                                        <SelectItem value="New Jersey">
                                                            New Jersey
                                                        </SelectItem>
                                                        <SelectItem value="New Mexico">
                                                            New Mexico
                                                        </SelectItem>
                                                        <SelectItem value="New York">
                                                            New York
                                                        </SelectItem>
                                                        <SelectItem value="North Carolina">
                                                            North Carolina
                                                        </SelectItem>
                                                        <SelectItem value="North Dakota">
                                                            North Dakota
                                                        </SelectItem>
                                                        <SelectItem value="Ohio">
                                                            Ohio
                                                        </SelectItem>
                                                        <SelectItem value="Oklahoma">
                                                            Oklahoma
                                                        </SelectItem>
                                                        <SelectItem value="Oregon">
                                                            Oregon
                                                        </SelectItem>
                                                        <SelectItem value="Pennsylvania">
                                                            Pennsylvania
                                                        </SelectItem>
                                                        <SelectItem value="Rhode Island">
                                                            Rhode Island
                                                        </SelectItem>
                                                        <SelectItem value="South Carolina">
                                                            South Carolina
                                                        </SelectItem>
                                                        <SelectItem value="South Dakota">
                                                            South Dakota
                                                        </SelectItem>
                                                        <SelectItem value="Tennessee">
                                                            Tennessee
                                                        </SelectItem>
                                                        <SelectItem value="Texas">
                                                            Texas
                                                        </SelectItem>
                                                        <SelectItem value="Utah">
                                                            Utah
                                                        </SelectItem>
                                                        <SelectItem value="Vermont">
                                                            Vermont
                                                        </SelectItem>
                                                        <SelectItem value="Virginia">
                                                            Virginia
                                                        </SelectItem>
                                                        <SelectItem value="Washington">
                                                            Washington
                                                        </SelectItem>
                                                        <SelectItem value="West Virginia">
                                                            West Virginia
                                                        </SelectItem>
                                                        <SelectItem value="Wisconsin">
                                                            Wisconsin
                                                        </SelectItem>
                                                        <SelectItem value="Wyoming">
                                                            Wyoming
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="zipcode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Zip Code
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Zip Code"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="intakeStatus"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Intake Status
                                                    </div>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger id="member-intake-status">
                                                        <SelectValue placeholder="Select intake status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="In Progress">
                                                            In Progress
                                                        </SelectItem>
                                                        <SelectItem value="Failed">
                                                            Failed
                                                        </SelectItem>
                                                        <SelectItem value="Approved">
                                                            Approved
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
                                                    <Label htmlFor="documents-collected">
                                                        <div className="font-bold">
                                                            Documents Collected
                                                        </div>
                                                    </Label>
                                                    <Switch
                                                        id="documents-collected"
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                        checked={field.value}
                                                    />
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="font-bold pt-2">
                                                        Start Date
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    value={
                                                        field.value
                                                            ? field.value
                                                                  .toISOString()
                                                                  .split("T")[0]
                                                            : ""
                                                    }
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                ? new Date(
                                                                      e.target.value
                                                                  )
                                                                : null
                                                        )
                                                    }
                                                />
                                                {errors.approvalDate && (
                                                    <FormMessage>
                                                        {
                                                            errors.approvalDate
                                                                .message
                                                        }
                                                    </FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <DialogFooter className="pt-4">
                                    <DialogClose asChild>
                                        <Button
                                            className="bg-green-700 text-white hover:bg-green-800 hover:text-black"
                                            type="submit"
                                        >
                                            Update
                                        </Button>
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
