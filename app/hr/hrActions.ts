"use server";
import { db } from "@/db";
import {
    members,
    projectBGStatus,
    projects,
    memberNotes,
    NewMemberNotes,
    NewProjectBGStatus,
    NewProject,
    NewMember,
    Members,
    TsaApprovals,
    TsaNotes,
    tsaApprovals,
    tsaNotes,
    NewTsaApprovals,
    NewTsaNotes,
    user_Attachments
} from "@/db/schema/member_management";
import { and, eq, sql, asc, desc } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import exp from "constants";
import { attachments } from "@/db/schema/tracker_db";

export async function getProjects() {
    const fetchedProjects = await db.query.projects.findMany({
        with: {
            projectBgStatus: {
                members: true,
            },
        },
        orderBy: asc(projects.projectName),
    });
    return fetchedProjects;
}

export async function getRoster() {
    const allMembers = await db.query.members.findMany({
        orderBy: asc(members.preferedName),
    });
    return allMembers;
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
            tsaApproval: true,
            attachment: true,
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
        // console.log("results", results);
        return results[0].id;
    } else {
        return null;
    }
}

export async function createMember(data: NewMember) {
    try {
        await db.insert(members).values(data);
    } catch (error) {
        console.error("Error creating member:", error);
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
    //const userName = await getMemberUserName(data.memberId);
    //console.log("userName", userName);
    try {
        await db.insert(projectBGStatus).values(data);
    } catch (error) {
        console.error("Error creating note:", error);
    }
}

export async function updateProjectApproval(data: any) {
    try {
        await db
            .update(projectBGStatus)
            .set(data)
            .where(eq(projectBGStatus.id, data.intakeId));
        return true;
    } catch (error) {
        console.error("Error creating note:", error);
        return false;
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

export async function createProject(data: NewProject) {
    try {
        await db.insert(projects).values(data);
        return true;
    } catch (error) {
        console.error("Error creating note:", error);
        return false;
    }
}

export async function updateProject(data: NewProject) {
    //console.log("updating project", data.projectName);
    try {
        await db
            .update(projects)
            .set(data)
            .where(eq(projects.projectName, data.projectName));
        return true;
    } catch (error) {
        console.error("Error updating project:", error);
        return false;
    }
}

export async function getProject(projectName: string) {
    const result = await db.query.projects.findFirst({
        where: eq(projects.projectName, projectName),
    });
    //console.log("results", results);
    if (result) {
        return result;
    } else {
        return null;
    }
}

export async function getApprovedTechs(projectName: string) {
    const projectData = await db.query.projects.findFirst({
        where: eq(projects.projectName, projectName)   
    });
    if (!projectData) {
        return [];
    }
    const results = await db.query.projectBGStatus.findMany({
        where: and(
            eq(projectBGStatus.projectId, projectData.id),
            eq(projectBGStatus.bgStatus, "Completed")
        ),
        with: {
            member: true,
        },
    });
    //console.log("results", results);
    return { project: projectData, technicians: results };
}

export async function editMember(data: Members) {
   //console.log("data", data);
    try {
        await db
            .update(members)
            .set(data)
            .where(eq(members.id, data.id));
        return true;
    } catch (error) {
        console.error("Error updating member:", error);
        return false;
    }
}

export async function deleteProjectApproval(projectId: number) {
    try {
        await db.delete(projectBGStatus).where(eq(projectBGStatus.id, projectId));
        return true;
    } catch (error) {
        console.error("Error deleting project approval:", error);
        return false;
    }
}

export async function deleteAttachment(resumeId: number) {
    //console.log("resumeId", resumeId);
    try {
        await db.delete(user_Attachments).where(eq(user_Attachments.id, resumeId));
        return true;
    } catch (error) {
        console.error("Error deleting resume:", error);
        return false;
    }
}


export async function getTsaApprovals() {
    const tsaData = await db.query.tsaApprovals.findMany({
        orderBy: [desc(tsaApprovals.id)],
        with: {
            member: true,
            tsaNotes: true,
        },
    });
    return tsaData;
}

export async function getTsaApproval(memberId: number) {
    const tsaData = await db.query.tsaApprovals.findFirst({
        where: eq(tsaApprovals.memberId, memberId),
        with: {
            member: true,
            tsaNotes: true,
        },
    });
    return tsaData;
}

export async function createTsaApproval(data: NewTsaApprovals) {
    //console.log("createTsaApproval data", data);
    try {
        await db.insert(tsaApprovals).values(data);
        return true;
    } catch (error: any) {
        console.error("Error creating tsa approval:", error.message);
        return error.column;
    }
}
    
export async function updateTsaApproval(data: TsaApprovals) {
    //console.log("updateTsaApproval data", data);
    try {
        await db
            .update(tsaApprovals)
            .set(data)
            .where(eq(tsaApprovals.id, data.id));
        return true;
    } catch (error: any) {
        console.error("Error creating tsa approval:", error.message);
        return error.column;
    }
}

export async function flTechs() {
    const allMembers = await db.query.members.findMany({
        where: and(
            eq(members.state, "Florida"),
            eq(members.designation, "Contractor"),
            eq(members.status, "Active")
        ),
        orderBy: asc(members.preferedName),
    });
    return allMembers;
}


export async function TechMap(selectedState: "Alabama" | "Alaska" | "Arizona" | "Arkansas" | "California" | "Colorado" | "Connecticut" | "Delaware" | "Florida" | "Georgia" | "Hawaii" | "Idaho" | "Illinois" | "Indiana" | "Iowa" | "Kansas" | "Kentucky" | "Louisiana" | "Maine" | "Maryland" | "Massachusetts" | "Michigan" | "Minnesota" | "Mississippi" | "Missouri" | "Montana" | "Nebraska" | "Nevada" | "New Hampshire" | "New Jersey" | "New Mexico" | "New York" | "North Carolina" | "North Dakota" | "Ohio" | "Oklahoma" | "Oregon" | "Pennsylvania" | "Rhode Island" | "South Carolina" | "South Dakota" | "Tennessee" | "Texas" | "Utah" | "Vermont" | "Virginia" | "Washington" | "West Virginia" | "Wisconsin" | "Wyoming") {
    const allMembers = await db.query.members.findMany({
        where: and(
            eq(members.state, selectedState),
            eq(members.designation, "Contractor"),
            eq(members.status, "Active")
        ),
        orderBy: asc(members.preferedName),
    });
    return allMembers;
}