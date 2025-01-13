import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { applyFlightCredit } from "./actions";
import { zodResolver } from "@hookform/resolvers/zod";

interface ApplyCreditProps {
    credit: number;
    onNoteCreated: () => void;
    creatingUser: string;
    flightNum: number;
    creditOwnerID: number;
    creditId: number;
}

const FormSchema = z.object({
    amount: z.preprocess((val) => {
        if (typeof val === "string") {
            return parseFloat(val) || 0;
        }
        return val || 0;
    }, z.number().min(0)),
});
export default function ApplyCredit({
    credit,
    onNoteCreated,
    creatingUser,
    flightNum,
    creditOwnerID,
    creditId,
}: ApplyCreditProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<z.infer<typeof FormSchema>>({
        defaultValues: {
            amount: 0,
        },
        mode: "onTouched",
        resolver: zodResolver(FormSchema),
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        console.log("form Values", values);
        try {
            const currentDate = new Date();
            const creditData = {
                ...values,
                flightId: flightNum,
                createdDate: currentDate,
                creator: creatingUser,
                creditId: creditId,
                memberId: creditOwnerID,
            };
            console.log("creditUsage", creditData);
            await applyFlightCredit(creditData);
            onNoteCreated();
            reset();
        } catch (error) {
            console.error("Error creating flight credits:", error);
        }
    }

    return (
        <div className="grid gap-4">
            <div className="space-y-2">
                <h4 className="font-medium leading-none">Apply Credit</h4>
                <p className="text-sm text-muted-foreground">
                    Available credits: ${credit}
                </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            className="col-span-2 h-8"
                            type="number"
                            {...register("amount")}
                            placeholder="Enter Amount"
                        />
                        {errors.amount && (
                            <p className="text-red-500 text-sm">
                                {errors.amount.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="bg-green-700 text-white hover:bg-green-800 hover:text-black"
                    >
                        Apply
                    </Button>
                </div>
            </form>
        </div>
    );
}
