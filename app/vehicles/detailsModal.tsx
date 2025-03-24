import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type Reservation, getVehicleById } from "@/lib/reservationUtils"

interface ReservationDetailsModalProps {
  reservation: Reservation
  onClose: () => void
}

export default function ReservationDetailsModal({ reservation, onClose }: ReservationDetailsModalProps) {
  const vehicle = getVehicleById(reservation.vehicleId)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reservation Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p>
            <strong>Vehicle:</strong> {vehicle?.name}
          </p>
          <p>
            <strong>Usage:</strong> {vehicle?.type}
          </p>
          <p>
            <strong>Start:</strong> {reservation.start.toLocaleDateString()}
          </p>
          <p>
            <strong>End:</strong> {reservation.end.toLocaleDateString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

