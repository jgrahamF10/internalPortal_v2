import { relations, sql } from "drizzle-orm";
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
    index,
    unique,
    numeric,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { projects, members } from "./member_management";

export const vendors = pgEnum("vendors", [
    "Hertz",
    "Enterprise",
    "Uhaul",
    "Other",
]);

export const rentals = pgTable(
    "rental",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        projectId: integer("projectId"),
        memberId: integer("memberId").notNull(),
        rentalAgreement: varchar("rentalAgreement", { length: 40 })
            .unique("rentalAgreement")
            .notNull(),
        reservation: varchar("reservation", { length: 40 }).notNull(),
        pickUpDate: date("rentalStartDate").notNull(),
        vehicleType: varchar("vehicleType", { length: 30 }),
        vendors: vendors("vendors").notNull(),
        dueDate: date("dueDate").notNull(),
        returnDate: date("returnDate"),
        vehicleVin: varchar("vehicleVin", { length: 40 }),
        licensePlate: varchar("licensePlate", { length: 20 }),
        pickUpMileage: integer("pickUpMileage"),
        dropOffMileage: integer("dropOffMileage"),
        pickUpLocation: varchar("pickUpLocation", { length: 40 }).notNull(),
        returnLocation: varchar("returnLocation", { length: 40 }),
        canceled: boolean("canceled").default(false),
        tolls: numeric("tolls", { precision: 12, scale: 2 }),
        finalCharges: numeric("finalCharges", { precision: 12, scale: 2 }),
        verified: boolean("verified").default(false),
        archived: boolean("archived").default(false),
        createdDate: timestamp("createdAt", { mode: "date" }).notNull(),
        lastUpdated: timestamp("lastUpdated", { mode: "date" }),
        lastUpdatedBy: varchar("lastUpdatedBy", { length: 20 }),
    },
    (table) => ({
        idxRentalProjectId: index("idx_rental_projectId").on(table.projectId),
        idxRentalMemberId: index("idx_rental_memberId").on(table.memberId),
        idxRentalPickUpDate: index("idx_rental_pickUpDate").on(
            table.pickUpDate
        ),
    })
);

export const rentals2projects = relations(projects, ({ many }) => ({
    project: many(rentals),
}));

export const projects2rentals = relations(rentals, ({ one }) => ({
    project: one(projects, {
        fields: [rentals.projectId],
        references: [projects.id],
    }),
}));

export const rentals2members = relations(members, ({ many }) => ({
    memberId: many(rentals),
}));

export const members2rentals = relations(rentals, ({ one }) => ({
    memberID: one(members, {
        fields: [rentals.memberId],
        references: [members.id],
    }),
}));

export type Rentals = typeof rentals.$inferSelect;
export type NewRentals = typeof rentals.$inferInsert;

export const airline = pgTable("airline", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    airlines: varchar("airlines", { length: 50 }).unique("airlines").notNull(),
    inactive: boolean("inactive").default(false),
});

export type AirlinesList = typeof airline.$inferSelect;
export type NewAirlinesList = typeof airline.$inferInsert;

export const flights = pgTable(
    "flight",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        projectId: integer("projectId").notNull(),
        memberId: integer("memberId").notNull(),
        flightConfirmationNumber: varchar("flightConfirmationNumber", {
            length: 50,
        })
            .unique("flightConfirmationNumber")
            .notNull(),
        tripType: varchar("tripType", {
            enum: ["One-Way", "Round Trip"],
            length: 12,
        }).notNull(),
        airlinesID: integer("airlinesID").notNull(),
        travelDate: date("travelDate").notNull(),
        returnDate: date("returnDate"),
        departureAirport: varchar("departureAirport", { length: 10 }).notNull(),
        arrivalAirport: varchar("arrivalAirport", { length: 10 }).notNull(),
        flightCost: numeric("flightCost", {
            precision: 12,
            scale: 2,
        }).notNull(),
        baggageFee: numeric("baggageFee", {
            precision: 12,
            scale: 2,
        }).notNull(),
        totalCost: numeric("totalCost", { precision: 12, scale: 2 }).notNull(),
        verified: boolean("verified").default(false),
        archived: boolean("archived").default(false),
        canceled: boolean("canceled").default(false),
        lastUpdated: timestamp("lastUpdated", { mode: "date" }),
        lastUpdatedBy: varchar("lastUpdatedBy", { length: 20 }),
        createdDate: timestamp("createdDate", { mode: "date" }).notNull(),
    },
    (table) => ({
        idxFlightProjectId: index("idx_flight_projectId").on(table.projectId),
        idxFlightMemberId: index("idx_flight_memberId").on(table.memberId),
        idxFlightTravelDate: index("idx_flight_travelDate").on(
            table.travelDate
        ),
    })
);

