"use client"

import { SetStateAction, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export default function Component() {
  const [filterTerm, setFilterTerm] = useState("")
  const handleFilterChange = (event: { target: { value: SetStateAction<string> } }) => {
    setFilterTerm(event.target.value)
  }
  const filteredData = [
    {
      reservationNumber: "12345",
      pickUpDate: "2023-06-01",
      vehicleType: "Sedan",
      vendor: "Acme Car Rentals",
      returnDate: "2023-06-08",
      vehicleVIN: "1HGCM82633A123456",
      pickUpLocation: "123 Main St, Anytown USA",
      returnLocation: "456 Oak Rd, Anytown USA",
    },
    {
      reservationNumber: "67890",
      pickUpDate: "2023-07-15",
      vehicleType: "SUV",
      vendor: "XYZ Car Rentals",
      returnDate: "2023-07-22",
      vehicleVIN: "2HKRW2H33H4567890",
      pickUpLocation: "789 Elm St, Othertown USA",
      returnLocation: "321 Pine Rd, Othertown USA",
    },
    {
      reservationNumber: "54321",
      pickUpDate: "2023-08-01",
      vehicleType: "Minivan",
      vendor: "Mega Car Rentals",
      returnDate: "2023-08-08",
      vehicleVIN: "3GKALMEV4HG123456",
      pickUpLocation: "159 Oak St, Somewhere USA",
      returnLocation: "753 Maple Rd, Somewhere USA",
    },
    {
      reservationNumber: "98765",
      pickUpDate: "2023-09-01",
      vehicleType: "Pickup Truck",
      vendor: "Big Car Rentals",
      returnDate: "2023-09-08",
      vehicleVIN: "4JGDA5HB1HA123456",
      pickUpLocation: "357 Elm St, Elsewhere USA",
      returnLocation: "951 Pine Rd, Elsewhere USA",
    },
  ].filter(
    (item) =>
      item.reservationNumber.includes(filterTerm) ||
      item.pickUpDate.includes(filterTerm) ||
      item.vehicleType.toLowerCase().includes(filterTerm.toLowerCase()) ||
      item.vendor.toLowerCase().includes(filterTerm.toLowerCase()) ||
      item.returnDate.includes(filterTerm) ||
      item.vehicleVIN.includes(filterTerm) ||
      item.pickUpLocation.toLowerCase().includes(filterTerm.toLowerCase()) ||
      item.returnLocation.toLowerCase().includes(filterTerm.toLowerCase()),
  )
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Car Rental Information</CardTitle>
        <CardDescription>View details of your car rental reservations.</CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Filter reservations..."
          value={filterTerm}
          onChange={handleFilterChange}
          className="mb-4"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reservation #</TableHead>
              <TableHead>Pick Up Date</TableHead>
              <TableHead>Vehicle Type</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Return Date</TableHead>
              <TableHead>Vehicle VIN</TableHead>
              <TableHead>Pick Up Location</TableHead>
              <TableHead>Return Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.reservationNumber}</TableCell>
                <TableCell>{item.pickUpDate}</TableCell>
                <TableCell>{item.vehicleType}</TableCell>
                <TableCell>{item.vendor}</TableCell>
                <TableCell>{item.returnDate}</TableCell>
                <TableCell>{item.vehicleVIN}</TableCell>
                <TableCell>{item.pickUpLocation}</TableCell>
                <TableCell>{item.returnLocation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}