-- CreateEnum
CREATE TYPE "ProdutoClasse" AS ENUM ('VENDA', 'INSUMO');

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "classe" "ProdutoClasse" NOT NULL DEFAULT 'INSUMO';
