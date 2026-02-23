package com.turmalin.productsapi.reservations.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservationHistoryResponse(
        Long id,
        Long reservableId,
        Long productId,
        String productName,
        String productImageUrl,
        LocalDate startDate,
        LocalDate endDate,
        LocalDateTime reservedAt,
        String status
) {}
