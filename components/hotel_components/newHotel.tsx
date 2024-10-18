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
import { createRez, getHotelChains } from "@/app/hotels/actions";
import { getProjects, getApprovedTechs } from "@/app/hr/hrActions";

// Zod schema to validate the form
const FormSchema = z.object({
    hotelConfirmationNumber: z.string().min(1, "Rental Agreement is required."),
    hotelChain: z.string().min(1, "Hotel Chain is required."),
    arrivalDate: z.date(),
    departureDate: z.date(),
    hotelCity: z.string().min(1, "Hotel City is required."),
    hotelState: z.string().min(1, "Hotel State is required."),
    finalCharges: z.number().optional(),
    canceled: z.boolean().default(false),
    verified: z.boolean().default(false),
    archived: z.boolean().default(false),
    technician: z.string(),
    project: z.string(),
    lastUpdatedBy: z.string(),
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

export default function NewHotelForm({
    onNoteCreated,
    creatingUser,
}: NewRentalProps) {
    const [projects, setProjects] = useState<any[]>([]);
    const [technicians, setTechnicians] = useState<string[]>([]);
    const [hotels, setHotels] = useState<any[]>([]);

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
            technician: "",
            hotelConfirmationNumber: "",
            hotelChain: "",
            arrivalDate: new Date(),
            departureDate: new Date(),
            hotelCity: "",
            hotelState: "",
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

    const selectedProject = FormWatch({ control: formControl });
    console.log("selectedProject", selectedProject);

    useEffect(() => {
        async function fetchData() {
            const fetchProject = await getProjects();
            setProjects(
                fetchProject.filter((project: any) => !project.inactive)
            );
            const fetchHotels = await getHotelChains();
            setHotels(fetchHotels);
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
                    techs.sort((a: { techName: string; }, b: { techName: any; }) => a.techName.localeCompare(b.techName));
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
            const hotelId = hotels.find(
                (hotel: { hotelName: string }) =>
                    hotel.hotelName === values.hotelChain
            ).id;
            const currentDate = new Date();
            const rezData = {
                ...values,
                projectId: projectId,
                memberId: parseInt(values.technician, 10),
                createdDate: currentDate,
                hotelChainId: hotelId,
                lastUpdated: currentDate,
                finalcharges: values.finalCharges || 0, 
                arrivalDate: values.arrivalDate.toISOString(),
                departureDate: values.departureDate.toISOString(),
            };
            console.log("rentalData", rezData);
            await createRez(rezData);
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
                    New Reservation
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] bg-background-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-secondary">
                        Create A Reservation
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
                                        name="hotelChain"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Hotel Chain
                                                    </div>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger id="vendor">
                                                        <SelectValue placeholder="Select Hotel Chain" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {hotels.map(
                                                            (hotel: any) => (
                                                                <SelectItem
                                                                    key={
                                                                        hotel.id
                                                                    }
                                                                    value={
                                                                        hotel.hotelName
                                                                    }
                                                                >
                                                                    {
                                                                        hotel.hotelName
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
                                        name="hotelConfirmationNumber"
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
                                        name="arrivalDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Arrival Date
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
                                        name="departureDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Check Out Date
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
                                        name="hotelCity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Hotel City
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
                                        name="hotelState"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Hotel State
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
                                        name="finalCharges"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className="pt-2 font-bold">
                                                        Final Charges
                                                    </div>
                                                </FormLabel>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    value={
                                                        field.value != null
                                                            ? field.value.toString()
                                                            : ""
                                                    }
                                                    placeholder="Enter Toll Amount"
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
