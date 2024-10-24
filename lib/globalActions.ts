"use server";
import { db } from "@/db";
import { members } from "@/db/schema/member_management";
import { notes, attachments } from "@/db/schema/tracker_db";
import { eq, ne, desc } from "drizzle-orm/expressions";


export async function deleteAttachment(attachmentId: number) {
    console.log("attachmentId", attachmentId);
    try {
        await db.delete(attachments).where(eq(attachments.id, attachmentId));
        return true;
    } catch (error) {
        console.error("Error deleting attatchment:", error);
        return false;
    }
}

export async function deleteNote(noteId: number) {
    console.log("noteId", noteId);
    try {
        await db.delete(notes).where(eq(notes.id, noteId));
        return true;
    } catch (error) {
        console.error("Error deleting note:", error);
        return false;
    }
}