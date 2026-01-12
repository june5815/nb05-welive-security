import express from "express";
import { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: UserRole;
      apartmentId: string;
    }

    interface Request {
      userId?: string;
      user?: User;
    }
  }
}

export {};
