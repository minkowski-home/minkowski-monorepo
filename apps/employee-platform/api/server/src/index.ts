import "dotenv/config";

import cors from "cors";
import express from "express";

import aiProxyRouter from "./routes/aiProxy";

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

app.use("/api/ai", aiProxyRouter);

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 8002);

app.listen(port, () => {
  console.log(`Employee platform API listening on :${port}`);
});
