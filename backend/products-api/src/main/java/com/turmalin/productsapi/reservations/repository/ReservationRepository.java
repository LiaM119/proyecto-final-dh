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
          AND r.status IN :statuses
        ORDER BY r.startDate ASC
    """)
    List<Reservation> findByReservableIdAndStatusIn(
            @Param("reservableId") Long reservableId,
            @Param("statuses") List<ReservationStatus> statuses
    );

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.reservable.id = :reservableId
          AND r.status IN :statuses
          AND NOT (r.endDate < :from OR r.startDate > :to)
    """)
    List<Reservation> findOverlappingReservations(
            @Param("reservableId") Long reservableId,
            @Param("statuses") List<ReservationStatus> statuses,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.user.id = :userId
    """)
    List<Reservation> findByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT COUNT(r) FROM Reservation r
        WHERE r.reservable.id = :reservableId
          AND r.status IN :statuses
          AND NOT (r.endDate < :start OR r.startDate > :end)
    """)
    long countOverlaps(
            @Param("reservableId") Long reservableId,
            @Param("statuses") List<ReservationStatus> statuses,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    @Query("""
        SELECT (COUNT(r) > 0)
        FROM Reservation r
        WHERE r.user.id = :userId
          AND r.reservable.id = :reservableId
          AND r.status IN :statuses
    """)
    boolean existsReviewableReservationByReservableId(
            @Param("userId") Long userId,
            @Param("reservableId") Long reservableId,
            @Param("statuses") List<ReservationStatus> statuses
    );

    @Query("""
        SELECT DISTINCT rsv.id
        FROM com.turmalin.productsapi.reservables.model.Reservable rsv
        WHERE NOT EXISTS (
            SELECT 1
            FROM Reservation r
            WHERE r.reservable.id = rsv.id
              AND r.status IN :statuses
              AND NOT (r.endDate < :from OR r.startDate > :to)
        )
    """)
    List<Long> findAvailableReservableIds(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("statuses") List<ReservationStatus> statuses
    );
}
