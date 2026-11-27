package com.conectaartesa.backend.controller;

import com.conectaartesa.backend.model.Insumo;
import com.conectaartesa.backend.repository.InsumoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insumos")
@CrossOrigin(origins = "*")
public class InsumoController {

    @Autowired
    private InsumoRepository insumoRepository;

    // 1. Listar todos os insumos (GET)
    @GetMapping
    public List<Insumo> listarTodos() {
        return insumoRepository.findAll();
    }

    // 2. Cadastrar novo insumo (POST)
    @PostMapping
    public Insumo criarInsumo(@RequestBody Insumo insumo) {
        return insumoRepository.save(insumo);
    }

    // --- NOVOS MÉTODOS PARA EDITAR E DELETAR ---

    // 3. Atualizar um insumo existente (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Insumo> atualizarInsumo(@PathVariable Long id, @RequestBody Insumo insumoDetalhes) {
        return insumoRepository.findById(id)
                .map(insumo -> {
                    insumo.setNome(insumoDetalhes.getNome());
                    insumo.setUnidadeMedida(insumoDetalhes.getUnidadeMedida());
                    insumo.setQuantidadeEstoque(insumoDetalhes.getQuantidadeEstoque());
                    insumo.setCustoUnitario(insumoDetalhes.getCustoUnitario());
                    insumo.setEstoqueMinimo(insumoDetalhes.getEstoqueMinimo());
                    Insumo atualizado = insumoRepository.save(insumo);
                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. Deletar um insumo (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarInsumo(@PathVariable Long id) {
        return insumoRepository.findById(id)
                .map(insumo -> {
                    insumoRepository.delete(insumo);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}