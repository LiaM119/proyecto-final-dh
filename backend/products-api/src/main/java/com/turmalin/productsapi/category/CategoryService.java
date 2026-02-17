package com.turmalin.productsapi.category;

import com.turmalin.productsapi.category.dto.CategoryDTO;
import com.turmalin.productsapi.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.*;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository repo;
    private final ProductRepository productRepo;

    public CategoryService(CategoryRepository repo, ProductRepository productRepo) {
        this.repo = repo;
        this.productRepo = productRepo;
    }

    public static CategoryDTO toDto(Category c) {
        return new CategoryDTO(
                c.getId(),
                c.getName(),
                c.getDescription(),
                c.getSlug()
        );
    }

    public static void copy(CategoryDTO dto, Category e) {
        String name = dto.getName() != null ? dto.getName().trim() : null;
        if (name == null || name.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "El nombre es obligatorio");
        }
        e.setName(name);

        String desc = dto.getDescription() != null ? dto.getDescription().trim() : null;
        e.setDescription((desc != null && !desc.isEmpty()) ? desc : null);

        String slug = dto.getSlug() != null ? dto.getSlug().trim() : null;
        e.setSlug((slug != null && !slug.isEmpty()) ? slug : null);
    }

    public List<CategoryDTO> list() {
        return repo.findAll().stream().map(CategoryService::toDto).toList();
    }

    public CategoryDTO get(Long id) {
        Category c = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Categoría no encontrada"));
        return toDto(c);
    }

    public CategoryDTO create(CategoryDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "El nombre es obligatorio");
        }

        String name = dto.getName().trim();
        if (repo.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(CONFLICT, "El nombre ya existe");
        }

        Category c = new Category();
        copy(dto, c);

        if (c.getSlug() != null && c.getSlug().isEmpty()) {
            c.setSlug(null);
        }

        Category saved = repo.save(c);
        return toDto(saved);
    }

    public CategoryDTO update(Long id, CategoryDTO dto) {
        Category c = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Categoría no encontrada"));

        if (dto.getName() != null) {
            String newName = dto.getName().trim();
            if (!newName.equalsIgnoreCase(c.getName()) && repo.existsByNameIgnoreCase(newName)) {
                throw new ResponseStatusException(CONFLICT, "El nombre ya existe");
            }
        }

        copy(dto, c);

        if (c.getSlug() != null && c.getSlug().isEmpty()) {
            c.setSlug(null);
        }

        return toDto(c);
    }

    public Map<String, Object> productCount(Long categoryId) {
        if (!repo.existsById(categoryId)) {
            throw new ResponseStatusException(NOT_FOUND, "Categoría no encontrada");
        }
        long count = productRepo.countByCategoryId(categoryId);
        return Map.of("categoryId", categoryId, "productCount", count);
    }

    public void delete(Long id, boolean force) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Categoría no encontrada");
        }

        long count = productRepo.countByCategoryId(id);

        if (count > 0 && !force) {
            throw new ResponseStatusException(
                    CONFLICT,
                    "No se puede eliminar la categoría porque tiene " + count +
                            " producto(s) asociado(s). Activá 'Forzar' para eliminarlos también."
            );
        }

        if (count > 0) {
            productRepo.deleteByCategoryId(id);
        }

        repo.deleteById(id);
    }

    public void delete(Long id) {
        delete(id, false);
    }
}
