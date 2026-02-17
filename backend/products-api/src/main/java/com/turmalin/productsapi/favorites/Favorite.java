// src/main/java/.../favorites/Favorite.java
package com.turmalin.productsapi.favorites;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "favorites", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", nullable = false)
    private Long userId;

    @Column(name="product_id", nullable = false)
    private Long productId;

    @Column(name="created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Favorite() {}

    public Favorite(Long userId, Long productId) {
        this.userId = userId;
        this.productId = productId;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getProductId() { return productId; }
    public Instant getCreatedAt() { return createdAt; }
}
