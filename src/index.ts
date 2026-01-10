import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { configUtil } from "./shared/utils/config.util";
import { createApartmentRouter } from "./outbound/routes/apartment.router";

const config = configUtil();
const db = new PrismaClient();

const app = express();

app.use(express.json({ limit: config.parsed().JSON_LIMIT }));
app.use(express.urlencoded({ limit: config.parsed().JSON_LIMIT }));
app.use(cookieParser(config.parsed().COOKIE_SECRET));
app.use(
  cors({
    origin: config.parsed().CLIENT_DOMAIN,
    credentials: true,
  }),
);

app.use("/api/v2/apartments", createApartmentRouter(db));

const PORT = config.parsed().PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
