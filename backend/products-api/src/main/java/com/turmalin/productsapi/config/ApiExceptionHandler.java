package com.turmalin.productsapi.config;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> responseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());

        String reason = ex.getReason();
        String msg = (reason != null && !reason.isBlank())
                ? reason
                : "Ocurrio un error";

        return ResponseEntity.status(status).body(Map.of("message", msg));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .orElse("Datos invalidos");

        return ResponseEntity.badRequest().body(Map.of("message", msg));
    }

    @ExceptionHandler({ConstraintViolationException.class, HandlerMethodValidationException.class})
    public ResponseEntity<Map<String, String>> constraintValidation(Exception ex) {
        String msg = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                : "Datos invalidos";
        return ResponseEntity.badRequest().body(Map.of("message", msg));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> conflict(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> forbidden(AccessDeniedException ex) {
        String msg = (ex.getMessage() != null && !ex.getMessage().isBlank())
                ? ex.getMessage()
                : "No autorizado para realizar esta accion";
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", msg));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> notFound(EntityNotFoundException ex) {
        String msg = (ex.getMessage() != null && !ex.getMessage().isBlank())
                ? ex.getMessage()
                : "Recurso no encontrado";
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> generic(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "No se pudo obtener la informacion en este momento"));
    }
}
