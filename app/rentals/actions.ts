"use server";
import { db } from "@/db";
import { rentals } from "@/db/schema/tracker_db";
import { eq, ne, desc } from "drizzle-orm/expressions";

export async function getRentals() {
    const rentalData = await db.query.rentals.findMany({
        where: ne(rentals.archived, true),
        orderBy: [desc(rentals.createdDate)],
    });
    return rentalData;
}