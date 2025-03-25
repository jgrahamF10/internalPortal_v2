import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type F10Vehicles, F10VehiclesRezs } from "@/db/schema/utilities_db";
import { getF10VechileRezById } from "@/app/vehicles/vehicleActions";

interface ReservationDetailsModalProps {
  reservation: F10VehiclesRezs
  onClose: () => void
}

export default function ReservationDetailsModal({ reservation, onClose }: ReservationDetailsModalProps) {
  const rez:any = reservation;

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
            <strong>Start:</strong> {new Date(rez.pickUpDate).toLocaleDateString()}
          </p>
          <p>
            <strong>End:</strong> {rez.returnDate ? new Date(rez.returnDate).toLocaleDateString() : 'No return date'}
          </p>
          <p>
            Created By {rez.creator}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

