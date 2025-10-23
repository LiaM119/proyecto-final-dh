package com.turmalin.productsapi.product;

import com.turmalin.productsapi.product.dto.ProductDTO;
import com.turmalin.productsapi.storage.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository repo;
    private final FileStorageService storage;

    public ProductService(ProductRepository repo, FileStorageService storage) {
        this.repo = repo;
        this.storage = storage;
    }

    // 🔹 Verifica si ya existe un producto con ese nombre
    public boolean existsByName(String name) {
        return repo.existsByNameIgnoreCase(name);
    }

    // 🔹 Crear un nuevo producto con imágenes
    public ProductDTO create(
            String name,
            String description,
            BigDecimal price,
            Integer stock,
            String category,
            List<MultipartFile> images
    ) throws IOException {

        // Validación de nombre duplicado
        if (repo.existsByNameIgnoreCase(name)) {
            throw new IllegalStateException("El nombre del producto ya existe");
        }

        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setPrice(price);
        p.setStock(stock);
        p.setCategory(category);

        // Guardar imágenes si existen
        if (images != null && !images.isEmpty()) {
            for (MultipartFile img : images) {
                String path = storage.save(img);
                p.addImage(path); // asegúrate de tener este método en Product
            }
        }

        repo.save(p);
        return toDto(p);
    }

    // 🔹 Listar todos los productos
    public List<ProductDTO> findAll() {
        return repo.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // 🔹 Buscar producto por ID
    public Optional<ProductDTO> findById(Long id) {
        return repo.findById(id).map(this::toDto);
    }

    // 🔹 Eliminar producto
    public void delete(Long id) {
        repo.deleteById(id);
    }

    // 🔹 Conversión de entidad → DTO
    private ProductDTO toDto(Product p) {
        ProductDTO dto = new ProductDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setStock(p.getStock());
        dto.setCategory(p.getCategory());
        dto.setImageUrls(p.getImageUrls()); // getter en Product
        return dto;
    }
}

