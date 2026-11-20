# Full Route status in Admin Network

The Full Route column in Admin → Network uses the backend agent inventory endpoint `GET /api/v1/admin/network/agents`.

| UI state | Current condition |
| --- | --- |
| Offline | Agent heartbeat is stale (`online=false`) |
| Disabled | Agent is online but reports `routeCapacity=0` |
| Unavailable | Agent is online with route capacity, but has no enabled registered routing IP (or an older backend lacks status reporting) |
| Provisioned (unverified) | Agent is online with route capacity and at least one enabled registered routing IP |
| — | DNS controller row; not an Edge Agent |

**Important:** “Provisioned (unverified)” is **not** an end-to-end forwarding check. It only indicates a recent heartbeat and nonzero configured capacity. A public route IP, nftables DNAT rules, forwarding configuration, and successful traffic flow are not verified by this column.

## Follow-up health protocol

The Edge Agent currently calls `POST /api/v1/internal/network/agents/register` with `agent_id`, `region`, and `capacity`, and `POST /api/v1/internal/network/agents/heartbeat` with `agent_id`. Extend the authenticated heartbeat with explicit Full Route enablement, dataplane readiness, route IP inventory health, and an observed health timestamp. Persist and expose these fields through the backend agent inventory API, then update the UI to distinguish disabled, degraded, and fully operational states. Treat absent health fields from older agents as **unknown**, not healthy.

No new environment variables are required for the current UI-only change.
