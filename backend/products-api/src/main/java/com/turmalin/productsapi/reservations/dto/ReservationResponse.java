package com.turmalin.productsapi.reservations.dto;

import java.time.LocalDate;

public record ReservationResponse(
        Long id,
        Long reservableId,
        LocalDate startDate,
        LocalDate endDate,
        String status
) {}
