package com.turmalin.productsapi.amenity;

import com.turmalin.productsapi.amenity.dto.AmenityDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/amenities")
@CrossOrigin(origins = "http://localhost:5173")
public class AmenityController {

    private final AmenityService service;

    public AmenityController(AmenityService service) {
        this.service = service;
    }

    @GetMapping
    public List<AmenityDTO> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public AmenityDTO get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<AmenityDTO> create(@Valid @RequestBody AmenityDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public AmenityDTO update(@PathVariable Long id, @Valid @RequestBody AmenityDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
