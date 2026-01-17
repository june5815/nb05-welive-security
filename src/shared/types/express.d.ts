import { UserRole } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      [x: string]: any;
      id: string;
      apartmentId: string;
    }

    interface Request {
      prismaClient: PrismaClient;
      user?: User;
    }
  }
}

export {};
