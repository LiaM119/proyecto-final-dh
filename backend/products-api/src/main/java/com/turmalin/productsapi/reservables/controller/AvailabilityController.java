package com.turmalin.productsapi.reservables.controller;

import com.turmalin.productsapi.reservables.dto.AvailabilityResponse;
import com.turmalin.productsapi.reservables.service.AvailabilityService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reservables")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @GetMapping("/{id}/availability")
    public AvailabilityResponse getAvailability(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return availabilityService.getAvailability(id, from, to);
    }
}
