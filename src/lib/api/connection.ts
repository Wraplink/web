export type ConnectionMode =
    | "smart"
    | "gaming"
    | "streaming";

export type ConnectionStatus = {
    connected: boolean;
    latency: number;
    packetLoss: number;
    primaryDns: string;
    secondaryDns: string;
    edge: string;
    region: string;
    country: string;
    load: number;
    mode: ConnectionMode;
};

export type DiagnosticType =
    | "ping"
    | "dns"
    | "route";

export type DiagnosticResult = {
    success: boolean;
    value: string;
    latency?: number;
};

export type ConnectionEvent = {
    id: string;
    type: "success" | "info" | "warning";
    title: string;
    time: string;
};

/* -------------------------------------------------------------------------- */
/* Mock state                                                                 */
/* -------------------------------------------------------------------------- */

/*
 * Frontend simulation only.
 *
 * BACKEND TODO:
 * Remove this state when the Go API is connected.
 */
let mockConnection: ConnectionStatus = {
    connected: false,
    latency: 0,
    packetLoss: 0,
    primaryDns: "10.10.10.10",
    secondaryDns: "10.10.20.20",
    edge: "DE-FRA-01",
    region: "Frankfurt",
    country: "Germany",
    load: 0,
    mode: "gaming",
};

let mockEvents: ConnectionEvent[] = [
    {
        id: "1",
        type: "info",
        title: "Connection initialized",
        time: "Just now",
    },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function delay(
    milliseconds = 400
): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(
            resolve,
            milliseconds
        );
    });
}

/* -------------------------------------------------------------------------- */
/* Connection status                                                          */
/* -------------------------------------------------------------------------- */

export async function getConnectionStatus(): Promise<ConnectionStatus> {
    /*
     * BACKEND TODO:
     *
     * GET /api/v1/connection/status
     */

    await delay(250);

    return {
        ...mockConnection,
    };
}

/* -------------------------------------------------------------------------- */
/* Connect                                                                    */
/* -------------------------------------------------------------------------- */

export async function connect(): Promise<void> {
    /*
     * BACKEND TODO:
     *
     * POST /api/v1/connection/connect
     */

    await delay(800);

    mockConnection = {
        ...mockConnection,
        connected: true,
        latency: 18,
        packetLoss: 0,
        edge: "DE-FRA-01",
        load: 22,
    };

    mockEvents = [
        {
            id: crypto.randomUUID(),
            type: "success",
            title: "Connected to DE-FRA-01",
            time: "Just now",
        },
        ...mockEvents,
    ];
}

/* -------------------------------------------------------------------------- */
/* Disconnect                                                                 */
/* -------------------------------------------------------------------------- */

export async function disconnect(): Promise<void> {
    /*
     * BACKEND TODO:
     *
     * POST /api/v1/connection/disconnect
     */

    await delay(500);

    mockConnection = {
        ...mockConnection,
        connected: false,
        latency: 0,
        packetLoss: 0,
        load: 0,
    };

    mockEvents = [
        {
            id: crypto.randomUUID(),
            type: "info",
            title: "Connection disconnected",
            time: "Just now",
        },
        ...mockEvents,
    ];
}

/* -------------------------------------------------------------------------- */
/* Connection mode                                                            */
/* -------------------------------------------------------------------------- */

export async function updateConnectionMode(
    mode: ConnectionMode
): Promise<void> {
    /*
     * BACKEND TODO:
     *
     * PUT /api/v1/connection/mode
     *
     * {
     *     "mode": mode
     * }
     */

    await delay(400);

    mockConnection = {
        ...mockConnection,
        mode,
    };
}

/* -------------------------------------------------------------------------- */
/* Diagnostics                                                                */
/* -------------------------------------------------------------------------- */

export async function runDiagnostic(
    type: DiagnosticType
): Promise<DiagnosticResult> {
    /*
     * BACKEND TODO:
     *
     * POST /api/v1/diagnostics/{type}
     */

    await delay(700);

    if (!mockConnection.connected) {
        return {
            success: false,
            value: "Connection is offline",
        };
    }

    switch (type) {
        case "ping":
            return {
                success: true,
                value: `${mockConnection.latency} ms`,
                latency:
                mockConnection.latency,
            };

        case "dns":
            return {
                success: true,
                value: "OK",
            };

        case "route":
            return {
                success: true,
                value: "Optimized",
            };
    }
}

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

export async function getConnectionEvents(): Promise<ConnectionEvent[]> {
    /*
     * BACKEND TODO:
     *
     * GET /api/v1/connection/events
     */

    await delay(200);

    return [...mockEvents];
}