package com.turmalin.productsapi.reservations.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateReservationRequest(
        @NotNull Long reservableId,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate
) {}
