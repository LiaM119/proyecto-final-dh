package com.turmalin.productsapi.reservations.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.turmalin.productsapi.auth.User;
import com.turmalin.productsapi.reservables.model.Reservable;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "reservations",
        indexes = {
                @Index(name = "idx_reservation_reservable", columnList = "reservable_id"),
                @Index(name = "idx_reservation_dates", columnList = "startDate,endDate"),
                @Index(name = "idx_reservation_user", columnList = "user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "reservable_id", nullable = false)
    private Reservable reservable;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status = ReservationStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    @PreUpdate
    private void validateDates() {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("startDate y endDate son obligatorias");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("endDate no puede ser anterior a startDate");
        }
        if (status == null) {
            status = ReservationStatus.ACTIVE;
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
