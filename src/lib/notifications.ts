"use client";

export type NotificationType =
    | "order"
    | "payment"
    | "support"
    | "security"
    | "system";

export type Notification = {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
};

const KEY = "wraplink_notifications";

const defaults: Notification[] = [];
/*    {
        id: "1",
        type: "order",
        title: "Order Activated",
        message: "Your Pro Plan is now active.",
        createdAt: "5 min ago",
        read: false,
    },
    {
        id: "2",
        type: "payment",
        title: "Payment Received",
        message: "Wallet payment completed successfully.",
        createdAt: "1 hour ago",
        read: false,
    },
    {
        id: "3",
        type: "support",
        title: "Support Reply",
        message: "A new reply was added to your ticket.",
        createdAt: "Yesterday",
        read: true,
    },
];*/

export function getNotifications(): Notification[] {
    if (typeof window === "undefined")
        return defaults;

    const raw =
        localStorage.getItem(KEY);

    if (!raw) {
        localStorage.setItem(
            KEY,
            JSON.stringify(defaults)
        );
        return defaults;
    }

    return JSON.parse(raw);
}

export function saveNotifications(
    items: Notification[]
) {
    localStorage.setItem(
        KEY,
        JSON.stringify(items)
    );
}

export function unreadCount() {
    return getNotifications().filter(
        (n) => !n.read
    ).length;
}

export function markRead(id: string) {
    const items = getNotifications().map(
        (n) =>
            n.id === id
                ? {...n, read: true}
                : n
    );

    saveNotifications(items);
}

export function markAllRead() {
    saveNotifications(
        getNotifications().map((n) => ({
            ...n,
            read: true,
        }))
    );
}