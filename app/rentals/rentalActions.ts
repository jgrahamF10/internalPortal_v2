"use server";
import { db } from "@/db";
import { members } from "@/db/schema/member_management";
import { notes, rentals, NewNote } from "@/db/schema/tracker_db";
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

export async function getRental(rentalAgreement: string) {
    const rentalData = await db.query.rentals.findFirst({
        where: eq(rentals.rentalAgreement, rentalAgreement),
        with: {
            memberID: true,
            rentalNotes: true,
            project: true,
        },
    });
    if (rentalData) {
        return rentalData;
    }
    else
    { return null; }
    
}

export async function createRentalNote(data: NewNote) {
    try {
        await db.insert(notes).values(data);
    } catch (error) {
        console.error("Error creating note:", error);
    }
}