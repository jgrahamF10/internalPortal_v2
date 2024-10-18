"use server";
import { db } from "@/db";
import { members } from "@/db/schema/member_management";
import { notes, hotelRezervations, NewNote, NewAttatchment, NewHotel, attachments } from "@/db/schema/tracker_db";
import { eq, ne, desc } from "drizzle-orm/expressions";

export async function getReservations() {
    const rentalData = await db.query.hotelRezervations.findMany({
        where: ne(hotelRezervations.archived, true),
        orderBy: [desc(hotelRezervations.id)],
        with: {
            memberID: true,
        },
    });
    return rentalData;
}

export async function getRez(hotelConfirmationNumber: string) {
    const newRez = await db.query.hotelRezervations.findFirst({
        where: eq(hotelRezervations.hotelConfirmationNumber, hotelConfirmationNumber),
        with: {
            memberID: true,
            hotelNotes: true,
            project: true,
            attachments: {
                where: eq(attachments.attachmentType, "Hotel"),
            },
        },
    });
    if (newRez) {
        return newRez;
    }
    else
    { return null; }
    
}

export async function createRezNote(data: NewNote) {
    try {
        await db.insert(notes).values(data);
    } catch (error) {
        console.error("Error creating note:", error);
    }
}

export async function createRez(data: NewHotel) {
    //console.log("createRez data", data);
    try {
        await db.insert(hotelRezervations).values(data);
    } catch (error) {
        console.error("Error creating rental:", error);
    }
}

export async function updateRez(data: NewHotel) {
    //console.log("createRental data", data);
    try {
        await db
            .update(hotelRezervations)
            .set(data)
            .where(eq(hotelRezervations.hotelConfirmationNumber, data.hotelConfirmationNumber));
    } catch (error) {
        console.error("Error updating rental:", error);
    }
}

export async function deleteAttachment(attachmentId: number) {
    console.log("attachmentId", attachmentId);
    try {
        await db.delete(attachments).where(eq(attachments.id, attachmentId));
        return true;
    } catch (error) {
        console.error("Error deleting resume:", error);
        return false;
    }
}