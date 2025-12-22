package com.turmalin.productsapi.category;

import com.turmalin.productsapi.category.dto.CategoryDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    // 🔹 USADO POR EL DROPDOWN DEL HEADER
    @GetMapping
    public List<CategoryDTO> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public CategoryDTO get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> create(@Valid @RequestBody CategoryDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.create(dto));
    }

    @PutMapping("/{id}")
    public CategoryDTO update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDTO dto
    ) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
