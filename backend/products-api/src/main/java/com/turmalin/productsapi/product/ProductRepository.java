package com.turmalin.productsapi.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByNameIgnoreCase(String name);

    long countByCategoryId(Long categoryId);

    @Modifying
    @Query("DELETE FROM Product p WHERE p.category.id = :categoryId")
    void deleteByCategoryId(Long categoryId);

    List<Product> findByReservableIdIn(List<Long> reservableIds);

    @Modifying
    @Query(value = "DELETE FROM user_favorites WHERE product_id = :productId", nativeQuery = true)
    void deleteUserFavoritesByProductId(@Param("productId") Long productId);
}
