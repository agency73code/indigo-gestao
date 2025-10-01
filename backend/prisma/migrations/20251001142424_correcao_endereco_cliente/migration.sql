/*
  Warnings:

  - A unique constraint covering the columns `[cep,rua,numero,bairro,cidade,uf,complemento]` on the table `endereco` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `endereco_cep_rua_numero_bairro_cidade_uf_complemento_key` ON `endereco`(`cep`, `rua`, `numero`, `bairro`, `cidade`, `uf`, `complemento`);
