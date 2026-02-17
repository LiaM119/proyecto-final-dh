package com.turmalin.productsapi.reservations.controller;

import com.turmalin.productsapi.reservations.dto.CreateReservationRequest;
import com.turmalin.productsapi.reservations.dto.ReservationResponse;
import com.turmalin.productsapi.reservations.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

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
}
