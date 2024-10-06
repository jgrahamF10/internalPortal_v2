"use client";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm, Control, FieldValues } from "react-hook-form";
import { createNote, getMemberId } from "@/app/hr/hrActions";
import { NewMemberNotes } from "@/db/schema/member_management";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { on } from "events";

interface UserName {
    params: { person: string; uploader: string }; 
    onNoteCreated: () => void;
}

const FormSchema = z.object({
    note: z
        .string()
        .min(5, {
            message: "Note must be at least 5 characters.",
        })
        .max(250, {
            message: "Note must not be longer than 250 characters.",
        }),
    enteredBy: z.string(),
    memberId: z.number(),
    createdDate: z.date(),
});

export default function NewNoteModal({ params, onNoteCreated }: UserName) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<NewMemberNotes>();

    console.log("params", params);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: async () => {
            const memberId = await getMemberId(params.person);
            return {
                note: "",
                enteredBy: params.uploader,
                memberId: memberId ?? 0,
                createdDate: new Date(),
            };
        },
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const memberId = await getMemberId(params.person);
            const updatedValues = {
                ...values,
                enteredBy: params.uploader,
                memberId: memberId ?? 0,
                createdDate: new Date(),
            };
            await createNote(updatedValues);
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
                                placeholder="Enter a project name"
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
