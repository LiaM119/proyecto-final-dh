package com.turmalin.productsapi.amenity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AmenityDTO {
    private Long id;
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120, message = "El nombre no puede superar 120 caracteres")
    private String name;
    @Size(max = 500, message = "La descripcion no puede superar 500 caracteres")
    private String description;
    @Size(max = 255, message = "El icono no puede superar 255 caracteres")
    private String icon;

    public AmenityDTO() {}

    public AmenityDTO(Long id, String name, String description, String icon) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
