import express from "express";
import { PrismaClient } from "@prisma/client";
import { setupRoutes } from "./_common/http/router";
import { ApartmentRepo } from "./_infra/repo/apartment/apartment.repo";
import { ApartmentQueryAdapter } from "./_infra/repo/apartment/apartment-query.adapter";
import dotenv from "dotenv";

// 환경변수 로드
dotenv.config({ path: ".env.dev" });

const PORT = parseInt(process.env.PORT || "3000", 10);
const prisma = new PrismaClient();

// 레포지토리 초기화
const apartmentRepo = ApartmentRepo(prisma);
const apartmentQueryAdapter = new ApartmentQueryAdapter(apartmentRepo);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

setupRoutes(app, apartmentQueryAdapter);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  },
);

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Apartments API: http://localhost:${PORT}/api/v2/apartments`);
});

process.on("SIGINT", async () => {
  console.log("\n Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
