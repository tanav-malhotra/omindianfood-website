import { ORDER_ITEM_CATALOG } from "@/lib/order-catalog";

export const NY_TAX_RATE = 0.08875;

type ClientCartItem = {
  menuItemId: string;
  quantity: number;
  note?: string;
};

export type NormalizedOrderItem = {
  menuItemId: string | null;
  quantity: number;
  price: number;
  name: string;
  note: string | null;
};

function getOmSpecialPrice(note?: string) {
  const hasUpgrade = note?.includes("Bread: Garlic Naan")
    || note?.includes("Bread: Onion Naan")
    || note?.includes("Bread: Plain Paratha");

  return hasUpgrade ? 19.95 : 18.95;
}

export function normalizeOrderItems(items: ClientCartItem[]) {
  let subtotal = 0;
  const normalizedItems: NormalizedOrderItem[] = [];

  for (const item of items) {
    if (!item.menuItemId || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Invalid order item.");
    }

    let name: string;
    let unitPrice: number;

    if (item.menuItemId === "om-special") {
      name = "OM Special";
      unitPrice = getOmSpecialPrice(item.note);
    } else {
      const catalogItem = ORDER_ITEM_CATALOG[item.menuItemId as keyof typeof ORDER_ITEM_CATALOG];
      if (!catalogItem) {
        throw new Error(`Unknown menu item: ${item.menuItemId}`);
      }

      name = catalogItem.name;
      unitPrice = catalogItem.price;
    }

    subtotal += unitPrice * item.quantity;
    normalizedItems.push({
      menuItemId: null,
      quantity: item.quantity,
      price: unitPrice,
      name,
      note: item.note?.trim() || null,
    });
  }

  return {
    normalizedItems,
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number((subtotal * NY_TAX_RATE).toFixed(2)),
  };
}
