package com.turmalin.productsapi.validation;

import com.turmalin.productsapi.amenity.dto.AmenityDTO;
import com.turmalin.productsapi.auth.dto.LoginDTO;
import com.turmalin.productsapi.auth.dto.RegisterDTO;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DtoValidationTest {
    private static Validator validator;

    @BeforeAll
    static void initValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void loginDtoShouldFailWhenEmailAndPasswordAreBlank() {
        LoginDTO dto = new LoginDTO(" ", "");
        Set<ConstraintViolation<LoginDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
    }

    @Test
    void registerDtoShouldFailWithInvalidEmailAndShortPassword() {
        RegisterDTO dto = new RegisterDTO("Liam", "Romero", "bad-email", "123");
        Set<ConstraintViolation<RegisterDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
    }

    @Test
    void amenityDtoShouldFailWhenNameIsBlank() {
        AmenityDTO dto = new AmenityDTO(null, "   ", "Desc", "icon");
        Set<ConstraintViolation<AmenityDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
    }

    @Test
    void amenityDtoShouldPassWithValidData() {
        AmenityDTO dto = new AmenityDTO(null, "WiFi", "Internet", "wifi");
        Set<ConstraintViolation<AmenityDTO>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }
}
