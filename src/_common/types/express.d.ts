import express from "express";
import { PrismaClient, UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: UserRole;
      apartmentId?: string;
    }

    interface Request {
      prismaClient: PrismaClient;
      user?: User;
      userId?: string;
      userRole?: UserRole;

      apartmentId?: string;
    }
  }
}

export {};
