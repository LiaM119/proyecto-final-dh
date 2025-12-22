package com.turmalin.productsapi.category;

import com.turmalin.productsapi.category.dto.CategoryDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.*;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository repo;

    public CategoryService(CategoryRepository repo) {
        this.repo = repo;
    }

    // ===== Helpers de mapeo =====
    public static CategoryDTO toDto(Category c) {
        return new CategoryDTO(
                c.getId(),
                c.getName(),
                c.getDescription(),
                c.getSlug()
        );
    }

    // Copia los datos del DTO a la entidad (con limpieza de campos)
    public static void copy(CategoryDTO dto, Category e) {
        // Limpieza de nombre
        String name = dto.getName() != null ? dto.getName().trim() : null;
        if (name == null || name.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "El nombre es obligatorio");
        }
        e.setName(name);

        // Limpieza de descripción
        String desc = dto.getDescription() != null ? dto.getDescription().trim() : null;
        e.setDescription((desc != null && !desc.isEmpty()) ? desc : null);

        // Limpieza de slug
        String slug = dto.getSlug() != null ? dto.getSlug().trim() : null;
        e.setSlug((slug != null && !slug.isEmpty()) ? slug : null);
    }

    // ===== Operaciones =====

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

        // Si slug viene vacío, se deja en null (para evitar constraint UNIQUE con "")
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
        // Si slug viene vacío, lo dejamos en null
        if (c.getSlug() != null && c.getSlug().isEmpty()) {
            c.setSlug(null);
        }

        return toDto(c);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Categoría no encontrada");
        }
        repo.deleteById(id);
    }
}
