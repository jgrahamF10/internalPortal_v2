import { desc, relations } from "drizzle-orm";
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
    index
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";


export const projects = pgTable("project", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    projectName: varchar("projectName", { length: 40 }).unique('projectName').notNull(),
    requiredTechnians: integer("requiredTechnians").default(1),
    inactive: boolean("inactive").default(false),
});

export type Projects = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const designation = pgEnum('designation', ['Employee', 'Contractor']);

export const stateChoice = pgEnum('stateChoice', ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
    'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
    'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
    'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']);

export const status = pgEnum('status', ['Active', 'Inactive', 'Do not Contact']);
export const intakeStatus = pgEnum('intakeStatus', ['In Progress', 'Failed', 'Approved']);

export const members = pgTable(
    "member",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        designation: designation("designation").notNull(),
        firstname: varchar("firstname", { length: 20 }).notNull(),
        lastname: varchar("lastname", { length: 20 }).notNull(),
        preferedName: varchar("preferedName", { length: 40 }).notNull(),
        dob: date("dob"),
        email: varchar("email", { length: 50 }).unique('email').notNull(),
        phone: varchar("phone", { length: 12 }).notNull(),
        address: varchar("address", { length: 40 }),
        city: varchar("city", { length: 40 }).notNull(),
        state: stateChoice("state").notNull(),
        zipcode: varchar("zipcode", { length: 10 }).notNull(),
        startDate: date("startDate"),
        status: status("status").default('Active').notNull(),
        enteredBy: varchar("enteredBy", { length: 20 }),
        intakeStatus: intakeStatus("intakeStatus").default('In Progress'),
        documentsCollected: boolean("documentsCollected").default(false),
        approvalDate: date("approvalDate").notNull(),
        updatedBy: varchar("updatedBy", { length: 20 }),
    },
    //(member) => ({
    //    compositePK: primaryKey({
    //        columns: [member.preferedName, member.lastname],
    //    }),
    //    columns: [member.preferedName, member.lastname],
    //}),
);

export type Members = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

export const bgStatus = pgEnum('bgStatus', ['In Progress', 'Failed', 'Completed']);

export const projectBGStatus = pgTable(
    'projectBGStatus', 
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        projectId: integer("projectId").notNull(),
        memberId: integer("memberId").notNull(),
        bgStatus: bgStatus("bgStatus").notNull(),
        documentsCollected: boolean("documentsCollected").default(false),
        submissionDate: date("submissionDate").notNull(),
        approvalDate: date("approvalDate"),
        updatedBy: varchar("updatedBy", { length: 20 }).notNull(),
    },
);

export type ProjectBGStatus = typeof projectBGStatus.$inferSelect;
export type NewProjectBGStatus = typeof projectBGStatus.$inferInsert;

export const project2BGstatus = relations(projectBGStatus, ({ one }) => ({
    project: one(projects, {
        fields: [projectBGStatus.projectId],
        references: [projects.id],
    })
}));

export const BgStatus2Project = relations(projects, ({ many }) => ({
    projectBgStatus: many(projectBGStatus)
}));

export const projectIntake2Member = relations(members, ({ many }) => ({
    ProjectIntake: many(projectBGStatus)
}));

export const member2ProjectIntake = relations(projectBGStatus, ({ one }) => ({
    member: one(members, {
        fields: [projectBGStatus.memberId],
        references: [members.id],
    })
}));


export const user_Attatchments = pgTable(
    "user_Attatchments",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        memberId: integer("memberId").notNull(),
        description: varchar("description", { length: 100 }).notNull(),
        resume: boolean("resume").default(false),
        uploadDate: timestamp("approvalDate", { mode: "date" }).notNull(),
        uploader: varchar("uploader", { length: 20 }).notNull(),
    },
);

export type User_Attatchments = typeof user_Attatchments.$inferSelect;
export type NewUser_Attatchments = typeof user_Attatchments.$inferInsert;

export const member2attachment = relations(user_Attatchments, ({ one }) => ({
    memberAttachment: one(members, {
        fields: [user_Attatchments.memberId],
        references: [members.id],
    })
}));

export const attatchments2members = relations(members, ({ many }) => ({
    attachment: many(user_Attatchments)
}));

export const memberNotes = pgTable(
    "memberNotes",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        memberId: integer("memberId").notNull(),
        note: varchar("note", { length: 100 }).notNull(),
        createdDate: timestamp("createdDate", { mode: "date" }).notNull(),
        enteredBy: varchar("enteredBy", { length: 20 }).notNull(),
    },
);

export type MemberNotes = typeof memberNotes.$inferSelect;
export type NewMemberNotes = typeof memberNotes.$inferInsert;

export const member2notes = relations(memberNotes, ({ one }) => ({
    MemberNotes: one(members, {
        fields: [memberNotes.memberId],
        references: [members.id],
    })
}));

export const memberNotes2members = relations(members, ({ many }) => ({
    Notes: many(memberNotes)
}));