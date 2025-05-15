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



export function NewProjecForm({ errorStatusChange, project }: { errorStatusChange: any, project: boolean }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<NewProject>();
    let title = "Create a new  a Project";
    let name = "Project";
    let show = true;

    if (project != true) {
        title = "Create a New Clearance";
        name = "Clearance";
        show = false;
    } 

    const onSubmit: SubmitHandler<NewProject> = async (data) => {
        if (project == true) {
            data.isClearance = false;
        } else {
            data.isClearance = true;
        }
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
                <Button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-800 dark:bg-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 26 26"><path fill="currentColor" d="M22.438-.063c-.375 0-.732.17-1.032.47l-.718.687l4.218 4.218l.688-.718c.6-.6.6-1.494 0-2.094L23.5.406c-.3-.3-.688-.469-1.063-.469zM20 1.688l-1.094.907l4.5 4.5l1-1zm-1.688 1.625l-9.03 8.938a1 1 0 0 0-.126.125l-.062.031a1 1 0 0 0-.219.438l-1.219 4.281a.975.975 0 0 0 1.219 1.219l4.281-1.219a.98.98 0 0 0 .656-.531l8.876-8.782L21 6v.094l-1.188-1.188h.094l-1.593-1.593zM.813 4A1 1 0 0 0 0 5v20a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V14a1 1 0 1 0-2 0v10H2V6h10a1 1 0 1 0 0-2H1a1 1 0 0 0-.094 0a1 1 0 0 0-.094 0zm9.813 9.813l1.375.093l.094 1.5l-1.375.406l-.531-.53z"></path></svg>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
            
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right" htmlFor="name">
                                {name}
                            </Label>
                            <Input
                                {...register("projectName", {
                                    required: true,
                                    setValueAs: (v: string) => v.trim(),
                                })}
                                className="col-span-2"
                                id="name"
                                placeholder="Enter a project name"
                            />
                        </div>
                        {show && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right" htmlFor="requiredTechnians">
                                    Required Technicians 
                                </Label>
                                <Input
                                    {...register("requiredTechnians", { required: false })}
                                    className="col-span-2"
                                    id="requiredTechnians"
                                    type="number"
                                    placeholder="How many technicians are required for this project"
                                    defaultValue={0}
                                />
                            </div>
                        )}
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
