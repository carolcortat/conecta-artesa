package com.conectaartesa.backend.controller;

import com.conectaartesa.backend.model.Cliente;
import com.conectaartesa.backend.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    // Listar todos os clientes (GET)
    @GetMapping
    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    // Cadastrar novo cliente (POST)
    @PostMapping
    public ResponseEntity<?> criarCliente(@RequestBody Cliente cliente) {
        if (cliente.getNome() == null || cliente.getNome().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Informe o nome do cliente.");
        }
        cliente.setId(null);
        cliente.setNome(cliente.getNome().trim());
        return ResponseEntity.ok(clienteRepository.save(cliente));
    }

    // Atualizar cliente existente (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarCliente(@PathVariable Long id, @RequestBody Cliente detalhes) {
        if (detalhes.getNome() == null || detalhes.getNome().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Informe o nome do cliente.");
        }
        Cliente cliente = clienteRepository.findById(id).orElse(null);
        if (cliente == null) {
            return ResponseEntity.notFound().build();
        }
        cliente.setNome(detalhes.getNome().trim());
        cliente.setTelefone(detalhes.getTelefone());
        cliente.setEmail(detalhes.getEmail());
        cliente.setEndereco(detalhes.getEndereco());
        return ResponseEntity.ok(clienteRepository.save(cliente));
    }

    // Deletar um cliente (DELETE) - os pedidos dele continuam guardando o nome
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCliente(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(cliente -> {
                    clienteRepository.delete(cliente);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
