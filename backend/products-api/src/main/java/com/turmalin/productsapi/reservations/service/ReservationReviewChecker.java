package com.turmalin.productsapi.reservations.service;

import com.turmalin.productsapi.reservations.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class ReservationReviewChecker {

    private final ReservationRepository reservationRepository;

    public boolean canReview(Long userId, Long productId) {
        return reservationRepository.existsFinishedReservationByProductId(userId, productId, LocalDate.now());
    }
}
