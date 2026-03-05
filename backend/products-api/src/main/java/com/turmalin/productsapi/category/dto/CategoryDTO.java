package com.turmalin.productsapi.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryDTO {
    private Long id;
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120, message = "El nombre no puede superar 120 caracteres")
    private String name;
    @Size(max = 500, message = "La descripcion no puede superar 500 caracteres")
    private String description;
    @Size(max = 160, message = "El slug no puede superar 160 caracteres")
    private String slug;

    public CategoryDTO() {}

    public CategoryDTO(Long id, String name, String description, String slug) {
        this.id = id; this.name = name; this.description = description; this.slug = slug;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
}
