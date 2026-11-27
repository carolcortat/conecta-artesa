// Regra única de "estoque baixo", usada no Dashboard e na página de Insumos.

// Usado quando o insumo não tem "estoque mínimo" definido
export const LIMITE_ESTOQUE_PADRAO = 5;

export const limiteDoInsumo = (insumo) =>
  insumo.estoqueMinimo !== null && insumo.estoqueMinimo !== undefined && insumo.estoqueMinimo !== ''
    ? Number(insumo.estoqueMinimo)
    : LIMITE_ESTOQUE_PADRAO;

// Estoque baixo = quantidade atual menor ou igual ao mínimo
export const estoqueBaixo = (insumo) =>
  Number(insumo.quantidadeEstoque) <= limiteDoInsumo(insumo);
