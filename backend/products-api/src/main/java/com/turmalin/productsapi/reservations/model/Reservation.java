package com.turmalin.productsapi.reservations.model;

import com.turmalin.productsapi.auth.User;
import com.turmalin.productsapi.reservables.model.Reservable;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "reservations",
        indexes = {
                @Index(name = "idx_reservation_reservable", columnList = "reservable_id"),
                @Index(name = "idx_reservation_dates", columnList = "startDate,endDate"),
                @Index(name = "idx_reservation_user", columnList = "user_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ NUEVO: quién reservó
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "reservable_id", nullable = false)
    private Reservable reservable;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate; // inclusive (tipo booking)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status;
}
