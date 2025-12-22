import { Router } from "express";

const router = Router();

const AI_BASE_URL = process.env.AI_API_BASE_URL ?? "http://127.0.0.1:9000";

const forwardJson = async (
  path: string,
  init?: RequestInit
): Promise<{ status: number; body: unknown }> => {
  const response = await fetch(new URL(path, AI_BASE_URL), init);
  const body = await response.json();
  return { status: response.status, body };
};

router.get("/health", async (_req, res) => {
  try {
    const result = await forwardJson("/health");
    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(502).json({ detail: "AI service unavailable." });
  }
});

router.get("/agents", async (_req, res) => {
  try {
    const result = await forwardJson("/agents");
    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(502).json({ detail: "AI service unavailable." });
  }
});

router.post("/agents/:agentId/run", async (req, res) => {
  try {
    const result = await forwardJson(`/agents/${req.params.agentId}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body ?? {})
    });
    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(502).json({ detail: "AI service unavailable." });
  }
});

export default router;
