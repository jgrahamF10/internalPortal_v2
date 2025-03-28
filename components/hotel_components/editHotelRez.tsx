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
import { updateRez } from "@/app/hotels/actions";
import { getHotelChains } from "@/app/hotels/actions";


// Zod schema to validate the form
const FormSchema = z.object({
    hotelConfirmationNumber: z.string().min(1, "Rental Agreement is required."),
    hotelChainId: z.number(),
    hotelChain: z.string().min(1, "Hotel Chain is required."),
    arrivalDate: z.date(),
    departureDate: z.date(),
    hotelCity: z.string().min(1, "Hotel City is required."),
    hotelState: z.string().min(1, "Hotel State is required."),
    finalCharges: z.preprocess((val) => {
        if (typeof val === "string") {
            return parseFloat(val) || 0;
        }
        return val;
    }, z.number().min(0)),
    canceled: z.boolean().default(false),
    verified: z.boolean().default(false),
    archived: z.boolean().default(false),
    technician: z.number(),
    projectId: z.number(),
    lastUpdatedBy: z.string(),
});

interface EditRentalProps {
    updatingUser: string;
    hotelData: any;
    onNoteCreated: () => void;
}

export default function EditHotelRezForm({
    onNoteCreated,
    updatingUser,
    hotelData,
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
    const [hotels, setHotels] = useState<any[]>([]);

    //console.log("rentalData", rentalData);

    useEffect(() => {
        async function fetchData() {
            const fetchHotels = await getHotelChains();
            setHotels(fetchHotels);
        }
        fetchData();
    }, []);

    const form = useForm<z.infer<typeof FormSchema>>({
        defaultValues: {
            projectId: hotelData?.projectId,
            technician: hotelData?.memberId,
            hotelConfirmationNumber: hotelData?.hotelConfirmationNumber,
            hotelChainId: hotelData?.hotelChainId,
            hotelChain: hotelData?.hotelChain.hotelName,
            arrivalDate: hotelData?.arrivalDate
                ? new Date(hotelData?.arrivalDate)
                : new Date(),
                departureDate: hotelData?.departureDate
                ? new Date(hotelData?.departureDate)
                : new Date(),
            finalCharges: hotelData?.finalCharges,
            hotelCity: hotelData?.hotelCity,
            hotelState: hotelData?.hotelState,
            canceled: hotelData?.canceled,
            verified: hotelData?.verified,
            archived: hotelData?.archived,
            lastUpdatedBy: updatingUser,
            
        },
        mode: "onTouched",
        resolver: zodResolver(FormSchema),
    });

    

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        console.log("form Values", values);
        try {
            const currentDate = new Date();
            const hotelId = hotels.find(
                (hotel: { hotelName: string }) =>
                    hotel.hotelName === values.hotelChain
            ).id;
            const rezData = {
                ...values,
                memberId: values.technician,
                createdDate: currentDate,
                lastUpdated: currentDate,
                arrivalDate: values.arrivalDate.toISOString(),
                departureDate: values.departureDate.toISOString(),
                hotelChainId: hotelId,
                finalCharges: values.finalCharges.toString(),
            };
            console.log("rentalData", rezData);
            await updateRez(rezData);
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
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] bg-background-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-secondary">
                        Edit Reservation
                    </DialogTitle>
                </DialogHeader>
                <Card className="w-full max-w-xl bg-background">
                    <CardContent className="grid gap-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
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
                                                    placeholder="Enter The Reservaition Number"
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
