"use client";
import React, { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, useWatch, Control } from "react-hook-form";
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
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { updateRental } from "@/app/rentals/rentalActions";
import { getProjects, getApprovedTechs } from "@/app/hr/hrActions";

// Zod schema to validate the form
const FormSchema = z.object({
    rentalAgreement: z.string().min(1, "Rental Agreement is required."),
    reservation: z.string().min(1, "Reservation is required."),
    pickUpDate: z.date(),
    dueDate: z.date(),
    licensePlate: z.string().optional(),
    vehicleType: z.string().optional(),
    vehicleVin: z.string().optional(),
    pickUpMileage: z.number().optional(),
    dropOffMileage: z.number().optional(),
    vendors: z.string().min(1, "Vendor is required."),
    pickUpLocation: z.string().min(1, "Pick Up Location is required."),
    returnLocation: z.string().optional(),
    finalCharges: z.number().optional(),
    canceled: z.boolean().default(false),
    verified: z.boolean().default(false),
    archived: z.boolean().default(false),
    memberId: z.number(),
    projectId: z.number(),
    returnDate: z.date().optional(),
tolls: z.number().nullable().optional(),

    lastUpdatedBy: z.string(),
});

interface EditRentalProps {
    updatingUser: string;
    rentalData: any;
    onNoteCreated: () => void;
}

