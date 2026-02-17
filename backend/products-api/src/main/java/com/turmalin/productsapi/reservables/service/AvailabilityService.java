package com.turmalin.productsapi.reservables.service;

import com.turmalin.productsapi.reservables.dto.AvailabilityResponse;
import com.turmalin.productsapi.reservations.model.Reservation;
import com.turmalin.productsapi.reservations.model.ReservationStatus;
import com.turmalin.productsapi.reservations.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class AvailabilityService {

    private final ReservationRepository reservationRepository;

    public AvailabilityService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    public AvailabilityResponse getAvailability(Long reservableId, LocalDate from, LocalDate to) {
        if (from.isAfter(to)) throw new IllegalArgumentException("Rango inválido");

        List<Reservation> overlaps = reservationRepository.findOverlappingReservations(
                reservableId, ReservationStatus.CONFIRMED, from, to
        );

        Set<LocalDate> occupied = new HashSet<>();
        for (Reservation r : overlaps) {
            LocalDate cur = r.getStartDate();
            while (!cur.isAfter(r.getEndDate())) {
                // solo agrega dentro del rango consultado
                if (!cur.isBefore(from) && !cur.isAfter(to)) occupied.add(cur);
                cur = cur.plusDays(1);
            }
        }

        List<LocalDate> occupiedSorted = occupied.stream().sorted().toList();
        return new AvailabilityResponse(reservableId, from, to, occupiedSorted);
    }
}
