-- AlterTable
ALTER TABLE "Order" ADD COLUMN "subtotal" DECIMAL;
ALTER TABLE "Order" ADD COLUMN "tax" DECIMAL;
ALTER TABLE "Order" ADD COLUMN "tip" DECIMAL;
ALTER TABLE "Order" ADD COLUMN "transactionId" TEXT;

ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";
ALTER TABLE "OrderItem"
    ALTER COLUMN "menuItemId" DROP NOT NULL;
ALTER TABLE "OrderItem"
    ADD CONSTRAINT "OrderItem_menuItemId_fkey"
    FOREIGN KEY ("menuItemId") REFERENCES "MenuItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
