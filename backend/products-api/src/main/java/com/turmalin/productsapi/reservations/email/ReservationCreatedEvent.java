package com.turmalin.productsapi.reservations.email;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservationCreatedEvent(
        Long reservationId,
        String recipientEmail,
        String recipientName,
        String productName,
        LocalDate startDate,
        LocalDate endDate,
        LocalDateTime reservedAt
) {}
