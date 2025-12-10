# Runbook: Corporate API Latency Spikes

1. Verify alert payload from `observability/alerts/high-latency.yaml`.
2. Check `kubectl get pods -n apps` and restart unhealthy pods.
3. Compare API logs for slow queries; redeploy if regression traced to latest
   commit.
