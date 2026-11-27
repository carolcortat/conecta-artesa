package com.conectaartesa.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cliente_nome", nullable = false)
    private String clienteNome;

    // Cliente cadastrado (opcional). O nome fica salvo em clienteNome para não depender do cadastro.
    @Column(name = "cliente_id")
    private Long clienteId;

    // Produtos do pedido (vários por pedido)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pedido_itens", joinColumns = @JoinColumn(name = "pedido_id"))
    private List<ItemPedido> itens = new ArrayList<>();

    // Campos de resumo, preenchidos automaticamente pelo controller a partir dos itens
    // (produtoId = primeiro item, quantidade = soma das quantidades)
    @Column(name = "produto_id")
    private Long produtoId;

    private Integer quantidade;

    @Column(name = "valor_unitario")
    private Double valorUnitario;

    // Total do pedido = soma de (valor x quantidade) de todos os itens
    @Column(name = "valor_total")
    private Double valorTotal;

    @Column(name = "data_entrega")
    private LocalDate dataEntrega;

    // Novo, Em produção, Pronto, Entregue
    @Column(name = "status_pedido", nullable = false)
    private String statusPedido = "Novo";

    @Column(name = "pagamento_recebido")
    private Boolean pagamentoRecebido = false;

    // Pix, Cartão, Dinheiro
    @Column(name = "forma_pagamento")
    private String formaPagamento;

    @Column(length = 1000)
    private String observacoes;

    // true quando o estoque dos produtos já foi baixado (pedido Entregue)
    @Column(name = "estoque_baixado")
    private Boolean estoqueBaixado = false;

    @Column(name = "data_pedido", updatable = false)
    private LocalDateTime dataPedido = LocalDateTime.now();
}
