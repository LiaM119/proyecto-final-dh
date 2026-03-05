package com.turmalin.productsapi.product;

import com.turmalin.productsapi.product.dto.ProductDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@CrossOrigin(
        origins = { "http://localhost:5173", "http://127.0.0.1:5173" },
        allowedHeaders = "*",
        methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }
)
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/check-name")
    public Map<String, Boolean> checkName(@RequestParam String name) {
        return Map.of("exists", service.existsByName(name));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getOne(@PathVariable Long id) {
        return service.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<ProductDTO> list() { return service.findAll(); }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> create(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "amenityIds", required = false) List<Long> amenityIds,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        ProductDTO dto = service.create(name, description, price, stock, categoryId, amenityIds, images);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> update(
            @PathVariable Long id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "price", required = false) BigDecimal price,
            @RequestParam(value = "stock", required = false) Integer stock,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "amenityIds", required = false) List<Long> amenityIds,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        ProductDTO dto = service.update(id, name, description, price, stock, categoryId, amenityIds, images);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


