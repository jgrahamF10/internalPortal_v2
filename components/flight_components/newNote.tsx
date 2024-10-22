"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm, Control, FieldValues } from "react-hook-form";
import { createFlightNote } from "@/app/flights/actions";
import { NewNote } from "@/db/schema/tracker_db";
import {
    DialogTrigger,
    DialogTitle,
    DialogHeader,
    DialogFooter,
    DialogContent,
    Dialog,
    DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NoteFormProps {
    params: { rentalId: number; uploader: string }; 
    onNoteCreated: () => void;
}

const FormSchema = z.object({
    noteType: z.enum(["Rental", "Flight", "Hotel"]),
    note: z
        .string()
        .min(5, {
            message: "Note must be at least 5 characters.",
        })
        .max(250, {
            message: "Note must not be longer than 250 characters.",
        }),
    parentId: z.number(),
    noteAuthor: z.string(),
    createdDate: z.date(),
    
});

export default function FlightNoteModal({ params, onNoteCreated }: NoteFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<NewNote>();

    //console.log("params", params);

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const updatedValues = {
                ...values,
                noteAuthor: params.uploader,
                parentId: params.rentalId,
                createdDate: new Date(),
                noteType: "Flight" as const
            };
            await createFlightNote(updatedValues);
            onNoteCreated(); 
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <Dialog key="1">
            <DialogTrigger asChild>
                <Button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-800 dark:bg-green-700">
                    New Note
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Create a note</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 items-center gap-4">
                            <Label className="text-center grid-cols-2" htmlFor="name">
                                Note
                            </Label>
                            <Textarea
                                {...register("note", { required: true })}
                                className="col-span-2 "
                                id="name"
                                placeholder="Enter a note"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="submit">Submit</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