export type Flights = typeof flights.$inferSelect;
export type NewFlights = typeof flights.$inferInsert;

export const flights2projects = relations(projects, ({ many }) => ({
    projectId: many(flights),
}));

export const projects2flights = relations(flights, ({ one }) => ({
    project: one(projects, {
        fields: [flights.projectId],
        references: [projects.id],
    }),
}));

export const flights2members = relations(members, ({ many }) => ({
    memberId: many(flights),
}));

export const members2flights = relations(flights, ({ one }) => ({
    members: one(members, {
        fields: [flights.memberId],
        references: [members.id],
    }),
}));

export const flights2airlines = relations(airline, ({ many }) => ({
    flights: many(flights),
}));

export const airlines2flights = relations(flights, ({ one }) => ({
    airlines: one(airline, {
        fields: [flights.airlinesID],
        references: [airline.id],
    }),
}));

export const flightCredits = pgTable("flightCredit", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    flightId: integer("flightId").notNull(),
    memberId: integer("memberId").notNull(),
    airlinesID: integer("airlinesID").notNull().default(16),
    amount: real("amount").notNull(),
    expirationDate: date("expirationDate"),
    creator: varchar("creator", { length: 20 }).notNull(),
    used: boolean("used").default(false),
    archived: boolean("archived").default(false),
});

export type FlightCredits = typeof flightCredits.$inferSelect;
export type NewFlightCredits = typeof flightCredits.$inferInsert;

export const member2flightCredits = relations(flightCredits, ({ one }) => ({
    member: one(members, {
        fields: [flightCredits.memberId],
        references: [members.id],
    }),
}));
export const flightCredits2members = relations(members, ({ many }) => ({
    memberFlightCredit: many(flightCredits),
}));

export const credits2Flight = relations(flightCredits, ({ one }) => ({
    flight: one(flights, {
        fields: [flightCredits.flightId],
        references: [flights.id],
    }),
}));

export const flights2credits = relations(flights, ({ many }) => ({
    credits: many(flightCredits),
}));

export const flightCredits2flights = relations(flights, ({ many }) => ({
    flightCredit: many(flightCredits),
}));



export const creditUsage = pgTable(
    "creditUsage",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        creditId: integer("creditId"),
        flightId: integer("flightId").notNull(),
        memberId: integer("memberId"),
        amount: real("amount").notNull(),
        creator: varchar("creator", { length: 20 }).notNull(), 
        createdDate: timestamp("createdDate", { mode: "date" }).notNull(),
    },
    (table) => ({
        idxFlightCreditFlightId: index("idx_flightCredit_flightId").on(
            table.creditId
        ),
        idxFlightCreditMemberId: index("idx_flightCredit_memberId").on(
            table.memberId
        ),
    })
);

export type CreditUsage = typeof creditUsage.$inferSelect;
export type NewCreditUsage = typeof creditUsage.$inferInsert;

export const Credit2CreditUsage = relations(creditUsage, ({ one }) => ({
    creditUsage: one(flightCredits, {
        fields: [creditUsage.creditId],
        references: [flightCredits.id],
    }),
}));

export const creditUsage2flightCredits = relations(flightCredits, ({ many }) => ({
    creditUsage: many(creditUsage),
}));





export const hotelBrands = pgTable("hotelBrands", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    hotelName: varchar("hotelName", { length: 50 })
        .unique("hotelName")
        .notNull(),
    inactive: boolean("inactive").default(false),
});

export type HotelChains = typeof hotelBrands.$inferSelect;
export type NewHotelChains = typeof hotelBrands.$inferInsert;

export const hotelRezervations = pgTable(
    "hotelRezervation",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        projectId: integer("projectId").notNull(),
        memberId: integer("memberId").notNull(),
        hotelConfirmationNumber: varchar("confirmationNumber", { length: 50 })
            .unique("hotelConfirmationNumber")
            .notNull(),
        hotelChainId: integer("hotelChainId").notNull(),
        arrivalDate: date("arrivalDate").notNull(),
        departureDate: date("departureDate").notNull(),
        hotelCity: varchar("hotelCity", { length: 100 }),
        hotelState: varchar("hotelState", { length: 100 }),
        finalCharges: numeric("finalCharges", { precision: 12, scale: 2 }),
        canceled: boolean("canceled").default(false),
        verified: boolean("verified").default(false),
        archived: boolean("archived").default(false),
        createdDate: timestamp("createdDate", { mode: "date" }).notNull(),
        lastUpdated: timestamp("lastUpdated", { mode: "date" }),
        lastUpdatedBy: varchar("lastUpdatedBy", { length: 20 }),
    },
    (table) => ({
        idxHotelRezervationProjectId: index(
            "idx_hotelRezervation_projectId"
        ).on(table.projectId),
        idxHotelRezervationMemberId: index("idx_hotelRezervation_memberId").on(
            table.memberId
        ),
    })
);

