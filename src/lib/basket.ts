export type BasketItem = {
    id: string;
    name: string;
    category: string;
    // Price is in the currency's minor units, as returned by the backend.
    price: number;
    currency?: string;
    durationDays?: number;
    quantity: number;
};

const STORAGE_KEY = "wraplink_basket";

export function getBasket(): BasketItem[] {
    if (typeof window === "undefined") {
        return [];
    }

    const value =
        localStorage.getItem(STORAGE_KEY);

    if (!value) {
        return [];
    }

    try {
        return JSON.parse(value) as BasketItem[];
    } catch {
        return [];
    }
}

export function saveBasket(
    items: BasketItem[]
) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
    );
}

export function addBasketItem(
    item: Omit<BasketItem, "quantity">
) {
    const basket = getBasket();

    const existing = basket.find(
        (current) => current.id === item.id
    );

    if (existing) {
        // Refresh stale local pricing from the authoritative catalog.
        existing.name = item.name;
        existing.category = item.category;
        existing.price = item.price;
        existing.currency = item.currency;
        existing.durationDays = item.durationDays;
        existing.quantity += 1;
    } else {
        basket.push({
            ...item,
            quantity: 1,
        });
    }

    saveBasket(basket);
}

export function updateBasketQuantity(
    id: string,
    quantity: number
) {
    const basket = getBasket();

    const updated = basket
        .map((item) =>
            item.id === id
                ? {...item, quantity}
                : item
        )
        .filter(
            (item) => item.quantity > 0
        );

    saveBasket(updated);
}

export function removeBasketItem(
    id: string
) {
    const basket = getBasket();

    saveBasket(
        basket.filter(
            (item) => item.id !== id
        )
    );
}

export function clearBasket() {
    saveBasket([]);
}