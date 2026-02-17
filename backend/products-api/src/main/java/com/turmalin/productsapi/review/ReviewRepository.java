package com.turmalin.productsapi.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);

    long countByProductId(Long productId);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.product.id = :productId")
    double avgRating(Long productId);
}