export type Hotels = typeof hotelRezervations.$inferSelect;
export type NewHotel = typeof hotelRezervations.$inferInsert;

export const hotelRezervations2projects = relations(projects, ({ many }) => ({
    rez: many(hotelRezervations),
}));

export const projects2hotelRezervations = relations(
    hotelRezervations,
    ({ one }) => ({
        project: one(projects, {
            fields: [hotelRezervations.projectId],
            references: [projects.id],
        }),
    })
);

export const hotelRezervations2members = relations(members, ({ many }) => ({
    memberId: many(hotelRezervations),
}));

export const members2hotelRezervations = relations(
    hotelRezervations,
    ({ one }) => ({
        memberID: one(members, {
            fields: [hotelRezervations.memberId],
            references: [members.id],
        }),
    })
);

export const hotelChains2hotelRezervations = relations(
    hotelRezervations,
    ({ one }) => ({
        hotelChain: one(hotelBrands, {
            fields: [hotelRezervations.hotelChainId],
            references: [hotelBrands.id],
        }),
    })
);

export const hotelReservations2hotelChains = relations(
    hotelBrands,
    ({ many }) => ({
        hotelRez: many(hotelRezervations),
    })
);

export const NoteType = pgEnum("AttatchmentType", [
    "Rental",
    "Flight",
    "Hotel",
]);

export const notes = pgTable(
    "note",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        parentId: integer("parentId").notNull(),
        noteType: NoteType("noteType").notNull(),
        note: varchar("note", { length: 1000 }).notNull(),
        noteAuthor: varchar("noteAuthor", { length: 20 }).notNull(),
        createdDate: timestamp("createdDate", { mode: "date" }).notNull(),
    },
    (table) => {
        return {
            indexParentNoteType: index("idx_parent_note_type").on(
                table.parentId,
                table.noteType
            ),
            unq: unique("unq_parent_note_type").on(
                table.parentId,
                table.noteType, 
                table.note
            ),
        };
    }
);

export const notes2Rental = relations(notes, ({ one }) => ({
    rental: one(rentals, {
        fields: [notes.parentId],
        references: [rentals.id],
    }),
}));

export const rental2Notes = relations(rentals, ({ many }) => ({
    rentalNotes: many(notes),
}));

export const note2Hotels = relations(notes, ({ one }) => ({
    hotel: one(hotelRezervations, {
        fields: [notes.parentId],
        references: [hotelRezervations.id],
    }),
}));

export const hotel2Notes = relations(hotelRezervations, ({ many }) => ({
    hotelNotes: many(notes),
}));

export const note2Flights = relations(notes, ({ one }) => ({
    flight: one(flights, {
        fields: [notes.parentId],
        references: [flights.id],
    }),
}));

export const flight2Notes = relations(flights, ({ many }) => ({
    flightNotes: many(notes),
}));

export type Notes = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export const AttachmentType = pgEnum("AttatchmentType", [
    "Rental",
    "Flight",
    "Hotel",
]);

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
        idxParentAndType: index("idx_parentId_attachmentType").on(
            table.id,
            table.parentId,
            table.attachmentType
        ),
        unq: unique("unq_parent_type").on(
            table.parentId,
            table.attachmentType,
            table.description
        ),
    })
);

export const rental2RentalFile = relations(attachments, ({ one }) => ({
    rental: one(rentals, {
        fields: [attachments.parentId],
        references: [rentals.id],
    }),
}));

export const flight2FlightFile = relations(attachments, ({ one }) => ({
    flight: one(flights, {
        fields: [attachments.parentId],
        references: [flights.id],
    }),
}));

export const hotel2HotelFile = relations(attachments, ({ one }) => ({
    hotel: one(hotelRezervations, {
        fields: [attachments.parentId],
        references: [hotelRezervations.id],
    }),
}));

export const hotelRez2File = relations(hotelRezervations, ({ many }) => ({
    attachments: many(attachments),
}));

export const flights2File = relations(flights, ({ many }) => ({
    attachments: many(attachments),
}));

export const rental2File = relations(rentals, ({ many }) => ({
    attachments: many(attachments),
}));

export type Attatchment = typeof attachments.$inferSelect;
export type NewAttatchment = typeof attachments.$inferInsert;
