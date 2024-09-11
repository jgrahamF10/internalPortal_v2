"use server";
import { db } from "@/db";
import {
    members,
    projectBGStatus,
    projects,
    memberNotes,
} from "@/db/schema/member_management";
import { and, eq, sql, asc } from "drizzle-orm";
import {
    NewMemberNotes,
    NewProjectBGStatus,
} from "@/db/schema/member_management";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function getProjects() {
    const fetchedProjects = await db.query.projects.findMany({
        orderBy: asc(projects.projectName),
    });
    return fetchedProjects;
}

export async function getRoster() {
    const members = await db.query.members.findMany({});
    return members;
}

export async function getMemberUserName(memberId: number) {
    const results = await db.query.members.findMany({
        where: eq(members.id, memberId),
    });
    if (results) {
        return results[0].preferedName + "-" + results[0].lastname;
    } else {
        return null;
    }
}

export async function getMember(id: string) {
    const preferedName = id.split("-")[0];
    const lastname = id.split("-")[1];
    //const results = await db.select().from(members).where(sql`${members.preferedName} = ${preferedName} and ${members.lastname} = ${lastname}`).execute();
    const results = await db.query.members.findMany({
        where: and(
            eq(members.preferedName, preferedName),
            eq(members.lastname, lastname)
        ),
        with: {
            Notes: true,
            ProjectIntake: {
                with: {
                    project: true,
                },
            },
        },
    });
    //console.log("results", results);
    if (results) {
        return results[0];
    } else {
        return null;
    }
}

export async function getMemberId(username: string) {
    const preferedName = username.split("-")[0];
    const lastname = username.split("-")[1];
    const results = await db.query.members.findMany({
        where: and(
            eq(members.preferedName, preferedName),
            eq(members.lastname, lastname)
        ),
    });
    if (results) {
        return results[0].id;
    } else {
        return null;
    }
}

export async function getMemberNotes(memberId: number) {
    const results = await db.query.memberNotes.findMany({
        where: eq(members.id, memberId),
    });
    if (results) {
        return results[0];
    } else {
        return null;
    }
}

export async function createNote(data: NewMemberNotes) {
    const userName = await getMemberUserName(data.memberId);
    //console.log("userName", userName);
    try {
        await db.insert(memberNotes).values(data);
    } catch (error) {
        console.error("Error creating note:", error);
    }
}

export async function NewProjectApproval(data: NewProjectBGStatus) {
    const userName = await getMemberUserName(data.memberId);
    //console.log("userName", userName);
    try {
        await db.insert(projectBGStatus).values(data);
    } catch (error) {
        console.error("Error creating note:", error);
    }
}

export async function updateProjectApproval(data: NewProjectBGStatus) {
    //console.log("userName", userName);
    try {
        await db
            .update(projectBGStatus)
            .set(data)
            .where(eq(projectBGStatus.memberId, data.memberId));
    } catch (error) {
        console.error("Error creating note:", error);
    }
}

export async function getProjectIntake(id: number) {
    const results = await db.query.projectBGStatus.findMany({
        where: eq(projectBGStatus.id, id),
        with: {
            project: true,
        },
    });
    if (results) {
        return results[0];
    } else {
        return null;
    }
}