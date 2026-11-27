package com.conectaartesa.backend.config;

import com.conectaartesa.backend.controller.UploadController;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;

// Faz as imagens enviadas ficarem acessíveis em http://localhost:8080/uploads/<arquivo>
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            Files.createDirectories(UploadController.PASTA);
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível criar a pasta de uploads", e);
        }

        String local = UploadController.PASTA.toUri().toString();
        if (!local.endsWith("/")) {
            local = local + "/";
        }
        registry.addResourceHandler("/uploads/**").addResourceLocations(local);
    }
}
