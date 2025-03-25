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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { createF10VechileRez, getF10Vehicles } from "./vehicleActions";
import { F10Vehicles } from "@/db/schema/utilities_db";
import { getProjects, getApprovedTechs } from "@/app/hr/hrActions";
import { toast } from "sonner";

// Zod schema to validate the form
const FormSchema = z.object({
    vehicle_id: z.number({
        required_error: "Vehicle ID is required",
    }),
    pickUpDate: z.date({
        required_error: "Pick up date is required",
    }),
    returnDate: z.date().optional(),
    driver: z.string().min(1, "Driver is required"),
    reason: z.string().min(1, "Reason is required"),
    creator: z.string(),
});

interface NewVehicleReservationProps {
    onReservationCreated: () => void;
    creatingUser: string;
}

export default function NewF10VehiclesRezForm({
    onReservationCreated,
    creatingUser,
}: NewVehicleReservationProps) {
    const [projects, setProjects] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState("");
    const [vehicles, setVehicles] = useState<F10Vehicles[]>([]);


    useEffect(() => {
        async function fetchData() {
            const fetchVehicles = await getF10Vehicles();
            setVehicles(fetchVehicles);
        }
        fetchData();
    }, []);

    const form = useForm<z.infer<typeof FormSchema>>({
        defaultValues: {
            vehicle_id: undefined,
            pickUpDate: new Date(),
            returnDate: undefined,
            driver: "",
            reason: "",
            creator: creatingUser,
        },
        mode: "onTouched",
        resolver: zodResolver(FormSchema),
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const reservationData = {
                ...values,
                createdDate: new Date(),
                pickUpDate: values.pickUpDate.toISOString(),
                returnDate: values.returnDate
                    ? values.returnDate.toISOString()
                    : null,
                creator: creatingUser,
            };

            const dbResult = await createF10VechileRez(reservationData);

            if (dbResult === true) {
                form.reset();
                setIsDialogOpen(false);
                onReservationCreated();
                toast.success("Vehicle reservation created successfully!");
            } else {
                toast.error(`Error creating vehicle reservation: ${dbResult}`);
            }
        } catch (error) {
            console.error("Error creating vehicle reservation:", error);
            toast.error("Failed to create vehicle reservation");
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} key="1">
            <DialogTrigger asChild>
                <Button
                    className="bg-green-700 text-white hover:bg-green-800 hover:text-black"
                    onClick={() => setIsDialogOpen(true)}
                >
                    Reserve Vehicle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] bg-background-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-secondary">
                        Create New Vehicle Reservation
                    </DialogTitle>
                </DialogHeader>
                <Card className="w-full max-w-xl bg-background">
                    <CardContent className="grid gap-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="vehicle_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Vehicle
                                                    </div>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) =>
                                                        field.onChange(
                                                            parseInt(value, 10)
                                                        )
                                                    }
                                                    value={field.value?.toString()}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Vehicle" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {vehicles.map(
                                                            (vehicle: F10Vehicles) => (
                                                                <SelectItem
                                                                    key={
                                                                        vehicle.id
                                                                    }
                                                                    value={vehicle.id.toString()}
                                                                >
                                                                    {
                                                                        vehicle.vehicleName
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
                                        name="driver"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Driver
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Drivers Name"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Reason
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter Reason for Reservation"
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
                                                <FormMessage />
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
