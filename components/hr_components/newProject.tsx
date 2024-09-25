"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createProject } from "@/app/hr/hrActions";
import { NewProject } from "@/db/schema/member_management";


export function NewProjecForm({ errorStatusChange }: any) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<NewProject>();

    const onSubmit: SubmitHandler<NewProject> = async (data) => {
        try {
            const createResult = await createProject(data);
            if (!createResult) {
                errorStatusChange(true);
            } else {
                errorStatusChange(false);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            errorStatusChange(true);
        }
    };

    return (
        <Dialog key="1">
            <DialogTrigger asChild>
                <Button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-800">
                    New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add a project</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right" htmlFor="name">
                                Project
                            </Label>
                            <Input
                                {...register("projectName", { required: true })}
                                className="col-span-2"
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
