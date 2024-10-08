"use client";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm, Control, FieldValues } from "react-hook-form";
import { createNote, getMemberId } from "@/app/hr/hrActions";
import { NewMemberNotes } from "@/db/schema/member_management";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

interface UserName {
    params: { person: string; uploader: string };
    onNoteCreated: () => void; // Pass callback function from the parent
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
    const router = useRouter();

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
            await createNote(values);
            onNoteCreated(); // Notify the parent that a note was created
        } catch (error) {
            console.error("Error creating note:", error);
        } finally {
            form.reset();
            router.push(`/hr/roster/${params.person}`);
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="p-8 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div className="text-right px-2 rounded-md">
                    <Button variant="ghost" className="ml-auto pb-2">
                        <Link href={`/hr/roster/${params.person}`}>
                            <XIcon className="w-4 h-4" />
                            <span className="sr-only">Close</span>
                        </Link>
                    </Button>
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Create a note
                    </h3>
                    <div className="mt-2 px-7 py-3">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-8"
                            >
                                <FormField
                                    control={
                                        form.control as unknown as Control<FieldValues>
                                    }
                                    name="note"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Add a note"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                The note should be between 5 and
                                                250 characters.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="items-center">
                                    <Button type="submit">Submit</Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function XIcon(
    props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}
