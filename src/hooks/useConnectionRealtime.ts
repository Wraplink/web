"use client";

export type ConnectionRealtimeState = {
    connected: boolean;
    latency: number;
    packetLoss: number;
    edge: string;
    load: number;
};

type Options = {
    enabled?: boolean;
};

// Realtime edge telemetry is not exposed by the current backend/control-plane
// contract yet. Return neutral values instead of manufacturing latency/load.
export function useConnectionRealtime({
    enabled = true,
}: Options = {}): ConnectionRealtimeState {
    return {
        connected: enabled,
        latency: 0,
        packetLoss: 0,
        edge: enabled
            ? "Managed by DNS Control"
            : "-",
        load: 0,
    };
}
