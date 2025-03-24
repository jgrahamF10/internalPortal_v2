"use server";
import { db } from "@/db";
import { and, eq, sql, asc, desc, gte, lte, inArray } from "drizzle-orm";
import {
    flights,
    rentals,
    hotelRezervations,
} from "@/db/schema/tracker_db";

export async function getTasks(techids: any) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const techidsArray = Array.isArray(techids) ? techids : (techids ? [techids] : []);

    const rentalsData = await db.query.rentals.findMany({
        where: and(
            eq(rentals.archived, false),
            inArray(rentals.memberId, techidsArray),
            sql`EXTRACT(MONTH FROM ${rentals.pickUpDate}) = ${currentMonth}`,
            sql`EXTRACT(YEAR FROM ${rentals.pickUpDate}) = ${currentYear}`
        ),
        with: {
            memberID: true,
            project: true,
        },
    });

    const flightsData = await db.query.flights.findMany({
        where: and(
            eq(flights.archived, false),
            inArray(flights.memberId, techidsArray),
            sql`EXTRACT(MONTH FROM ${flights.travelDate}) = ${currentMonth}`,
            sql`EXTRACT(YEAR FROM ${flights.travelDate}) = ${currentYear}`
        ),
        with: {
            project: true,
        },
    });

    const hotelData = await db.query.hotelRezervations.findMany({
        where: and(
            eq(hotelRezervations.archived, false),
            inArray(hotelRezervations.memberId, techidsArray),
            sql`EXTRACT(MONTH FROM ${hotelRezervations.arrivalDate}) = ${currentMonth}`,
            sql`EXTRACT(YEAR FROM ${hotelRezervations.arrivalDate}) = ${currentYear}`
        ),
        with: {
            project: true,
        },
    });
    console.log("hotelData", hotelData, '\n', "rentalsData", rentalsData, '\n', "flightsData", flightsData);
    // Map rentals data
    const mappedRentals = rentalsData.map((item) => ({
        id: `rental-${item.id}`, // Prefix to ensure unique IDs
        title: `Car Rental: ${item.rentalAgreement || 'Unknown'}`,
        date: new Date(item.pickUpDate),
        description: `Car rental pick up in : ${item.pickUpLocation || 'No details provided'}`
    }));
    
    // Map flights data
    const mappedFlights = flightsData.map((item) => ({
        id: `flight-${item.id}`,
        title: `Flight: ${item.tripType || 'Unknown'} to ${item.arrivalAirport || ''}`,
        date: new Date(item.travelDate),
        description: `Flight from ${item.departureAirport || 'Unknown'} to ${item.arrivalAirport || ''}`
    }));
    
    // Map hotel data
    const mappedHotels = hotelData.map((item) => ({
        id: `hotel-${item.id}`,
        title: `Hotel: ${item.hotelState || 'Unknown'}`,
        date: new Date(item.arrivalDate),
        description: `Hotel stay at ${item.hotelState || 'Unknown'} from ${new Date(item.arrivalDate).toLocaleDateString()} to ${new Date(item.departureDate).toLocaleDateString()}`
    }));
    
    // Combine all data
    const combinedData = [...mappedRentals, ...mappedFlights, ...mappedHotels];
    console.log("combinedData", combinedData);
    return combinedData;
}