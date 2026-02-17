package com.turmalin.productsapi.favorites;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/favorites")
public class FavoritesController {

    private final FavoritesService favoritesService;

    public FavoritesController(FavoritesService favoritesService) {
        this.favoritesService = favoritesService;
    }

    // Devuelve solo IDs (ideal para pintar corazones)
    @GetMapping("/ids")
    public ResponseEntity<Set<Long>> getFavoriteIds(Authentication auth) {
        String email = auth.getName(); // en tu UserDetails, username = email
        return ResponseEntity.ok(favoritesService.getFavoriteIds(email));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Set<Long>> addFavorite(@PathVariable Long productId, Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(favoritesService.addFavorite(email, productId));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Set<Long>> removeFavorite(@PathVariable Long productId, Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(favoritesService.removeFavorite(email, productId));
    }
}
