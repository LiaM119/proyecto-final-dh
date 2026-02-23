package com.turmalin.productsapi.product;

import com.turmalin.productsapi.category.Category;
import com.turmalin.productsapi.category.CategoryRepository;
import com.turmalin.productsapi.favorites.FavoriteRepository;
import com.turmalin.productsapi.product.dto.ProductDTO;
import com.turmalin.productsapi.reservables.model.Reservable;
import com.turmalin.productsapi.reservables.repository.ReservableRepository;
import com.turmalin.productsapi.review.ReviewRepository;
import com.turmalin.productsapi.storage.FileStorageService;
import com.tuapp.reservables.model.ReservableType;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ProductService {

    private final ProductRepository repo;
    private final FileStorageService storage;
    private final CategoryRepository categoryRepository;
    private final ReservableRepository reservableRepository;
    private final ReviewRepository reviewRepository;
    private final FavoriteRepository favoriteRepository;

    public ProductService(ProductRepository repo,
                          FileStorageService storage,
                          CategoryRepository categoryRepository,
                          ReservableRepository reservableRepository,
                          ReviewRepository reviewRepository,
                          FavoriteRepository favoriteRepository) {
        this.repo = repo;
        this.storage = storage;
        this.categoryRepository = categoryRepository;
        this.reservableRepository = reservableRepository;
        this.reviewRepository = reviewRepository;
        this.favoriteRepository = favoriteRepository;
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
            throw new IllegalStateException("El nombre del alojamiento ya existe");
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

        p = repo.save(p);
        p = ensureReservableLinked(p);
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

        p = repo.save(p);
        p = ensureReservableLinked(p);
        return toDto(p);
    }

    public List<ProductDTO> findAll() {
        return repo.findAll().stream()
                .map(this::ensureReservableLinked)
                .map(this::toDto)
                .toList();
    }

    public Optional<ProductDTO> findById(Long id) {
        return repo.findById(id)
                .map(this::ensureReservableLinked)
                .map(this::toDto);
    }

    @Transactional
    public void delete(Long id) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Alojamiento no encontrado"));

        try {
            reviewRepository.deleteByProductId(id);
            repo.deleteUserFavoritesByProductId(id);
            favoriteRepository.deleteByProductId(id);
            repo.delete(product);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    CONFLICT,
                    "No se puede eliminar el alojamiento porque tiene datos asociados"
            );
        }
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
        dto.setReservableId(p.getReservableId());

        if (p.getCategory() != null) {
            dto.setCategoryId(p.getCategory().getId());
            dto.setCategoryName(p.getCategory().getName());
        } else {
            dto.setCategoryId(null);
            dto.setCategoryName(null);
        }
        return dto;
    }

    private Product ensureReservableLinked(Product p) {
        if (p == null) return null;

        Reservable reservable = null;
        if (p.getReservableId() != null) {
            reservable = reservableRepository.findById(p.getReservableId()).orElse(null);
        }

        if (reservable == null) {
            reservable = new Reservable();
            reservable.setType(ReservableType.PRODUCT);
            reservable.setName(p.getName());
            reservable.setDescription(p.getDescription());
            reservable = reservableRepository.save(reservable);

            p.setReservableId(reservable.getId());
            return repo.save(p);
        }

        boolean changed = false;
        if (reservable.getType() != ReservableType.PRODUCT) {
            reservable.setType(ReservableType.PRODUCT);
            changed = true;
        }
        if (!Objects.equals(reservable.getName(), p.getName())) {
            reservable.setName(p.getName());
            changed = true;
        }
        if (!Objects.equals(reservable.getDescription(), p.getDescription())) {
            reservable.setDescription(p.getDescription());
            changed = true;
        }
        if (changed) {
            reservableRepository.save(reservable);
        }
        return p;
    }
}


