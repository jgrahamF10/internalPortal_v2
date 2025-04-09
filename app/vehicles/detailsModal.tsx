import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { type F10Vehicles, F10VehiclesRezs } from "@/db/schema/utilities_db";
import { getF10VechileRezById, deleteVehRez } from "@/app/vehicles/vehicleActions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TrashOutline } from "@/components/icons/trash";

interface ReservationDetailsModalProps {
    reservation: F10VehiclesRezs;
    onClose: () => void;
}

function DeleteRez({ noteId }: { noteId: number }) {
    async function confirmDelete() {
        try {
            await deleteVehRez(noteId);
        } catch (error) {
            console.error("Error deleting project approval:", error);
        } finally {
            window.location.reload();
        }
    }
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="bg-transparent hover:bg-transparent">
                    <TrashOutline className="text-red-400 h-4 w-4 hover:text-red-600" />{" "}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete this note.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-green-500 hover:bg-green-600">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-700 hover:bg-red-500"
                        onClick={confirmDelete}
                    >
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function ReservationDetailsModal({
    reservation,
    onClose,
}: ReservationDetailsModalProps) {
    const rez: any = reservation;

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reservation Details</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <p>
                        <strong>Vehicle:</strong> {rez?.vehicle?.vehicleName}
                    </p>
                    <p>
                        <strong>Driver:</strong> {rez?.driver}
                    </p>
                    <p>
                        <strong>Usage:</strong> {rez?.reason}
                    </p>
                    <p>
                        <strong>Start:</strong>{" "}
                        {new Date(rez.pickUpDate).toLocaleDateString()}
                    </p>
                    <p>
                        <strong>End:</strong>{" "}
                        {rez.returnDate
                            ? new Date(rez.returnDate).toLocaleDateString()
                            : "No return date"}
                    </p>
                    <div className="flex justify-between">
                        <div>Created By {rez.creator}</div>{" "}
                        <div className=""><DeleteRez noteId={rez.id} /></div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
