package com.turmalin.productsapi.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByNameIgnoreCase(String name);

    long countByCategoryId(Long categoryId);

    @Modifying
    @Query("DELETE FROM Product p WHERE p.category.id = :categoryId")
    void deleteByCategoryId(Long categoryId);
}
