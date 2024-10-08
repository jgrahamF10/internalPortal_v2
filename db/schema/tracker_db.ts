import { relations } from "drizzle-orm";
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
    real,
    index
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { arch } from "os";
import { projects, members } from "./member_management";

export const vendors = pgEnum('vendors', ['Hertz', 'Enterprise', 'Uhaul', 'Other']);

export const rentals = pgTable("rental", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    projectId: integer("projectId"),
    memberId: integer("memberId").notNull(),
    rentalAgreement: varchar("rentalAgreement", { length: 20 }).unique('rentalAgreement').notNull(),
    reservation: varchar("reservation", { length: 20 }).notNull(),
    pickUpDate: date("rentalStartDate").notNull(),
    vehicleType: varchar("vehicleType",{ length: 20 }),
    vendors: vendors("vendors").notNull(),
    dueDate: date("dueDate").notNull(),
    returnDate: date("returnDate"),
    vehicleVin: varchar("vehicleVin", { length: 20 }),
    licensePlate: varchar("licensePlate", { length: 20 }),
    pickUpMileage: integer("pickUpMileage"),
    dropOffMileage: integer("dropOffMileage"),
    pickUpLocation: varchar("pickUpLocation", { length: 20 }).notNull(),
    returnLocation: varchar("returnLocation", { length: 20 }),
    canceled: boolean("canceled").default(false),
    tolls: real("tolls"),
    finalCharges: real("finalCharges"),
    verified: boolean("verified").default(false),
    archived: boolean("archived").default(false),
    createdDate: timestamp("createdAt", { mode: "date" }).notNull(),
}, (table) => ({
    idxRentalProjectId: index("idx_rental_projectId").on(table.projectId), 
    idxRentalMemberId: index("idx_rental_memberId").on(table.memberId),
    idxRentalPickUpDate: index("idx_rental_pickUpDate").on(table.pickUpDate),
}));

export const rentals2projects = relations(projects, ({ many }) => ({
    projectId: many(rentals)
}));

export const projects2rentals = relations(rentals, ({ one }) => ({
    projectID: one(projects, {
        fields: [rentals.projectId],
        references: [projects.id],
    })
}));

export const rentals2members = relations(members, ({ many }) => ({
    memberId: many(rentals)
}));

export const members2rentals = relations(rentals, ({ one }) => ({
    memberID: one(members, {
        fields: [rentals.memberId],
        references: [members.id],
    })
}));

export type Rentals = typeof rentals.$inferSelect;
export type NewRentals = typeof rentals.$inferInsert;

export const airlinesList = pgEnum('airlinesList', [
    'Alaska Airlines',
    'American Airlines',
    'Delta',
    'Frontier',
    'JetBlue',
    'Southwest',
    'Spirit',
    'United',
    'Other'
]);
  
export const flights = pgTable("flight", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    projectId: integer("projectId").notNull(),
    memberId: integer("memberId").notNull(),
    flightConfirmationNumber: varchar("flightConfirmationNumber", { length: 50 }).unique('flightConfirmationNumber').notNull(),
    tripType: varchar("tripType", { enum: ['One-Way', 'Round Trip',], length: 12 }).notNull(),
    airlines: airlinesList("airlines").notNull(),
    travelDate: date("travelDate").notNull(),
    returnDate: date("returnDate"),
    departureAirport: varchar("departureAirport", { length: 10 }).notNull(),
    arrivalAirport: varchar("arrivalAirport", { length: 10 }).notNull(),
    flightCost: real("flightCost").notNull(),
    baggageFee: real("baggageFee").notNull(),
    totalCost: real("totalCost").notNull(),
    cancelled: boolean("cancelled").default(false),
    creationDate: timestamp("creationDate", { mode: "date" }).notNull(),
    verified: boolean("verified").default(false),
    archived: boolean("archived").default(false),
}, (table) => ({
    idxFlightProjectId: index("idx_flight_projectId").on(table.projectId), 
    idxFlightMemberId: index("idx_flight_memberId").on(table.memberId),
    idxFlightTravelDate: index("idx_flight_travelDate").on(table.travelDate),
}));

export type Flights = typeof rentals.$inferSelect;
export type NewFlights = typeof rentals.$inferInsert;

export const flights2projects = relations(projects, ({ many }) => ({
    projectId: many(flights)
}));

export const projects2flights = relations(flights, ({ one }) => ({
    projectID: one(projects, {
        fields: [flights.projectId],
        references: [projects.id],
    })
}));

export const flights2members = relations(members, ({ many }) => ({
    memberId: many(flights)
}));

export const members2flights = relations(flights, ({ one }) => ({
    memberID: one(members, {
        fields: [flights.memberId], 
        references: [members.id],
    })
}));

export const creditTypes = pgEnum('creditTypes', ['Credit', 'Debit']);

export const flightCredits = pgTable("flightCredit", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    flightId: integer("flightId").notNull(),
    memberId: integer("memberId").notNull(),
    amount: real("amount").notNull(),
    creditType: creditTypes("creditType").notNull(),
    creator: varchar("creator", { length: 20 }).notNull(),
    archived: boolean("archived").default(false),
}, (table) => ({
    idxFlightCreditFlightId: index("idx_flightCredit_flightId").on(table.flightId),
    idxFlightCreditMemberId: index("idx_flightCredit_memberId").on(table.memberId),
}));

export type FlightCredits = typeof flightCredits.$inferSelect;
export type NewFlightCredits = typeof flightCredits.$inferInsert;

