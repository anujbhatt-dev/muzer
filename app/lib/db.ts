import { PrismaClient } from "../generated/prisma";

export const prismaClient = new PrismaClient();

// this is the best, introduce singleton