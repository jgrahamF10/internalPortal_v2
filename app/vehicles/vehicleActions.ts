"use server";
import { db } from "@/db";
import { and, eq, sql, asc, or, gte, lte } from "drizzle-orm";
import { f10Vehicles, f10VehiclesRezs, NewF10VehiclesRezs } from "@/db/schema/utilities_db";

export async function getF10Vehicles() {
    const vehicles = await db.query.f10Vehicles.findMany();
    return vehicles;
}

export async function getF10VehiclesRezs() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const RezData = await db.query.f10VehiclesRezs.findMany({
        where: gte(f10VehiclesRezs.pickUpDate, thirtyDaysAgo.toISOString()),
        with: {
            vehicle: true,
        },
    });
    return RezData;
}

export async function getF10VechileRezById(id: number) {
    const RezData = await db.query.f10VehiclesRezs.findFirst({
        where: eq(f10VehiclesRezs.id, id),
        with: {
            vehicle: true,
        },
    });
    return RezData;
}

export async function createF10VechileRez(data: NewF10VehiclesRezs) {
    try {
        const overlappingBookings = await db.select()
            .from(f10VehiclesRezs)
            .where(
                and(
                    eq(f10VehiclesRezs.vehicle_id, data.vehicle_id),
                    or(
                        and(
                            lte(f10VehiclesRezs.pickUpDate, data.pickUpDate),
                            gte(f10VehiclesRezs.returnDate || sql`'infinity'::date`, data.pickUpDate)
                        ),
                        and(
                            lte(f10VehiclesRezs.pickUpDate, data.returnDate || sql`'infinity'::date`),
                            gte(f10VehiclesRezs.returnDate || sql`'infinity'::date`, data.returnDate || sql`'infinity'::date`)
                        ),
                        and(
                            gte(f10VehiclesRezs.pickUpDate, data.pickUpDate),
                            lte(f10VehiclesRezs.returnDate || sql`'infinity'::date`, data.returnDate || sql`'infinity'::date`)
                        )
                    )
                )
            );

        if (overlappingBookings.length > 0) {
            return "Vehicle is already booked during this period";
        }

        // If no overlapping bookings, proceed with insertion
        await db.insert(f10VehiclesRezs).values(data);
        return true;
    } catch (error: any) {
        console.log("Error F10 vehicle checkout:", error);
        console.log("Error message:", error.message);
        return error.message;
    }
}

export async function deleteVehRez(rezId: number) {
    console.log("rezId", rezId);
    try {
        await db.delete(f10VehiclesRezs).where(eq(f10VehiclesRezs.id, rezId));
        return true;
    } catch (error) {
        console.error("Error deleting vehicle checkout:", error);
        return false;
    }
}