export default function EditRentalForm({
    onNoteCreated,
    updatingUser,
    rentalData,
}: EditRentalProps) {
    const {
        watch,
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(FormSchema),
    });

    //console.log("rentalData", rentalData);

    const form = useForm<z.infer<typeof FormSchema>>({
        defaultValues: {
            projectId: rentalData?.projectId,
            memberId: rentalData?.memberId,
            rentalAgreement: rentalData?.rentalAgreement || '',
            reservation: rentalData?.reservation || '',
            pickUpDate: rentalData?.pickUpDate
                ? new Date(rentalData?.pickUpDate)
                : new Date(),
            dueDate: rentalData?.dueDate
                ? new Date(rentalData?.dueDate)
                : new Date(),
            vehicleType: rentalData?.vehicleType || '',
            vehicleVin: rentalData?.vehicleVIN || '',
            licensePlate: rentalData?.licensePlate || '',
            pickUpMileage: rentalData?.pickUpMileage || 0,
            dropOffMileage: rentalData?.dropOffMileage || 0,
            vendors: rentalData?.vendors || '',
            pickUpLocation: rentalData?.pickUpLocation || '',
            returnLocation: rentalData?.returnLocation || '',
            finalCharges: rentalData?.finalCharges || 0,
            canceled: rentalData?.canceled || false,
            verified: rentalData?.verified || false,
            archived: rentalData?.archived || false,
            lastUpdatedBy: updatingUser,
            tolls: rentalData?.tolls || 0,
            returnDate: rentalData?.returnDate
                ? new Date(rentalData?.returnDate)
                : new Date(),
        },
        mode: "onTouched",
        resolver: zodResolver(FormSchema),
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        //console.log("form Values", values);
        try {
            const currentDate = new Date();
            const newData = {
                ...values,
                createdDate: currentDate,
                finalCharges: values.finalCharges?.toString() ?? '',
                vendors: values.vendors as
                    | "Hertz"
                    | "Enterprise"
                    | "Uhaul"
                    | "Other",
                lastUpdated: currentDate,
                pickUpDate: values.pickUpDate.toISOString(),
                dueDate: values.dueDate.toISOString(),
                returnDate: values.returnDate
                    ? values.returnDate.toISOString()
                    : null,
                tolls: values.tolls !== undefined && values.tolls !== null
                    ? values.tolls.toString()
                    : values.tolls,
            };
            //console.log("rentalData", newData);
            await updateRental(newData);
            onNoteCreated();
            reset();
        } catch (error) {
            console.error("Error updating rental:", error);
        }
    }

    return (
        <Dialog key="1">
            <DialogTrigger asChild>
                <Button className="bg-red-700 text-white hover:bg-red-800 hover:text-black">
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] bg-background-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-secondary">
                        Edit Rental
                    </DialogTitle>
                    <p
                        id="dialog-description"
                        className="text-sm text-primary-foreground"
                    >
                        Edit the details of the existing rental agreement.
                    </p>
                </DialogHeader>
                <Card className="w-full max-w-xl bg-background">
                    <CardContent className="grid gap-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="vendors"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Rental Company
                                                    </div>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger id="vendor">
                                                        <SelectValue placeholder="Select Company" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Hertz">
                                                            Hertz
                                                        </SelectItem>
                                                        <SelectItem value="Enterprise">
                                                            Enterprise
                                                        </SelectItem>
                                                        <SelectItem value="Uhaul">
                                                            Uhaul
                                                        </SelectItem>
                                                        <SelectItem value="Other">
                                                            Other
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="rentalAgreement"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Rental Agreement
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter The Renal Agreement"
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
                                        name="reservation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Reservation Number
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
                                        name="pickUpDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Pick Up Date
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
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dueDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Due Date
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
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="vehicleType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Vehicle Type
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Vehicle Type"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="vehicleVin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Vehicle Vin
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Vehicle Vin"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="licensePlate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        License Plate
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter License Plate"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="pickUpMileage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Pick Up Mileage
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    placeholder="Enter Pick Up Mileage"
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        field.onChange(
                                                            value
                                                                ? parseInt(
                                                                      value,
                                                                      10
                                                                  )
                                                                : ""
                                                        );
                                                    }}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dropOffMileage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Drop Off Mileage
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    placeholder="Enter Pick Up Mileage"
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        field.onChange(
                                                            value
                                                                ? parseInt(
                                                                      value,
                                                                      10
                                                                  )
                                                                : ""
                                                        );
                                                    }}
                                                />

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="pickUpLocation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Pick Up Location
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Pick Up Location"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="returnLocation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Retrun Location
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Return Location"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="returnDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Actual Return Date
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tolls"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Total Tolls
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    type="text"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    placeholder="Enter Amount (e.g., 12.40)"
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        // Allow empty string, numbers, and one decimal point
                                                        if (
                                                            value === "" ||
                                                            /^\d*\.?\d*$/.test(
                                                                value
                                                            )
                                                        ) {
                                                            field.onChange(
                                                                value
                                                            );
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        const numericValue =
                                                            parseFloat(value);
                                                        if (
                                                            !isNaN(numericValue)
                                                        ) {
                                                            field.onChange(
                                                                numericValue
                                                            );
                                                        } else {
                                                            field.onChange(0);
                                                        }
                                                    }}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="finalCharges"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Final Charges
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    type="text"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    placeholder="Enter Amount (e.g., 12.40)"
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        // Allow empty string, numbers, and one decimal point
                                                        if (
                                                            value === "" ||
                                                            /^\d*\.?\d*$/.test(
                                                                value
                                                            )
                                                        ) {
                                                            field.onChange(
                                                                value
                                                            );
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        const numericValue =
                                                            parseFloat(value);
                                                        if (
                                                            !isNaN(numericValue)
                                                        ) {
                                                            field.onChange(
                                                                numericValue
                                                            );
                                                        } else {
                                                            field.onChange(0);
                                                        }
                                                    }}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2 pt-4">
                                    <FormField
                                        control={form.control}
                                        name="canceled"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center space-x-2 pt-2">
                                                    <FormLabel>
                                                        <span className="font-bold text-red-500">
                                                            Rental Canceled:{" "}
                                                        </span>
                                                    </FormLabel>
                                                    <Switch
                                                        id="canceled"
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
                                        name="verified"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center space-x-2 pt-2">
                                                    <FormLabel>
                                                        <span className="font-bold text-green-600">
                                                            Rental Verified:{" "}
                                                        </span>
                                                    </FormLabel>
                                                    <Switch
                                                        id="verified"
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
                                        name="archived"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center space-x-2 pt-2">
                                                    <FormLabel>
                                                        <span className="font-bold">
                                                            Archive:{" "}
                                                        </span>
                                                    </FormLabel>
                                                    <Switch
                                                        id="archived"
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
                                    <DialogClose asChild>
                                        <Button
                                            className="bg-green-700 text-white hover:bg-green-800 hover:text-black"
                                            type="submit"
                                        >
                                            Submit
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
