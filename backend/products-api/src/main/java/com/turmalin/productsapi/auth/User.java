package com.turmalin.productsapi.auth;

import com.turmalin.productsapi.product.Product;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    // Lo dejo porque lo tenés, pero en la práctica con Role alcanza.
    @Column(nullable = false)
    @Builder.Default
    private boolean admin = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    public enum Role {
        USER,
        ADMIN
    }

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_favorites",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    @Builder.Default
    private Set<Product> favorites = new HashSet<>();

    public void addFavorite(Product product) {
        if (product == null) return;
        favorites.add(product);
    }

    public void removeFavorite(Product product) {
        if (product == null) return;
        favorites.remove(product);
    }

    public boolean hasFavorite(Long productId) {
        if (productId == null) return false;
        return favorites.stream().anyMatch(p -> productId.equals(p.getId()));
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        boolean isAdmin = admin || role == Role.ADMIN;
        return List.of(new SimpleGrantedAuthority(isAdmin ? "ROLE_ADMIN" : "ROLE_USER"));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
