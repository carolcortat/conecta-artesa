package com.conectaartesa.backend.model; // Ajuste o pacote conforme a estrutura do seu projeto

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String categoria;
    private Double custoInsumos;
    private Double precoFinal;
    private Integer quantidadeEstoque;
    private String descricao;
    private String imagemUrl;

    // Construtor padrão (vazio exigido pelo JPA)
    public Produto() {
    }

    // Construtor com argumentos
    public Produto(String nome, String categoria, Double custoInsumos, Double precoFinal, Integer quantidadeEstoque, String descricao, String imagemUrl) {
        this.nome = nome;
        this.categoria = categoria;
        this.custoInsumos = custoInsumos;
        this.precoFinal = precoFinal;
        this.quantidadeEstoque = quantidadeEstoque;
        this.descricao = descricao;
        this.imagemUrl = imagemUrl;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Double getCustoInsumos() {
        return custoInsumos;
    }

    public void setCustoInsumos(Double custoInsumos) {
        this.custoInsumos = custoInsumos;
    }

    public Double getPrecoFinal() {
        return precoFinal;
    }

    public void setPrecoFinal(Double precoFinal) {
        this.precoFinal = precoFinal;
    }

    public Integer getQuantidadeEstoque() {
        return quantidadeEstoque;
    }

    public void setQuantidadeEstoque(Integer quantidadeEstoque) {
        this.quantidadeEstoque = quantidadeEstoque;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }
}