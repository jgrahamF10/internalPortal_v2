import { addDays, startOfDay } from "date-fns"

export interface Vehicle {
  id: string
  name: string
  use: string
}

export interface Reservation {
  id: string
  vehicleId: string
  start: Date
  end: Date
  title: string
}

export const vehicles: Vehicle[] = [
  { id: "1", name: "Toyota Camry", use: "Sedan" },
  { id: "2", name: "Ford F-150", use: "Truck" },
  { id: "3", name: "Honda CR-V", use: "SUV" },
]

export const generateReservations = (count: number): Reservation[] => {
  const reservations: Reservation[] = []
  const today = startOfDay(new Date())

  for (let i = 0; i < count; i++) {
    const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]
    const start = addDays(today, Math.floor(Math.random() * 30))
    const end = addDays(start, Math.floor(Math.random() * 3) + 1)

    reservations.push({
      id: `reservation-${i + 1}`,
      vehicleId: vehicle.id,
      start,
      end,
      title: `${vehicle.name} Reservation`,
    })
  }

  return reservations
}

export const getVehicleById = (id: string): Vehicle | undefined => {
  return vehicles.find((vehicle) => vehicle.id === id)
}

