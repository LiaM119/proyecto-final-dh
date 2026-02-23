package com.turmalin.productsapi.favorites;

import com.turmalin.productsapi.auth.User;
import com.turmalin.productsapi.auth.UserRepository;
import com.turmalin.productsapi.product.Product;
import com.turmalin.productsapi.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class FavoritesService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public FavoritesService(UserRepository userRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    private User getUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuario no encontrado"));
    }

    @Transactional(readOnly = true)
    public Set<Long> getFavoriteIds(String email) {
        User user = getUserOrThrow(email);
        return user.getFavorites()
                .stream()
                .map(Product::getId)
                .collect(Collectors.toSet());
    }

    @Transactional
    public Set<Long> addFavorite(String email, Long productId) {
        User user = getUserOrThrow(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Alojamiento no encontrado"));

        user.addFavorite(product);
        userRepository.save(user);

        return getFavoriteIds(email);
    }

    @Transactional
    public Set<Long> removeFavorite(String email, Long productId) {
        User user = getUserOrThrow(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Alojamiento no encontrado"));

        user.removeFavorite(product);
        userRepository.save(user);

        return getFavoriteIds(email);
    }
}

