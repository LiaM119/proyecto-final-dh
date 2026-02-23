package com.turmalin.productsapi.reservations.service;

import com.turmalin.productsapi.reservations.repository.ReservationRepository;
import com.turmalin.productsapi.reservations.model.ReservationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ReservationReviewChecker {

    private final ReservationRepository reservationRepository;

    public boolean canReview(Long userId, Long reservableId) {
        return reservationRepository.existsReviewableReservationByReservableId(
                userId,
                reservableId,
                List.of(ReservationStatus.CONFIRMED, ReservationStatus.ACTIVE)
        );
    }
}
