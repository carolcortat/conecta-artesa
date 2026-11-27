package com.conectaartesa.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

// Um produto dentro de um pedido (um pedido pode ter vários)
@Data
@Embeddable
public class ItemPedido {

    @Column(name = "produto_id", nullable = false)
    private Long produtoId;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "valor_unitario")
    private Double valorUnitario;
}
