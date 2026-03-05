package com.turmalin.productsapi.amenity;

import com.turmalin.productsapi.amenity.dto.AmenityDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional
public class AmenityService {

    private final AmenityRepository repo;

    public AmenityService(AmenityRepository repo) {
        this.repo = repo;
    }

    public List<AmenityDTO> list() {
        return repo.findAll().stream().map(this::toDto).toList();
    }

    public AmenityDTO get(Long id) {
        Amenity amenity = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Caracteristica no encontrada"));
        return toDto(amenity);
    }

    public AmenityDTO create(AmenityDTO dto) {
        String name = normalizeName(dto.getName());
        if (repo.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(CONFLICT, "Ya existe una caracteristica con ese nombre");
        }

        Amenity amenity = new Amenity();
        amenity.setName(name);
        amenity.setDescription(normalizeText(dto.getDescription()));
        amenity.setIcon(normalizeText(dto.getIcon()));
        return toDto(repo.save(amenity));
    }

    public AmenityDTO update(Long id, AmenityDTO dto) {
        Amenity amenity = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Caracteristica no encontrada"));

        String name = normalizeName(dto.getName());
        if (!name.equalsIgnoreCase(amenity.getName()) && repo.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(CONFLICT, "Ya existe una caracteristica con ese nombre");
        }

        amenity.setName(name);
        amenity.setDescription(normalizeText(dto.getDescription()));
        amenity.setIcon(normalizeText(dto.getIcon()));
        return toDto(amenity);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Caracteristica no encontrada");
        }
        repo.deleteById(id);
    }

    private AmenityDTO toDto(Amenity amenity) {
        return new AmenityDTO(
                amenity.getId(),
                amenity.getName(),
                amenity.getDescription(),
                amenity.getIcon()
        );
    }

    private String normalizeName(String value) {
        String normalized = normalizeText(value);
        if (normalized == null) {
            throw new ResponseStatusException(BAD_REQUEST, "El nombre es obligatorio");
        }
        return normalized;
    }

    private String normalizeText(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
