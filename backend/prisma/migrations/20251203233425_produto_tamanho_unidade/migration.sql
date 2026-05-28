-- CreateEnum
CREATE TYPE "UnidadeMedida" AS ENUM ('ML', 'L', 'G', 'KG');

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "tamanho" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "unidade" "UnidadeMedida" NOT NULL DEFAULT 'ML';
