package com.turmalin.productsapi.product;

import com.turmalin.productsapi.category.Category;
import com.turmalin.productsapi.category.CategoryRepository;
import com.turmalin.productsapi.product.dto.ProductDTO;
import com.turmalin.productsapi.storage.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ProductService {

    private final ProductRepository repo;
    private final FileStorageService storage;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository repo,
                          FileStorageService storage,
                          CategoryRepository categoryRepository) {
        this.repo = repo;
        this.storage = storage;
        this.categoryRepository = categoryRepository;
    }

    public boolean existsByName(String name) {
        return repo.existsByNameIgnoreCase(name);
    }

    public ProductDTO create(
            String name,
            String description,
            BigDecimal price,
            Integer stock,
            Long categoryId,
            List<MultipartFile> images
    ) throws IOException {

        if (repo.existsByNameIgnoreCase(name)) {
            throw new IllegalStateException("El nombre del producto ya existe");
        }

        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setPrice(price);
        p.setStock(stock);

        if (categoryId != null) {
            Category cat = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));
            p.setCategory(cat);
        } else {
            p.setCategory(null);
        }

        if (images != null && !images.isEmpty()) {
            for (MultipartFile img : images) {
                String path = storage.save(img);
                p.addImage(path);
            }
        }

        repo.save(p);
        return toDto(p);
    }

    public ProductDTO update(
            Long id,
            String name,
            String description,
            BigDecimal price,
            Integer stock,
            Long categoryId,
            List<MultipartFile> images
    ) throws IOException {

        Product p = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

        if (name != null && !name.isBlank()) p.setName(name);
        if (description != null) p.setDescription(description);
        if (price != null) p.setPrice(price);
        if (stock != null) p.setStock(stock);

        if (categoryId != null) {
            Category cat = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));
            p.setCategory(cat);
        } else {
            p.setCategory(null);
        }

        if (images != null && !images.isEmpty()) {
            for (MultipartFile img : images) {
                String path = storage.save(img);
                p.addImage(path);
            }
        }

        return toDto(p);
    }

    public List<ProductDTO> findAll() {
        return repo.findAll().stream().map(this::toDto).toList();
    }

    public Optional<ProductDTO> findById(Long id) {
        return repo.findById(id).map(this::toDto);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    // ===== mapper =====
    private ProductDTO toDto(Product p) {
        ProductDTO dto = new ProductDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setStock(p.getStock());
        dto.setImageUrls(p.getImageUrls());

        if (p.getCategory() != null) {
            dto.setCategoryId(p.getCategory().getId());
            dto.setCategoryName(p.getCategory().getName());
        } else {
            dto.setCategoryId(null);
            dto.setCategoryName(null);
        }
        return dto;
    }
}

