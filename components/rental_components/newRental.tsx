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
import { createRental } from "@/app/rentals/rentalActions";
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
    driver: z.string(),
    project: z.string(),
    lastUpdatedBy: z.string(),
});


interface NewRentalProps {
    onNoteCreated: () => void;
    creatingUser: string;
}

function ProjectWatch({ control }: { control: Control<z.infer<typeof FormSchema>> }) {
    const selectedProject = useWatch({
        control,
        name: "project" as const,
    });
    return selectedProject;
}   

export default function NewRentalForm({
    onNoteCreated,
    creatingUser,
}: NewRentalProps) {
    const [projects, setProjects] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<string[]>([]);

    // Remove these lines
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
            driver: "",
            rentalAgreement: "",
            reservation: "",
            pickUpDate: new Date(),
            dueDate: new Date(),
            vehicleType: "",
            vehicleVin: "",
            licensePlate: "",
            pickUpMileage: 0,
            dropOffMileage: 0,
            vendors: "",
            pickUpLocation: "",
            returnLocation: "",
            finalCharges: 0,
            canceled: false,
            verified: false,
            archived: false,
            lastUpdatedBy: creatingUser,
        },
        mode: "onTouched",
        resolver: zodResolver(FormSchema),
    });

    const { control: formControl } = form;

    const selectedProject = ProjectWatch({ control: formControl });
    //console.log("selectedProject", selectedProject);
    

    useEffect(() => {
        async function fetchData() {
            const fetchProject = await getProjects();
            setProjects(
                fetchProject.filter((project: any) => !project.inactive)
            );
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
                    const drivers = approvedTechs?.technicians.map(
                        (technician: any) => ({
                            id: technician.member.id,
                            driverName: `${technician.member.firstname} ${technician.member.lastname}`,
                        })
                    );
                    setDrivers(drivers);
                } catch (error) {
                    console.error("Error fetching drivers:", error);
                    setDrivers([]); // Handle the error by clearing drivers
                }
            } else {
                setDrivers([]);
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

            const currentDate = new Date();
            const rentalData = {
                ...values,
                projectId: projectId,
                memberId: parseInt(values.driver, 10),
                createdDate: currentDate,
                vendors: values.vendors as
                    | "Hertz"
                    | "Enterprise"
                    | "Uhaul"
                    | "Other",
                lastUpdated: currentDate,
                pickUpDate: values.pickUpDate.toISOString(),
                dueDate: values.dueDate.toISOString(),
                finalCharges: values.finalCharges ? values.finalCharges.toString() : null,
            };
            console.log("rentalData", rentalData);
            await createRental(rentalData);
            onNoteCreated();
            reset(); // Reset the form after successful submission
        } catch (error) {
            console.error("Error creating rental:", error);
        }
    }
   
    return (
        <Dialog key="1">
            <DialogTrigger asChild>
                <Button className="bg-green-700 text-white hover:bg-green-800 hover:text-black">
                    Create Rental
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] bg-background-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-secondary">
                        Create A New Rental
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
                                        name="driver"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Driver
                                                    </div>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Driver" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {drivers.map(
                                                            (driver: any) => (
                                                                <SelectItem
                                                                    key={
                                                                        driver.id
                                                                    }
                                                                    value={driver.id.toString()}
                                                                >
                                                                    {
                                                                        driver.driverName
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
                                                    <SelectItem value="Enterprise">
                                                            Enterprise
                                                        </SelectItem>
                                                        <SelectItem value="Hertz">
                                                            Hertz
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
