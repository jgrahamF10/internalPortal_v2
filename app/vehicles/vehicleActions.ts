"use server";
import { db } from "@/db";
import { and, eq, sql, asc, desc, gte, lte } from "drizzle-orm";
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
    console.log("createF10VechileRez data", data);
    try {
        await db.insert(f10VehiclesRezs).values(data);
        return true;
    } catch (error: any) {
        console.log("Error F10 vehicle checkout:", error);
        console.log("Error message:", error.message);
        return error.message;
    }
}