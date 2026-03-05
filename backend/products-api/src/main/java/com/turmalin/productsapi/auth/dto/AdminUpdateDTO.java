package com.turmalin.productsapi.auth.dto;

import jakarta.validation.constraints.NotNull;

public record AdminUpdateDTO(@NotNull Boolean admin) {
}
