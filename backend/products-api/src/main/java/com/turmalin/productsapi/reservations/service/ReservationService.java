package com.turmalin.productsapi.reservations.service;

import com.turmalin.productsapi.auth.User;
import com.turmalin.productsapi.reservables.model.Reservable;
import com.turmalin.productsapi.reservables.service.ReservableService;
import com.turmalin.productsapi.reservations.dto.CreateReservationRequest;
import com.turmalin.productsapi.reservations.dto.ReservationResponse;
import com.turmalin.productsapi.reservations.model.Reservation;
import com.turmalin.productsapi.reservations.model.ReservationStatus;
import com.turmalin.productsapi.reservations.repository.ReservationRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservableService reservableService;

    public ReservationService(
            ReservationRepository reservationRepository,
            ReservableService reservableService
    ) {
        this.reservationRepository = reservationRepository;
        this.reservableService = reservableService;
    }

    public ReservationResponse create(CreateReservationRequest req) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();

        LocalDate start = req.startDate();
        LocalDate end = req.endDate();

        if (start.isAfter(end)) {
            throw new IllegalArgumentException(
                    "La fecha de inicio no puede ser posterior a la fecha de fin"
            );
        }

        Reservable reservable = reservableService.getOrThrow(req.reservableId());

        long overlaps = reservationRepository.countOverlaps(
                reservable.getId(),
                ReservationStatus.CONFIRMED,
                start,
                end
        );

        if (overlaps > 0) {
            throw new IllegalStateException(
                    "Ya existe una reserva en ese rango de fechas"
            );
        }

        Reservation saved = reservationRepository.save(
                Reservation.builder()
                        .user(currentUser)
                        .reservable(reservable)
                        .startDate(start)
                        .endDate(end)
                        .status(ReservationStatus.CONFIRMED)
                        .build()
        );

        return new ReservationResponse(
                saved.getId(),
                reservable.getId(),
                saved.getStartDate(),
                saved.getEndDate(),
                saved.getStatus().name()
        );
    }
}
