"use client";
import React, { useEffect, useState } from "react";
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
import { updateProject, getProject } from "@/app/hr/hrActions"; // Add updateProject and getProject functions
import { Projects } from "@/db/schema/member_management";

interface EditProjectFormProps {
    errorStatusChange: (status: boolean) => void;
    projectName: string;
}

export function EditProjectForm({
    errorStatusChange,
    projectName,
}: EditProjectFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<Projects>();

    const [project, setProject] = useState<Projects | null>(null); // Use null to represent the initial state

    useEffect(() => {
        async function fetchData() {
            const fetchedProject = await getProject(projectName);
            if (fetchedProject) {
                setProject(fetchedProject);
                reset(fetchedProject); // Reset form with fetched project data
            }
        }
        fetchData();
    }, [projectName, reset]);

    const onSubmit: SubmitHandler<Projects> = async (data) => {
        console.log("data", data);
        try {
            const result = await updateProject(data); // Update the existing project

            if (!result) {
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
                <Button variant={"destructive"} className="hover:text-black">
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>{`Edit ${projectName}`}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                className="text-right"
                                htmlFor="requiredTechnians"
                            >
                                Required Techs
                            </Label>
                            <input
                                {...register("requiredTechnians", {
                                    valueAsNumber: true,
                                })} // Ensures value is treated as a number
                                type="number" // Specifies that the input is for numbers
                                className="col-span-1"
                                id="requiredTechnians"
                                defaultValue={project?.requiredTechnians || 0} // Set default value as a number
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right" htmlFor="inactive">
                                Inactive
                            </Label>
                            <input
                                {...register("inactive")}
                                type="checkbox"
                                className="col-span-1"
                                id="inactive"
                                defaultChecked={!!project?.inactive} // Set checkbox based on fetched data
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="submit">Update</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
