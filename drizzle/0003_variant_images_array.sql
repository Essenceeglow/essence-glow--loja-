ALTER TABLE "productVariants" DROP COLUMN IF EXISTS "image";
ALTER TABLE "productVariants" ADD COLUMN IF NOT EXISTS "images" json DEFAULT '[]'::json;
