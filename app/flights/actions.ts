"use server";
import { db } from "@/db";
import { members } from "@/db/schema/member_management";
import {
    notes,
    NewNote,
    NewAttatchment,
    flights,
    NewFlightCredits,
    flightCredits,
    FlightCredits,
    creditUsage,
    NewFlights,
    attachments,
    NewCreditUsage,
    Flights,
    airline,
} from "@/db/schema/tracker_db";
import { sql } from "drizzle-orm";
import { eq, ne, desc, asc, and } from "drizzle-orm/expressions";

export async function getFlights() {
    const data = await db.query.flights.findMany({
        where: ne(flights.archived, true),
        orderBy: [desc(flights.id)],
        with: {
            members: true,
            airlines: true,
            project: true,
            credits: true
        },
    });
    return data;
}

export async function getFlight(hotelConfirmationNumber: string) {
    const rezData = await db.query.flights.findFirst({
        where: eq(flights.flightConfirmationNumber, hotelConfirmationNumber),
        
        with: {
            members: {
                with: {
                    memberFlightCredit: {
                        where: and(
                            eq(flightCredits.flightId, flights.id),
                            eq(flightCredits.memberId, flights.memberId)
                        ),
                    } 
                },
                columns: {
                    id: true,
                    firstname: true,
                    lastname: true, 
                },
                extras: {
                    technician: sql<string>`concat(${members.firstname}, ' ', ${members.lastname})`.as('technician'),
                    },
            },
            project: true,
            flightNotes: {
                where: eq(notes.noteType, "Flight"),
            },
            airlines: true,
            attachments: {
                where: eq(attachments.attachmentType, "Flight"),
            },
        },
    });
    if (rezData) {
        // console.log("rezData", rezData.airlinesID);
        const withCredits = await db.query.flightCredits.findMany({
            where: and(
                eq(flightCredits.flightId, rezData.id),
                eq(flightCredits.memberId, rezData.memberId),
                eq(flightCredits.used, false),
            ),
            with: {
                creditUsage: true,
            }
            
        });
        // console.log("withCredits", withCredits);
        return { ...rezData, credits: withCredits };
    } else {
        return null;
    }
}

export async function createFlightNote(data: NewNote) {
    try {
        await db.insert(notes).values(data);
    } catch (error) {
        console.error("Error creating note:", error);
    }
}

export async function createFlight(data: NewFlights) {
    console.log("createRez data", data);
    try {
        await db.insert(flights).values(data);
    } catch (error) {
        console.error("Error creating rental:", error);
    }
}

export async function updateFLight(data: NewFlights) {
    //console.log("updating flight data", data);
    try {
        await db
            .update(flights)
            .set(data)
            .where(
                eq(
                    flights.flightConfirmationNumber,
                    data.flightConfirmationNumber
                )
            );
    } catch (error) {
        console.error("Error updating rental:", error);
    }
}

export async function deleteAttachment(attachmentId: number) {
    //console.log("attachmentId", attachmentId);
    try {
        await db.delete(attachments).where(eq(attachments.id, attachmentId));
        return true;
    } catch (error) {
        console.error("Error deleting resume:", error);
        return false;
    }
}

export async function getAirlines() {
    const airlineList = await db.query.airline.findMany({
        where: ne(airline.inactive, true),
        orderBy: [asc(airline.airlines)],
    });
    return airlineList;
}

export async function getFlightCredits(flightId: number) {
    const results = await db.query.flightCredits.findMany({
        where: eq(flightCredits.flightId, flightId),
        with: {
            credit: true,
            member: true,
        },
    });
    return results;
}

export async function createFlightCredits(data: NewFlightCredits) {
    //console.log("createFlightCredits data", data);
    try {
        await db.insert(flightCredits).values(data);
    } catch (error) {
        console.error("Error creating flight credits:", error);
    }
}

export async function applyFlightCredit(data: NewCreditUsage) {
    //console.log("createFlightCredits data", data);
    try {
        await db.insert(creditUsage).values(data);
    } catch (error) {
        console.error("Error creating flight credits:", error);
    }
}

export async function getAllFLightCredits() {
    const creditData = await db.query.flightCredits.findMany({
        with: {
            flight: {
                with: {
                    airlines: true,
                },

            },
            member: {
                columns: {
                    firstname: true,
                    lastname: true,
                    
                }
            }
        },
    });
    return creditData;
}