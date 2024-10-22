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
import { getProjects, getApprovedTechs } from "@/app/hr/hrActions";
import { createFlight, getAirlines } from "@/app/flights/actions";
import { airline } from "@/db/schema/tracker_db";

// Zod schema to validate the form
const FormSchema = z.object({
    technician: z.string(), //
    project: z.string(), //
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
    creatingUser: string;
}

function FormWatch({
    control,
}: {
    control: Control<z.infer<typeof FormSchema>>;
}) {
    const selectedProject = useWatch({
        control,
        name: "project" as const,
    });
    return selectedProject;
}

export default function NewFlightForm({
    onNoteCreated,
    creatingUser,
}: NewRentalProps) {
    const [projects, setProjects] = useState<any[]>([]);
    const [technicians, setTechnicians] = useState<string[]>([]);
    const [airlines, setAirlines] = useState<any[]>([]);
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

    const form = useForm<z.infer<typeof FormSchema>>({
        defaultValues: {
            project: "",
            technician: "",
            flightConfirmationNumber: "",
            tripType: "",
            airlines: "",
            travelDate: new Date(),
            departureAirport: "",
            arrivalAirport: "",
            baggageFee: 0,
            flightCost: 0,
            canceled: false,
            verified: false,
            archived: false,
            lastUpdatedBy: creatingUser,
        },
        mode: "onTouched",
        resolver: zodResolver(FormSchema),
    });

    const { control: formControl } = form;

    const selectedProject = FormWatch({ control: formControl });
    console.log("selectedProject", selectedProject);

    useEffect(() => {
        async function fetchData() {
            const fetchProject = await getProjects();
            setProjects(
                fetchProject.filter((project: any) => !project.inactive)
            );
            const fetchedAirlines = await getAirlines();
            setAirlines(fetchedAirlines);
        }
        fetchData();
    }, []);

    useEffect(() => {
        async function fetchDrivers() {
            if (selectedProject) {
                try {
                    const approvedTechs: any = await getApprovedTechs(
                        selectedProject
                    );
                    const techs = approvedTechs?.technicians.map(
                        (technician: any) => ({
                            id: technician.member.id,
                            techName: `${technician.member.firstname} ${technician.member.lastname}`,
                        })
                    );
                    techs.sort(
                        (a: { techName: string }, b: { techName: any }) =>
                            a.techName.localeCompare(b.techName)
                    );
                    setTechnicians(techs);
                } catch (error) {
                    console.error("Error fetching drivers:", error);
                    setTechnicians([]); // Handle the error by clearing drivers
                }
            } else {
                setTechnicians([]);
            }
        }
        fetchDrivers();
    }, [selectedProject]);

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        console.log("form Values", values);
        try {
            const projectId = projects.find(
                (project: { projectName: string }) =>
                    project.projectName === values.project
            ).id;
            const airlineId = airlines.find(
                (airline: { airlines: string }) =>
                    airline.airlines === values.airlines
            ).id;
            const currentDate = new Date();
            const flightData = {
                ...values,
                projectId: projectId,
                memberId: parseInt(values.technician, 10),
                airlinesID: airlineId,
                createdDate: currentDate,
                lastUpdated: currentDate,
                flightCost: values.flightCost.toString(),
                totalCost: values.flightCost.toString(),
                flightConfirmationNumber: values.flightConfirmationNumber,
                tripType: values.tripType as "One-Way" | "Round Trip",
                travelDate: values.travelDate.toISOString(),
                returnDate: values.returnDate ? values.returnDate.toISOString() : undefined,
                baggageFee: values.baggageFee.toString(),
            };
            console.log("flightData", flightData);
            await createFlight(flightData);
            onNoteCreated();
            reset();
        } catch (error) {
            console.error("Error creating flight:", error);
        }
    }

    return (
        <Dialog key="1">
            <DialogTrigger asChild>
                <Button className="bg-green-700 text-white hover:bg-green-800 hover:text-black">
                    New Flight
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] bg-background-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-secondary">
                        Create A New Flight
                    </DialogTitle>
                </DialogHeader>
                <Card className="w-full max-w-xl bg-background">
                    <CardContent className="grid gap-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="project"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Project
                                                    </div>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Project" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {projects.map(
                                                            (project: any) => (
                                                                <SelectItem
                                                                    key={
                                                                        project.id
                                                                    }
                                                                    value={
                                                                        project.projectName
                                                                    }
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
                                        name="technician"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Technician
                                                    </div>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Technician" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {technicians.map(
                                                            (
                                                                technician: any
                                                            ) => (
                                                                <SelectItem
                                                                    key={
                                                                        technician.id
                                                                    }
                                                                    value={technician.id.toString()}
                                                                >
                                                                    {
                                                                        technician.techName
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
                                </div>
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
