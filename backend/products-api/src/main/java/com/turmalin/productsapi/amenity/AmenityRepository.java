package com.turmalin.productsapi.amenity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AmenityRepository extends JpaRepository<Amenity, Long> {
    boolean existsByNameIgnoreCase(String name);
}
