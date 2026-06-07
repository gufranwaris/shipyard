import { prisma } from "../lib/prisma";

export async function findDeploymentById(id: BigInt) {
    return prisma.deployment_entity.findUnique({
        where: { id },
        include: {
            project_entity: true
        }
    });
}

export async function updateDeploymentStatus(id: BigInt, status: string) {
    return prisma.deployment_entity.update({
        where: { id },
        data: { status }
    });
}