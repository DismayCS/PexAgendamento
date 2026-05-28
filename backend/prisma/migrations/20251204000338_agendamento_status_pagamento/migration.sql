-- CreateEnum
CREATE TYPE "StatusAgendamento" AS ENUM ('AGENDADO', 'ATENDIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('DINHEIRO', 'DEBITO', 'CREDITO', 'PIX');

-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "finalizado_em" TIMESTAMP(3),
ADD COLUMN     "metodo_pagamento" "MetodoPagamento",
ADD COLUMN     "status" "StatusAgendamento" NOT NULL DEFAULT 'AGENDADO';

-- CreateTable
CREATE TABLE "AgendamentoProduto" (
    "id" SERIAL NOT NULL,
    "agendamento_id" INTEGER NOT NULL,
    "produto_id" INTEGER NOT NULL,
    "consumo" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgendamentoProduto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgendamentoProduto_agendamento_id_produto_id_key" ON "AgendamentoProduto"("agendamento_id", "produto_id");

-- AddForeignKey
ALTER TABLE "AgendamentoProduto" ADD CONSTRAINT "AgendamentoProduto_agendamento_id_fkey" FOREIGN KEY ("agendamento_id") REFERENCES "Agendamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendamentoProduto" ADD CONSTRAINT "AgendamentoProduto_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
