package com.conectaartesa.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "insumos")
public class Insumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "unidade_medida", nullable = false)
    private String unidadeMedida;

    @Column(name = "quantidade_estoque", nullable = false)
    private BigDecimal quantidadeEstoque;

    @Column(name = "custo_unitario", nullable = false)
    private BigDecimal custoUnitario;

    // Quando a quantidade em estoque chega neste valor (ou menos), aparece o alerta de estoque baixo
    @Column(name = "estoque_minimo")
    private BigDecimal estoqueMinimo;
}
