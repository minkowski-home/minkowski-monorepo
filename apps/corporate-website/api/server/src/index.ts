import "dotenv/config";

import cors from "cors";
import express from "express";

import { closeClient, getClient } from "./db/mongo";
import aiProxyRouter from "./routes/aiProxy";
import designTestRouter from "./routes/designTest";

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/design-test", designTestRouter);
app.use("/api/ai", aiProxyRouter);

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 8000);

const start = async (): Promise<void> => {
  await getClient();
  app.listen(port, () => {
    console.log(`Corporate website API listening on :${port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start API server", error);
  process.exit(1);
});

const shutdown = async (): Promise<void> => {
  await closeClient();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
