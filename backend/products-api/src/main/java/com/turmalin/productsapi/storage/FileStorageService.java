package com.turmalin.productsapi.storage;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path root = Paths.get("uploads"); // crea products-api/uploads

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(root);
    }

    public String save(MultipartFile file) throws IOException {
        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null) {
            int dot = original.lastIndexOf('.');
            if (dot >= 0) ext = original.substring(dot);
        }
        String filename = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), root.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + filename;  // <-- esto queda guardado en imageUrls
    }
}