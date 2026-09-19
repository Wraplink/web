export type BasketItem = {
    id: string;
    name: string;
    category: string;
    price: number;
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