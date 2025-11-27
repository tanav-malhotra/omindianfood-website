-- AlterTable
ALTER TABLE "Order" ADD COLUMN "subtotal" DECIMAL;
ALTER TABLE "Order" ADD COLUMN "tax" DECIMAL;
ALTER TABLE "Order" ADD COLUMN "tip" DECIMAL;
ALTER TABLE "Order" ADD COLUMN "transactionId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("id", "menuItemId", "name", "note", "orderId", "price", "quantity") SELECT "id", "menuItemId", "name", "note", "orderId", "price", "quantity" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
