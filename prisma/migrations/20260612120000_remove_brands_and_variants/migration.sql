-- Drop variant relation from order items
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_variantId_fkey";
ALTER TABLE "order_items" DROP COLUMN IF EXISTS "variantId";

-- Remove variant and brand tables / columns
DROP TABLE IF EXISTS "product_variants";

ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_brandId_fkey";
ALTER TABLE "products" DROP COLUMN IF EXISTS "brandId";

DROP TABLE IF EXISTS "brands";
