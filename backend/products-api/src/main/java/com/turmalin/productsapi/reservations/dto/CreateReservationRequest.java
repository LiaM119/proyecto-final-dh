package com.turmalin.productsapi.reservations.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.FutureOrPresent;

import java.time.LocalDate;

public record CreateReservationRequest(
        @NotNull(message = "reservableId es obligatorio") Long reservableId,
        @NotNull(message = "startDate es obligatoria")
        @FutureOrPresent(message = "startDate debe ser hoy o una fecha futura")
        LocalDate startDate,
        @NotNull(message = "endDate es obligatoria")
        @FutureOrPresent(message = "endDate debe ser hoy o una fecha futura")
        LocalDate endDate
) {}
