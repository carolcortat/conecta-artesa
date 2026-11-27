package com.conectaartesa.backend.controller;

import com.conectaartesa.backend.model.ItemPedido;
import com.conectaartesa.backend.model.Pedido;
import com.conectaartesa.backend.model.Produto;
import com.conectaartesa.backend.repository.PedidoRepository;
import com.conectaartesa.backend.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private static final String STATUS_ENTREGUE = "Entregue";

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    // ---------------------------------------------------------------
    // Validação dos itens e cálculo do total
    // ---------------------------------------------------------------

    // Valida os itens e recalcula quantidade e total no servidor.
    // Devolve uma mensagem de erro, ou null se estiver tudo certo.
    private String prepararItens(Pedido pedido) {
        List<ItemPedido> itens = pedido.getItens();
        if (itens == null || itens.isEmpty()) {
            return "Adicione pelo menos um produto ao pedido.";
        }

        int quantidadeTotal = 0;
        double total = 0;
        for (ItemPedido item : itens) {
            if (item.getProdutoId() == null || item.getQuantidade() == null || item.getQuantidade() < 1) {
                return "Todos os produtos do pedido precisam ter produto e quantidade válidos.";
            }
            double valor = item.getValorUnitario() == null ? 0 : item.getValorUnitario();
            quantidadeTotal += item.getQuantidade();
            total += valor * item.getQuantidade();
        }

        ItemPedido primeiro = itens.get(0);
        pedido.setProdutoId(primeiro.getProdutoId());
        pedido.setValorUnitario(primeiro.getValorUnitario());
        pedido.setQuantidade(quantidadeTotal);
        pedido.setValorTotal(Math.round(total * 100.0) / 100.0);
        return null;
    }

    // ---------------------------------------------------------------
    // Estoque dos produtos
    // Regra: o estoque é baixado quando o pedido fica "Entregue" e devolvido
    // se o pedido sair desse status, for editado ou excluído.
    // ---------------------------------------------------------------

    // Soma as quantidades por produto, multiplicadas pelo sinal (-1 baixa, +1 devolve)
    private Map<Long, Integer> agrupar(List<ItemPedido> itens, int sinal) {
        Map<Long, Integer> mapa = new HashMap<>();
        if (itens == null) {
            return mapa;
        }
        for (ItemPedido item : itens) {
            if (item.getProdutoId() == null || item.getQuantidade() == null) {
                continue;
            }
            mapa.merge(item.getProdutoId(), sinal * item.getQuantidade(), Integer::sum);
        }
        return mapa;
    }

    private void somarMapas(Map<Long, Integer> destino, Map<Long, Integer> origem) {
        for (Map.Entry<Long, Integer> entrada : origem.entrySet()) {
            destino.merge(entrada.getKey(), entrada.getValue(), Integer::sum);
        }
    }

    // Aplica as variações no estoque. Primeiro confere tudo; só altera se estiver tudo certo.
    // Devolve uma mensagem de erro, ou null se deu certo.
    private String ajustarEstoque(Map<Long, Integer> variacao) {
        List<Produto> produtosAlterados = new ArrayList<>();
        List<Integer> novasQuantidades = new ArrayList<>();

        for (Map.Entry<Long, Integer> entrada : variacao.entrySet()) {
            int delta = entrada.getValue();
            if (delta == 0) {
                continue;
            }
            Produto produto = produtoRepository.findById(entrada.getKey()).orElse(null);
            if (produto == null) {
                if (delta < 0) {
                    return "Produto não encontrado (id " + entrada.getKey() + ").";
                }
                continue; // devolução para um produto que não existe mais: ignora
            }
            int atual = produto.getQuantidadeEstoque() == null ? 0 : produto.getQuantidadeEstoque();
            int novo = atual + delta;
            if (novo < 0) {
                return "Estoque insuficiente de \"" + produto.getNome() + "\": disponível "
                        + atual + ", necessário " + (-delta) + ".";
            }
            produtosAlterados.add(produto);
            novasQuantidades.add(novo);
        }

        for (int i = 0; i < produtosAlterados.size(); i++) {
            produtosAlterados.get(i).setQuantidadeEstoque(novasQuantidades.get(i));
        }
        produtoRepository.saveAll(produtosAlterados);
        return null;
    }

    // ---------------------------------------------------------------
    // Endpoints
    // ---------------------------------------------------------------

    // Listar todos os pedidos (GET)
    @GetMapping
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    // Cadastrar novo pedido (POST)
    @PostMapping
    @Transactional
    public ResponseEntity<?> criarPedido(@RequestBody Pedido pedido) {
        pedido.setId(null);
        String erro = prepararItens(pedido);
        if (erro != null) {
            return ResponseEntity.badRequest().body(erro);
        }

        boolean entregue = STATUS_ENTREGUE.equals(pedido.getStatusPedido());
        if (entregue) {
            erro = ajustarEstoque(agrupar(pedido.getItens(), -1));
            if (erro != null) {
                return ResponseEntity.badRequest().body(erro);
            }
        }
        pedido.setEstoqueBaixado(entregue);

        return ResponseEntity.ok(pedidoRepository.save(pedido));
    }

    // Atualizar pedido existente (PUT)
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> atualizarPedido(@PathVariable Long id, @RequestBody Pedido detalhes) {
        Pedido pedido = pedidoRepository.findById(id).orElse(null);
        if (pedido == null) {
            return ResponseEntity.notFound().build();
        }

        String erro = prepararItens(detalhes);
        if (erro != null) {
            return ResponseEntity.badRequest().body(erro);
        }

        // Variação líquida do estoque: devolve o que foi baixado antes e baixa o novo, se for o caso
        Map<Long, Integer> variacao = new HashMap<>();
        if (Boolean.TRUE.equals(pedido.getEstoqueBaixado())) {
            somarMapas(variacao, agrupar(pedido.getItens(), 1));
        }
        boolean deveBaixar = STATUS_ENTREGUE.equals(detalhes.getStatusPedido());
        if (deveBaixar) {
            somarMapas(variacao, agrupar(detalhes.getItens(), -1));
        }
        erro = ajustarEstoque(variacao);
        if (erro != null) {
            return ResponseEntity.badRequest().body(erro);
        }

        pedido.setClienteNome(detalhes.getClienteNome());
        pedido.setClienteId(detalhes.getClienteId());
        pedido.getItens().clear();
        pedido.getItens().addAll(new ArrayList<>(detalhes.getItens()));
        pedido.setProdutoId(detalhes.getProdutoId());
        pedido.setQuantidade(detalhes.getQuantidade());
        pedido.setValorUnitario(detalhes.getValorUnitario());
        pedido.setValorTotal(detalhes.getValorTotal());
        pedido.setDataEntrega(detalhes.getDataEntrega());
        pedido.setStatusPedido(detalhes.getStatusPedido());
        pedido.setPagamentoRecebido(detalhes.getPagamentoRecebido());
        pedido.setFormaPagamento(detalhes.getFormaPagamento());
        pedido.setObservacoes(detalhes.getObservacoes());
        pedido.setEstoqueBaixado(deveBaixar);

        return ResponseEntity.ok(pedidoRepository.save(pedido));
    }

    // Deletar um pedido (DELETE) - devolve o estoque se ele já tinha sido baixado
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deletarPedido(@PathVariable Long id) {
        Pedido pedido = pedidoRepository.findById(id).orElse(null);
        if (pedido == null) {
            return ResponseEntity.notFound().build();
        }

        if (Boolean.TRUE.equals(pedido.getEstoqueBaixado())) {
            ajustarEstoque(agrupar(pedido.getItens(), 1));
        }
        pedidoRepository.delete(pedido);
        return ResponseEntity.ok().build();
    }
}
