import { relations, sql } from "drizzle-orm";
import { year } from "drizzle-orm/mysql-core";
import {
    boolean,
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    bigserial,
    pgEnum,
    varchar,
    date,
    interval
} from "drizzle-orm/pg-core";
import { start } from "repl";


export const f10Vehicles = pgTable("f10_vehicle",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        vehicleName: varchar("vehicleName", { length: 20 }).notNull(),
        year: interval("year", { fields: "year" }).notNull(),
        licensePlate: varchar("licensePlate", { length: 10 }).notNull(),
        color: varchar("color", { length: 10 }).notNull(),
    }
);

export const f10VehiclesRezs = pgTable("f10VehiclesRez",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        vehicle_id: integer("vehicle_id").notNull(),
        pickUpDate: date("rentalStartDate").notNull(),
        returnDate: date("returnDate"),
        driver: varchar("driver", { length: 20 }).notNull(),
        reason: varchar("reason", { length: 20 }).notNull(),
        creator: varchar("creator", { length: 20 }).notNull(),
        createdDate: timestamp("createdDate", { mode: "date" }).notNull(),
    }
);

export const rez2vehicles = relations(f10Vehicles, ({ many }) => ({
    checkOuts: many(f10VehiclesRezs),
}));

export const vehicle2rez = relations(f10VehiclesRezs,({ one }) => ({
    vehicle: one(f10Vehicles, {
        fields: [f10VehiclesRezs.vehicle_id],
        references: [f10Vehicles.id],
    }),
}));