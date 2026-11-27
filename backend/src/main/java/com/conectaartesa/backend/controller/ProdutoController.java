package com.conectaartesa.backend.controller;

import com.conectaartesa.backend.model.Pedido;
import com.conectaartesa.backend.model.Produto;
import com.conectaartesa.backend.repository.PedidoRepository;
import com.conectaartesa.backend.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*")
public class ProdutoController {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    // Listar todos os produtos (GET)
    @GetMapping
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    // Cadastrar novo produto (POST)
    @PostMapping
    public Produto criarProduto(@RequestBody Produto produto) {
        produto.setId(null);
        return produtoRepository.save(produto);
    }

    // Atualizar produto existente (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizarProduto(@PathVariable Long id, @RequestBody Produto produtoDetalhes) {
        return produtoRepository.findById(id)
                .map(produto -> {
                    produto.setNome(produtoDetalhes.getNome());
                    produto.setCategoria(produtoDetalhes.getCategoria());
                    produto.setDescricao(produtoDetalhes.getDescricao());
                    produto.setCustoInsumos(produtoDetalhes.getCustoInsumos());
                    produto.setPrecoFinal(produtoDetalhes.getPrecoFinal());
                    produto.setQuantidadeEstoque(produtoDetalhes.getQuantidadeEstoque());
                    produto.setImagemUrl(produtoDetalhes.getImagemUrl());
                    Produto atualizado = produtoRepository.save(produto);
                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Verifica se o produto aparece em algum pedido (itens novos ou pedidos antigos)
    private boolean usadoEmPedidos(Long produtoId) {
        for (Pedido pedido : pedidoRepository.findAll()) {
            if (produtoId.equals(pedido.getProdutoId())) {
                return true;
            }
            if (pedido.getItens() != null) {
                for (var item : pedido.getItens()) {
                    if (produtoId.equals(item.getProdutoId())) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Deletar um produto (DELETE) - bloqueia se já foi usado em pedidos
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarProduto(@PathVariable Long id) {
        Produto produto = produtoRepository.findById(id).orElse(null);
        if (produto == null) {
            return ResponseEntity.notFound().build();
        }
        if (usadoEmPedidos(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Este produto já está em pedidos e não pode ser excluído. Exclua os pedidos antes.");
        }
        produtoRepository.delete(produto);
        return ResponseEntity.ok().build();
    }
}
