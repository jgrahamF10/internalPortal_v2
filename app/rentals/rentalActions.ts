"use server";
import { db } from "@/db";
import { members } from "@/db/schema/member_management";
import { rentals } from "@/db/schema/tracker_db";
import { eq, ne, desc } from "drizzle-orm/expressions";

export async function getRentals() {
    const rentalData = await db.query.rentals.findMany({
        where: ne(rentals.archived, true),
        //orderBy: [desc(rentals.createdDate)],
        with: {
            memberID: true,
        },
    });
    return rentalData;
}