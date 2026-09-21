"use client";

import {useEffect, useRef, useState} from "react";

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

export function useConnectionRealtime({
                                          enabled = true
                                      }: Options = {}) {

    const [state, setState] =
        useState<ConnectionRealtimeState>({
            connected: true,
            latency: 18,
            packetLoss: 0,
            edge: "DE-FRA-01",
            load: 22
        });

    const intervalRef =
        useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {

        if (!enabled) {
            return;
        }

        /*
         * ============================================================
         * BACKEND TODO
         * ============================================================
         *
         * Replace this mock interval with a real WebSocket or SSE.
         *
         * WebSocket:
         *
         * const socket = new WebSocket(
         *     "wss://api.wraplink.com/api/v1/connection/stream"
         * );
         *
         * socket.onmessage = (event) => {
         *     const data = JSON.parse(event.data);
         *     setState(data);
         * };
         *
         * Expected backend event:
         *
         * {
         *     "connected": true,
         *     "latency": 18,
         *     "packetLoss": 0,
         *     "edge": "DE-FRA-01",
         *     "load": 22
         * }
         *
         * ============================================================
         */

        intervalRef.current = setInterval(() => {

            setState((current) => {

                if (!current.connected) {
                    return current;
                }

                const latency =
                    Math.max(
                        10,
                        Math.min(
                            80,
                            current.latency +
                            Math.floor(
                                Math.random() * 9
                            ) - 4
                        )
                    );

                const packetLoss =
                    Math.random() > 0.92
                        ? Number(
                            (
                                Math.random() * 0.5
                            ).toFixed(2)
                        )
                        : 0;

                const load =
                    Math.max(
                        5,
                        Math.min(
                            95,
                            current.load +
                            Math.floor(
                                Math.random() * 7
                            ) - 3
                        )
                    );

                return {
                    ...current,
                    latency,
                    packetLoss,
                    load
                };
            });

        }, 3000);

        return () => {

            if (intervalRef.current) {
                clearInterval(
                    intervalRef.current
                );
            }

        };

    }, [enabled]);

    return state;
}