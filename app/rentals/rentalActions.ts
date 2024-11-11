"use server";
import { db } from "@/db";
import { members } from "@/db/schema/member_management";
import { notes, rentals, NewNote, NewAttatchment, NewRentals, attachments, Rentals } from "@/db/schema/tracker_db";
import { eq, ne, desc } from "drizzle-orm/expressions";

export async function getRentals() {
    const rentalData = await db.query.rentals.findMany({
        where: ne(rentals.archived, true),
        orderBy: [desc(rentals.pickUpDate)],
        with: {
            memberID: true,
            project: true,
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
            attachments: {
                where: eq(attachments.attachmentType, "Rental"),
            },
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

export async function createRental(data: NewRentals) {
    if (!data.memberId) {
        return "Driver";
    }
    try {
        await db.insert(rentals).values(data);
        return true;
    } catch (error: any) {
        console.error("Error creating tsa approval:", error);
        console.error("Error message:", error.message);
        return error.column;
    }
}

export async function updateRental(data: Rentals) {
    //console.log("createRental data", data);
    try {
        await db
            .update(rentals)
            .set(data)
            .where(eq(rentals.id, data.id));
    } catch (error: any) {
        console.error("Error creating tsa approval:", error.message);
        return error.column;
    }
}

export async function deleteAttachment(attachmentId: number) {
    //console.log("attachmentId", attachmentId);
    try {
        await db.delete(attachments).where(eq(attachments.id, attachmentId));
        return true;
    } catch (error) {
        console.error("Error deleting attatchment:", error);
        return false;
    }
}

