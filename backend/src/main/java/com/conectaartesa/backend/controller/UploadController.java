package com.conectaartesa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "*")
public class UploadController {

    // Pasta onde as imagens enviadas ficam salvas (criada dentro da pasta de execução do backend)
    public static final Path PASTA = Paths.get("uploads").toAbsolutePath().normalize();

    private static final Map<String, String> EXTENSOES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/gif", ".gif",
            "image/webp", ".webp"
    );

    // Recebe uma imagem, salva na pasta e devolve o endereço (URL) para guardar no produto
    @PostMapping
    public ResponseEntity<?> enviar(@RequestParam("arquivo") MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            return ResponseEntity.badRequest().body("Nenhum arquivo enviado.");
        }

        String extensao = EXTENSOES.get(arquivo.getContentType());
        if (extensao == null) {
            return ResponseEntity.badRequest().body("Envie uma imagem JPG, PNG, GIF ou WEBP.");
        }

        try {
            Files.createDirectories(PASTA);
            // Nome gerado pelo sistema (evita nomes repetidos e caracteres perigosos)
            String nome = UUID.randomUUID() + extensao;
            Files.copy(arquivo.getInputStream(), PASTA.resolve(nome), StandardCopyOption.REPLACE_EXISTING);

            String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(nome)
                    .toUriString();
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Não foi possível salvar a imagem.");
        }
    }
}
