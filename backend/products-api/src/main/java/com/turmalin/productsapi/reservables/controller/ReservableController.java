package com.turmalin.productsapi.reservables.controller;

import com.turmalin.productsapi.reservables.model.Reservable;
import com.turmalin.productsapi.reservables.service.ReservableService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservables")
public class ReservableController {

    private final ReservableService reservableService;

    public ReservableController(ReservableService reservableService) {
        this.reservableService = reservableService;
    }

    @GetMapping("/{id}")
    public Reservable getById(@PathVariable Long id) {
        return reservableService.getOrThrow(id);
    }
}
