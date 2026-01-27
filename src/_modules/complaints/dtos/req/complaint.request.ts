import { z } from "zod";

export const createComplaintReqSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER"]),
  body: z.object({
    title: z.string(),
    content: z.string(),
    isPublic: z.boolean(),
    apartmentId: z.string(),
  }),
});

export const getComplaintListReqSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  query: z.object({
    page: z.coerce.number(),
    limit: z.coerce.number(),
  }),
});

export const complaintIdParamSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  params: z.object({
    complaintId: z.string(),
  }),
});

export const updateComplaintReqSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER"]),
  params: z.object({
    complaintId: z.string(),
  }),
  body: z.object({
    title: z.string(),
    content: z.string(),
    isPublic: z.boolean(),
  }),
});

export const updateComplaintStatusReqSchema = z.object({
  userId: z.string(),
  role: z.enum(["ADMIN"]),
  params: z.object({
    complaintId: z.string(),
  }),
  body: z.object({
    status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED"]),
  }),
});
