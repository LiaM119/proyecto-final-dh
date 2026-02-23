package com.turmalin.productsapi.reservations.controller;

import com.turmalin.productsapi.reservations.dto.CreateReservationRequest;
import com.turmalin.productsapi.reservations.dto.ReservationHistoryResponse;
import com.turmalin.productsapi.reservations.dto.ReservationResponse;
import com.turmalin.productsapi.reservations.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ReservationResponse create(@Valid @RequestBody CreateReservationRequest req) {
        return reservationService.create(req);
    }

    @GetMapping("/reservable/{reservableId}")
    public List<ReservationResponse> getByReservable(@PathVariable Long reservableId) {
        return reservationService.getByReservable(reservableId);
    }

    @GetMapping("/me")
    public List<ReservationHistoryResponse> getMyHistory() {
        return reservationService.getMyHistory();
    }

    @GetMapping("/available")
    public List<Long> findAvailable(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return reservationService.findAvailableReservables(from, to);
    }
}
