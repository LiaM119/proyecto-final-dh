package com.turmalin.productsapi.reservables.repository;

import com.turmalin.productsapi.reservables.model.Reservable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservableRepository extends JpaRepository<Reservable, Long> {}
