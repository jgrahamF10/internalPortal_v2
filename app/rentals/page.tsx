
import { DataTable } from "./data-table";
import { ColumnDef } from "@tanstack/react-table"

import { useState } from "react";
import { rentals, Rentals } from "@/db/schema/tracker_db";
import { db } from "@/db";
import { desc, asc } from "drizzle-orm";
import { getRentals } from "./rentalActions";

async function getData(): Promise<Rentals[]> {
    const data = await getRentals();
    console.log("data", data);
    return data;
}

export const columns: ColumnDef<Rentals>[] = [
    {
      accessorKey: "rentalAgreement",
      header: "Rental Agreement",
    },
    {
      accessorKey: "Driver",
      header: "Driver",
    },
    {
      accessorKey: "pickUpDate",
      header: "Amount",
    },
  ]

export default async function RentalDashboard() {
    const data = await getData();

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    );
}
