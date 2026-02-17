package com.turmalin.productsapi.reservables.dto;

import java.time.LocalDate;
import java.util.List;

public record AvailabilityResponse(
        Long reservableId,
        LocalDate from,
        LocalDate to,
        List<LocalDate> occupiedDates
) {}
