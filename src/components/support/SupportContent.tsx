"use client";

import {
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    Clock3,
    MessageSquare,
    Plus,
    Send,
    Ticket,
    XCircle,
} from "lucide-react";
import {useState} from "react";
import {useTranslations} from "next-intl";

type TicketStatus =
    | "open"
    | "pending"
    | "resolved"
    | "closed";

type Priority =
    | "low"
    | "medium"
    | "high";

type SupportMessage = {
    id: string;
    sender: "user" | "support";
    message: string;
    date: string;
};

type SupportTicket = {
    id: string;
    subject: string;
    category: string;
    priority: Priority;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
    messages: SupportMessage[];
};

const initialTickets: SupportTicket[] = [];
/*[
    {
        id: "#TKT-1001",
        subject: "Connection is slower than usual",
        category: "Connection",
        priority: "high",
        status: "open",
        createdAt: "2026-09-18",
        updatedAt: "2026-09-19",
        messages: [
            {
                id: "m1",
                sender: "user",
                message:
                    "My connection has become slower than usual since yesterday.",
                date: "2026-09-18 20:15",
            },
            {
                id: "m2",
                sender: "support",
                message:
                    "Thanks for reporting this. We are checking the edge server and routing configuration.",
                date: "2026-09-19 08:30",
            },
        ],
    },
    {
        id: "#TKT-1002",
        subject: "Wallet payment question",
        category: "Billing",
        priority: "medium",
        status: "pending",
        createdAt: "2026-09-16",
        updatedAt: "2026-09-17",
        messages: [
            {
                id: "m3",
                sender: "user",
                message:
                    "I made a wallet payment but the balance has not updated.",
                date: "2026-09-16 13:20",
            },
            {
                id: "m4",
                sender: "support",
                message:
                    "Please allow us some time to verify the transaction.",
                date: "2026-09-17 09:10",
            },
        ],
    },
    {
        id: "#TKT-1003",
        subject: "Static IP configuration",
        category: "Technical",
        priority: "low",
        status: "resolved",
        createdAt: "2026-09-10",
        updatedAt: "2026-09-11",
        messages: [
            {
                id: "m5",
                sender: "user",
                message:
                    "I need help configuring my static IP.",
                date: "2026-09-10 16:40",
            },
            {
                id: "m6",
                sender: "support",
                message:
                    "Your static IP has been configured successfully.",
                date: "2026-09-11 10:05",
            },
        ],
    },
];*/

/*
 * ========================================================
 * BACKEND TODO
 * ========================================================
 *
 * Future Go API:
 *
 * GET    /api/v1/support/tickets
 * POST   /api/v1/support/tickets
 * GET    /api/v1/support/tickets/{id}
 * POST   /api/v1/support/tickets/{id}/messages
 * POST   /api/v1/support/tickets/{id}/close
 *
 * Future attachment API:
 *
 * POST   /api/v1/support/tickets/{id}/attachments
 *
 * Replace initialTickets with API data.
 * ========================================================
 */

