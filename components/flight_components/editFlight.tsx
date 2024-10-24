"use client";
import React, { useState, useEffect, use } from "react";
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
import { updateFLight, getAirlines } from "@/app/flights/actions";

// Zod schema to validate the form
const FormSchema = z.object({
    memberId: z.number(), 
    projectId: z.number(), 
    lastUpdatedBy: z.string(),
    flightCost: z.preprocess((val) => {
        if (typeof val === "string") {
            return parseFloat(val) || 0;
        }
        return val;
    }, z.number().min(0)),
    canceled: z.boolean().default(false),
    verified: z.boolean().default(false),
    archived: z.boolean().default(false),
    flightConfirmationNumber: z
        .string()
        .min(1, "Flight Confirmation Number is required."),
    tripType: z.string().min(1, "Trip Type is required."),
    airlines: z.string().min(1, "Airline is required."),
    travelDate: z.date(),
    returnDate: z.date().optional(),
    departureAirport: z.string().min(1, "Departure Airport is required."),
    arrivalAirport: z.string().min(1, "Arrival Airport is required."),
    baggageFee: z.preprocess((val) => {
        if (typeof val === "string") {
            return parseFloat(val) || 0;
        }
        return val;
    }, z.number().min(0)),
});

interface NewRentalProps {
    onNoteCreated: () => void;
    flightData: any;
    updatingUser: string;
}

export default function NewFlightForm({
    onNoteCreated,
    updatingUser,
    flightData,
}: NewRentalProps) {
    const [airlines, setAirlines] = useState<any[]>([]);
    const {
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(FormSchema),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        defaultValues: {
            projectId: flightData?.projectId,
            memberId: flightData?.memberId,
            flightConfirmationNumber: flightData?.flightConfirmationNumber,
            tripType: flightData?.tripType,
            airlines: flightData?.airlines.airlines,
            travelDate: flightData?.travelDate
                ? new Date(flightData?.travelDate)
                : new Date(),
            returnDate: flightData?.returnDate
                ? new Date(flightData?.returnDate)
                : new Date(),
            flightCost: flightData?.flightCost,
            baggageFee: flightData?.baggageFee,
            departureAirport: flightData?.departureAirport,
            arrivalAirport: flightData?.arrivalAirport,
            canceled: flightData?.canceled,
            verified: flightData?.verified, 
            archived: flightData?.archived,
            lastUpdatedBy: updatingUser,
        },
        mode: "onTouched",
        resolver: zodResolver(FormSchema),
    });

    useEffect(() => {
        async function fetchData() {
            const fetchedAirlines = await getAirlines();
            setAirlines(fetchedAirlines);
        }
        fetchData();
    }, []);

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        console.log("form Values", values);
        try {
            const airlineId = airlines.find(
                (airline: { airlines: string }) =>
                    airline.airlines === values.airlines
            ).id;
            const currentDate = new Date();
            const updatedData = {
                ...values,
                projectId: flightData.projectId,
                memberId: flightData.memberId,
                airlinesID: airlineId,
                createdDate: currentDate,
                lastUpdated: currentDate,
                flightCost: values.flightCost.toString(),
                totalCost: (values.flightCost + values.baggageFee).toString(),
                flightConfirmationNumber: values.flightConfirmationNumber,
                tripType: values.tripType as "One-Way" | "Round Trip",
                travelDate: values.travelDate.toISOString(),
                returnDate: values.returnDate ? values.returnDate.toISOString() : undefined,
                baggageFee: values.baggageFee.toString(),
            };
            console.log("flightData", updatedData);
            await updateFLight(updatedData);
            onNoteCreated();
            reset();
        } catch (error) {
            console.error("Error creating flight:", error);
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
                        Edit A Flight
                    </DialogTitle>
                </DialogHeader>
                <Card className="w-full max-w-xl bg-background">
                    <CardContent className="grid gap-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="airlines"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Airline
                                                    </div>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger id="airline">
                                                        <SelectValue placeholder="Select Airline" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {airlines.map(
                                                            (airline: any) => (
                                                                <SelectItem
                                                                    key={
                                                                        airline.id
                                                                    }
                                                                    value={
                                                                        airline.airlines
                                                                    }
                                                                >
                                                                    {
                                                                        airline.airlines
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
                                        name="flightConfirmationNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Confirmation Number
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
                                        name="travelDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Travel Date
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
                                        name="returnDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Return Date
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
                                        name="tripType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Trip Type
                                                    </div>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger id="tripType">
                                                        <SelectValue placeholder="Select Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Round Trip">
                                                            Round Trip
                                                        </SelectItem>
                                                        <SelectItem value="One-Way">
                                                            One-Way
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="departureAirport"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Departure Airport
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Airport"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="arrivalAirport"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Arrival Airport
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Airport"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="flightCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Flight Cost
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
                                        name="baggageFee"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Baggage Fees
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
