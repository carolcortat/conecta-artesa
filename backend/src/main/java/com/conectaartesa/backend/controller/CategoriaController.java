package com.conectaartesa.backend.controller;

import com.conectaartesa.backend.model.Categoria;
import com.conectaartesa.backend.repository.CategoriaRepository;
import com.conectaartesa.backend.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    // Listar todas as categorias (GET)
    @GetMapping
    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    // Cadastrar nova categoria (POST)
    @PostMapping
    public ResponseEntity<?> criarCategoria(@RequestBody Categoria categoria) {
        String nome = categoria.getNome() == null ? "" : categoria.getNome().trim();
        if (nome.isEmpty()) {
            return ResponseEntity.badRequest().body("Informe o nome da categoria.");
        }
        if (categoriaRepository.existsByNomeIgnoreCase(nome)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Essa categoria já existe.");
        }
        categoria.setId(null);
        categoria.setNome(nome);
        return ResponseEntity.ok(categoriaRepository.save(categoria));
    }

    // Excluir categoria (DELETE) - bloqueia se houver produtos nela
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarCategoria(@PathVariable Long id) {
        Categoria categoria = categoriaRepository.findById(id).orElse(null);
        if (categoria == null) {
            return ResponseEntity.notFound().build();
        }
        if (produtoRepository.existsByCategoria(categoria.getNome())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Existem produtos nessa categoria.");
        }
        categoriaRepository.delete(categoria);
        return ResponseEntity.ok().build();
    }
}