export default function SupportContent() {
    const t = useTranslations("SupportPage");

    const [tickets, setTickets] =
        useState<SupportTicket[]>(initialTickets);

    const [selectedId, setSelectedId] =
        useState<string | null>(null);

    const [showCreate, setShowCreate] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [subject, setSubject] =
        useState("");

    const [category, setCategory] =
        useState("technical");

    const [priority, setPriority] =
        useState<Priority>("medium");

    const selectedTicket = tickets.find(
        (ticket) => ticket.id === selectedId
    );

    const statusClass = (status: TicketStatus) => {
        switch (status) {
            case "open":
                return "border-cyan-400/30 bg-cyan-400/10 text-cyan-400";

            case "pending":
                return "border-yellow-400/30 bg-yellow-400/10 text-yellow-400";

            case "resolved":
                return "border-green-400/30 bg-green-400/10 text-green-400";

            case "closed":
                return "border-red-400/30 bg-red-400/10 text-red-400";
        }
    };

    const priorityClass = (value: Priority) => {
        switch (value) {
            case "low":
                return "text-gray-400";

            case "medium":
                return "text-yellow-400";

            case "high":
                return "text-red-400";
        }
    };

    const statusIcon = (status: TicketStatus) => {
        switch (status) {
            case "open":
                return <MessageSquare size={14}/>;

            case "pending":
                return <Clock3 size={14}/>;

            case "resolved":
                return <CheckCircle2 size={14}/>;

            case "closed":
                return <XCircle size={14}/>;
        }
    };

    const createTicket = () => {
        if (!subject.trim()) {
            return;
        }

        const newTicket: SupportTicket = {
            id: `#TKT-${1000 + tickets.length + 1}`,
            subject: subject.trim(),
            category,
            priority,
            status: "open",
            createdAt: "Today",
            updatedAt: "Today",
            messages: [],
        };

        setTickets((current) => [
            newTicket,
            ...current,
        ]);

        setSubject("");
        setCategory("technical");
        setPriority("medium");
        setShowCreate(false);
        setSelectedId(newTicket.id);

        /*
         * BACKEND TODO:
         *
         * POST /api/v1/support/tickets
         */
    };

    const sendMessage = () => {
        if (!selectedTicket || !message.trim()) {
            return;
        }

        const newMessage: SupportMessage = {
            id: `m-${Date.now()}`,
            sender: "user",
            message: message.trim(),
            date: "Just now",
        };

        setTickets((current) =>
            current.map((ticket) =>
                ticket.id === selectedTicket.id
                    ? {
                        ...ticket,
                        status: "open",
                        updatedAt: "Just now",
                        messages: [
                            ...ticket.messages,
                            newMessage,
                        ],
                    }
                    : ticket
            )
        );

        setMessage("");

        /*
         * BACKEND TODO:
         *
         * POST
         * /api/v1/support/tickets/{id}/messages
         */
    };

    const closeTicket = () => {
        if (!selectedTicket) {
            return;
        }

        setTickets((current) =>
            current.map((ticket) =>
                ticket.id === selectedTicket.id
                    ? {
                        ...ticket,
                        status: "closed",
                        updatedAt: "Just now",
                    }
                    : ticket
            )
        );

        /*
         * BACKEND TODO:
         *
         * POST /api/v1/support/tickets/{id}/close
         */
    };

    if (selectedTicket) {
        return (
            <section className="min-h-screen px-6 py-16">
                <div className="mx-auto max-w-5xl">

                    <button
                        type="button"
                        onClick={() => setSelectedId(null)}
                        className="mb-8 flex items-center gap-2 text-sm text-gray-400 transition hover:text-cyan-400"
                    >
                        <ChevronLeft size={18}/>
                        {t("backToTickets")}
                    </button>

                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <span className="font-mono text-sm text-cyan-400">
                                    {selectedTicket.id}
                                </span>

                                <span
                                    className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${statusClass(selectedTicket.status)}`}
                                >
                                    {statusIcon(selectedTicket.status)}
                                    {t(
                                        `status.${selectedTicket.status}`
                                    )}
                                </span>

                                <span
                                    className={`text-xs font-medium ${priorityClass(selectedTicket.priority)}`}
                                >
                                    {t(
                                        `priority.${selectedTicket.priority}`
                                    )}
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold">
                                {selectedTicket.subject}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                {selectedTicket.category} ·{" "}
                                {selectedTicket.createdAt}
                            </p>
                        </div>

                        {selectedTicket.status !== "closed" && (
                            <button
                                type="button"
                                onClick={closeTicket}
                                className="flex items-center justify-center gap-2 rounded-xl border border-red-400/30 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-400/10"
                            >
                                <XCircle size={16}/>
                                {t("closeTicket")}
                            </button>
                        )}
                    </div>

                    {/* Conversation */}
                    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                        {selectedTicket.messages.length === 0 && (
                            <div className="py-12 text-center text-gray-500">
                                {t("noMessages")}
                            </div>
                        )}

                        {selectedTicket.messages.map((item) => (
                            <div
                                key={item.id}
                                className={`flex ${
                                    item.sender === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-2xl rounded-2xl p-4 ${
                                        item.sender === "user"
                                            ? "bg-cyan-400/10 border border-cyan-400/20"
                                            : "bg-white/5 border border-white/10"
                                    }`}
                                >
                                    <div className="mb-2 flex items-center justify-between gap-5">
                                        <span className="text-xs font-semibold text-cyan-400">
                                            {item.sender === "user"
                                                ? t("you")
                                                : t("supportTeam")}
                                        </span>

                                        <span className="text-[11px] text-gray-600">
                                            {item.date}
                                        </span>
                                    </div>

                                    <p className="text-sm leading-6 text-gray-300">
                                        {item.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reply */}
                    {selectedTicket.status !== "closed" && (
                        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <textarea
                                value={message}
                                onChange={(event) =>
                                    setMessage(event.target.value)
                                }
                                placeholder={t("replyPlaceholder")}
                                rows={4}
                                className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                            />

                            <div className="mt-3 flex justify-end">
                                <button
                                    type="button"
                                    onClick={sendMessage}
                                    className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:scale-[1.02]"
                                >
                                    <Send size={16}/>
                                    {t("sendReply")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen px-6 py-16">
            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-3">
                            <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-400">
                                <Ticket size={26}/>
                            </div>

                            <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                                {t("badge")}
                            </span>
                        </div>

                        <h1 className="text-4xl font-bold md:text-5xl">
                            {t("title")}
                        </h1>

                        <p className="mt-4 max-w-2xl text-gray-400">
                            {t("subtitle")}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowCreate(true)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black shadow-[0_0_20px_rgba(0,229,255,0.2)] transition hover:scale-[1.02]"
                    >
                        <Plus size={18}/>
                        {t("newTicket")}
                    </button>
                </div>

                {/* Ticket list */}
                <div className="space-y-4">
                    {tickets.map((ticket) => (
                        <button
                            key={ticket.id}
                            type="button"
                            onClick={() =>
                                setSelectedId(ticket.id)
                            }
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <div className="mb-2 flex flex-wrap items-center gap-3">
                                        <span className="font-mono text-xs text-cyan-400">
                                            {ticket.id}
                                        </span>

                                        <span
                                            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${statusClass(ticket.status)}`}
                                        >
                                            {statusIcon(ticket.status)}
                                            {t(
                                                `status.${ticket.status}`
                                            )}
                                        </span>
                                    </div>

                                    <h2 className="truncate font-semibold text-white">
                                        {ticket.subject}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {ticket.category} ·{" "}
                                        {ticket.updatedAt}
                                    </p>
                                </div>

                                <div className="flex items-center gap-6 sm:text-right">
                                    <div>
                                        <p className="text-xs text-gray-600">
                                            {t("priorityLabel")}
                                        </p>

                                        <p
                                            className={`mt-1 text-sm font-medium ${priorityClass(ticket.priority)}`}
                                        >
                                            {t(
                                                `priority.${ticket.priority}`
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-white/5 p-2 text-gray-500">
                                        <ChevronLeft
                                            size={18}
                                            className="rotate-180"
                                        />
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Create ticket modal */}
                {showCreate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#071014] p-6 shadow-2xl">

                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {t("create.title")}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {t("create.subtitle")}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreate(false)
                                    }
                                    className="text-gray-500 hover:text-white"
                                >
                                    <XCircle size={22}/>
                                </button>
                            </div>

                            <div className="space-y-5">

                                {/* Subject */}
                                <div>
                                    <label className="mb-2 block text-sm text-gray-300">
                                        {t("create.subject")}
                                    </label>

                                    <input
                                        value={subject}
                                        onChange={(event) =>
                                            setSubject(
                                                event.target.value
                                            )
                                        }
                                        placeholder={t(
                                            "create.subjectPlaceholder"
                                        )}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="mb-2 block text-sm text-gray-300">
                                        {t("create.category")}
                                    </label>

                                    <select
                                        value={category}
                                        onChange={(event) =>
                                            setCategory(
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                                    >
                                        <option
                                            value="technical"
                                            className="bg-[#071014]"
                                        >
                                            {t(
                                                "create.categories.technical"
                                            )}
                                        </option>

                                        <option
                                            value="billing"
                                            className="bg-[#071014]"
                                        >
                                            {t(
                                                "create.categories.billing"
                                            )}
                                        </option>

                                        <option
                                            value="connection"
                                            className="bg-[#071014]"
                                        >
                                            {t(
                                                "create.categories.connection"
                                            )}
                                        </option>

                                        <option
                                            value="other"
                                            className="bg-[#071014]"
                                        >
                                            {t(
                                                "create.categories.other"
                                            )}
                                        </option>
                                    </select>
                                </div>

                                {/* Priority */}
                                <div>
                                    <label className="mb-2 block text-sm text-gray-300">
                                        {t("create.priority")}
                                    </label>

                                    <div className="grid grid-cols-3 gap-2">
                                        {(
                                            [
                                                "low",
                                                "medium",
                                                "high",
                                            ] as Priority[]
                                        ).map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() =>
                                                    setPriority(
                                                        item
                                                    )
                                                }
                                                className={`rounded-xl border px-3 py-2 text-sm transition ${
                                                    priority === item
                                                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                                                        : "border-white/10 text-gray-500 hover:border-white/20"
                                                }`}
                                            >
                                                {t(
                                                    `priority.${item}`
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={createTicket}
                                    disabled={!subject.trim()}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Plus size={18}/>
                                    {t("create.submit")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}