export const flight2flightCredits = relations(flightCredits, ({ one }) => ({
    flightId: one(flights, {
        fields: [flightCredits.flightId],
        references: [flights.id],
    })
}));

export const member2flightCredits = relations(flightCredits, ({ one }) => ({
    memberId: one(members, {
        fields: [flightCredits.memberId],
        references: [members.id],
    })  
}));

export const flightCredits2flights = relations(flights, ({ many }) => ({
    flightId: many(flightCredits)
}));

export const flightCredits2members = relations(members, ({ many }) => ({
    memberId: many(flightCredits)
}));

export const hotelChains = pgEnum('hotelChains', ['Hilton', 'Marriott', 'Holiday Inn', 'Other']);

export const hotelRezervations = pgTable("hotelRezervation", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    projectId: integer("projectId").notNull(),
    memberId: integer("memberId").notNull(),
    hotelConfirmationNumber: varchar("confirmationNumber", { length: 50 }).unique('hotelConfirmationNumber').notNull(),
    hotelChain: hotelChains("hotelChain").notNull(),
    arrivaDate: date("arrivaDate").notNull(),
    departureDate: date("departureDate").notNull(),
    hotelCity: varchar("hotelCity", { length: 100 }),
    hotelState: varchar("hotelState", { length: 100 }),
    finalcharges: real("finalcharges").notNull(),
    verified: boolean("verified").default(false),
    archived: boolean("archived").default(false),
}, (table) => ({
    idxHotelRezervationProjectId: index("idx_hotelRezervation_projectId").on(table.projectId), 
    idxHotelRezervationMemberId: index("idx_hotelRezervation_memberId").on(table.memberId),
}));

export type Hotels = typeof hotelRezervations.$inferSelect;
export type NewHotel = typeof hotelRezervations.$inferInsert;

export const hotelRezervations2projects = relations(projects, ({ many }) => ({
    projectId: many(hotelRezervations)
}));

export const projects2hotelRezervations = relations(hotelRezervations, ({ one }) => ({
    projectID: one(projects, {
        fields: [hotelRezervations.projectId],
        references: [projects.id],
    })
}));

export const hotelRezervations2members = relations(members, ({ many }) => ({
    memberId: many(hotelRezervations)
}));

export const members2hotelRezervations = relations(hotelRezervations, ({ one }) => ({
    memberID: one(members, {
        fields: [hotelRezervations.memberId],
        references: [members.id],
    })
}));

export const NoteType = pgEnum('AttatchmentType', ['Rental', 'Flight', 'Hotel']);

export const notes = pgTable(
    "note",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        parentId: integer("rentalId").notNull(),
        noteType: NoteType("noteType").notNull(),
        note: varchar("note", { length: 100 }).notNull(),
        noteAuthor: varchar("noteAuthor", { length: 20 }).notNull(),
        uploadDate: timestamp("uploadDate", { mode: "date" }).notNull(),
    },
);

export const notes2Rental = relations(notes, ({ one }) => ({
    rentalId: one(rentals, {
        fields: [notes.parentId],
        references: [rentals.id],
    })
}));

export const rental2Notes = relations(rentals, ({ many }) => ({
    parentId: many(notes)
}));

export const hotel2Notes = relations(hotelRezervations, ({ many }) => ({
    parentId: many(notes)
}));

export const note2Hotels = relations(notes, ({ one }) => ({
    parentId: one(hotelRezervations, {
        fields: [notes.parentId],
        references: [hotelRezervations.id],
    })
}));

export const flight2Notes = relations(notes, ({ many }) => ({
    parentId: many(notes)
}));    

export const note2Flights = relations(notes, ({ one }) => ({
    parentId: one(flights, {
        fields: [notes.parentId],
        references: [flights.id],
    })
}));

export type Notes = typeof notes.$inferSelect;
export type NewNotes = typeof notes.$inferInsert;

export const AttachmentType = pgEnum('AttatchmentType', ['Rental', 'Flight', 'Hotel']);

export const attachments = pgTable(
    "Attatchment",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        parentId: integer("parentId").notNull(),
        attachmentType: AttachmentType("attachmentType").notNull(),
        description: varchar("description", { length: 100 }).notNull(),
        uploadDate: timestamp("approvalDate", { mode: "date" }).notNull(),
        uploader: varchar("uploader", { length: 20 }).notNull(),
    },
    (table) => ({
        // Define indexes
        idxParentId: index("idx_parentId").on(table.parentId),
        idxAttachmentType: index("idx_attachmentType").on(table.attachmentType),
        idxParentAndType: index("idx_parentId_attachmentType").on(table.parentId, table.attachmentType),
    })
);

export const rental2RentalFile = relations(attachments, ({ one }) => ({
    rental: one(rentals, {
        fields: [attachments.parentId],
        references: [rentals.id],
    })
}));

export const flight2FlightFile = relations(attachments, ({ one }) => ({
    flight: one(flights, {
        fields: [attachments.parentId],
        references: [flights.id],
    })
}));

export const hotel2HotelFile = relations(attachments, ({ one }) => ({
    hotel: one(hotelRezervations, {
        fields: [attachments.parentId],
        references: [hotelRezervations.id],
    })
}));

export const hotelRez2File = relations(hotelRezervations, ({ many }) => ({
    attachments: many(attachments)
}));

export const flights2File = relations(flights, ({ many }) => ({
    attachments: many(attachments)
}));

export const rental2File = relations(rentals, ({ many }) => ({
    attachments: many(attachments)
}));

export type Attatchment = typeof attachments.$inferSelect;
export type NewAttatchment = typeof attachments.$inferInsert;
