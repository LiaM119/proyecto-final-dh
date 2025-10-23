package com.turmalin.productsapi.product;

import com.turmalin.productsapi.product.dto.ProductDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    // 🔹 Verificar si existe un producto por nombre
    @GetMapping("/check-name")
    public Map<String, Boolean> checkName(@RequestParam String name) {
        return Map.of("exists", service.existsByName(name));
    }

    // 🔹 Obtener producto por ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getOne(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 Listar todos los productos
    @GetMapping
    public List<ProductDTO> list() {
        return service.findAll();
    }

    // 🔹 Crear un nuevo producto (multipart/form-data)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "category", required = false) String category,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            ProductDTO dto = service.create(name, description, price, stock, category, images);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Nombre duplicado"));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al procesar las imágenes"));
        }
    }

    // 🔹 Eliminar producto por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Producto no encontrado"));
        }
    }
}
