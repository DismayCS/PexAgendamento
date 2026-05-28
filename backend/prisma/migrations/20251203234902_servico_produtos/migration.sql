-- CreateTable
CREATE TABLE "ServicoProduto" (
    "id" SERIAL NOT NULL,
    "servico_id" INTEGER NOT NULL,
    "produto_id" INTEGER NOT NULL,
    "consumo" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServicoProduto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServicoProduto_servico_id_produto_id_key" ON "ServicoProduto"("servico_id", "produto_id");

-- AddForeignKey
ALTER TABLE "ServicoProduto" ADD CONSTRAINT "ServicoProduto_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "Servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicoProduto" ADD CONSTRAINT "ServicoProduto_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
