package com.turmalin.productsapi.reservables.service;

import com.turmalin.productsapi.reservables.model.Reservable;
import com.turmalin.productsapi.reservables.repository.ReservableRepository;
import org.springframework.stereotype.Service;

@Service
public class ReservableService {
    private final ReservableRepository reservableRepository;

    public ReservableService(ReservableRepository reservableRepository) {
        this.reservableRepository = reservableRepository;
    }

    public Reservable getOrThrow(Long id) {
        return reservableRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservable no encontrado"));
    }
}
