package com.turmalin.productsapi.reservations.repository;

import com.turmalin.productsapi.reservations.model.Reservation;
import com.turmalin.productsapi.reservations.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.reservable.id = :reservableId
          AND r.status = :status
          AND NOT (r.endDate < :from OR r.startDate > :to)
    """)
    List<Reservation> findOverlappingReservations(
            @Param("reservableId") Long reservableId,
            @Param("status") ReservationStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COUNT(r) FROM Reservation r
        WHERE r.reservable.id = :reservableId
          AND r.status = :status
          AND NOT (r.endDate < :start OR r.startDate > :end)
    """)
    long countOverlaps(
            @Param("reservableId") Long reservableId,
            @Param("status") ReservationStatus status,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    @Query("""
        SELECT (COUNT(r) > 0)
        FROM Reservation r
        WHERE r.user.id = :userId
          AND r.reservable.id = :productId
          AND r.endDate < :today
          AND r.status = com.turmalin.productsapi.reservations.model.ReservationStatus.CONFIRMED
    """)
    boolean existsFinishedReservationByProductId(
            @Param("userId") Long userId,
            @Param("productId") Long productId,
            @Param("today") LocalDate today
    );
}
