package com.turmalin.productsapi.reservations.service;

import com.turmalin.productsapi.auth.User;
import com.turmalin.productsapi.product.Product;
import com.turmalin.productsapi.product.ProductRepository;
import com.turmalin.productsapi.reservables.model.Reservable;
import com.turmalin.productsapi.reservables.service.ReservableService;
import com.turmalin.productsapi.reservations.dto.CreateReservationRequest;
import com.turmalin.productsapi.reservations.dto.ReservationHistoryResponse;
import com.turmalin.productsapi.reservations.email.ReservationCreatedEvent;
import com.turmalin.productsapi.reservations.dto.ReservationResponse;
import com.turmalin.productsapi.reservations.model.Reservation;
import com.turmalin.productsapi.reservations.model.ReservationStatus;
import com.turmalin.productsapi.reservations.repository.ReservationRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservableService reservableService;
    private final ProductRepository productRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ConcurrentHashMap<Long, ReentrantLock> reservableLocks = new ConcurrentHashMap<>();

    public ReservationService(
            ReservationRepository reservationRepository,
            ReservableService reservableService,
            ProductRepository productRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.reservationRepository = reservationRepository;
        this.reservableService = reservableService;
        this.productRepository = productRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ReservationResponse create(CreateReservationRequest req) {
        User currentUser = getCurrentUser();

        LocalDate start = req.startDate();
        LocalDate end = req.endDate();

        if (start == null || end == null) {
            throw new IllegalArgumentException("startDate y endDate son obligatorias");
        }

        if (start.isAfter(end)) {
            throw new IllegalArgumentException(
                    "La fecha de inicio no puede ser posterior a la fecha de fin"
            );
        }

        Long reservableId = req.reservableId();
        if (reservableId == null) {
            throw new IllegalArgumentException("reservableId es obligatorio");
        }
        ReentrantLock lock = reservableLocks.computeIfAbsent(reservableId, ignored -> new ReentrantLock());
        lock.lock();
        try {
            Reservable reservable = reservableService.getOrThrow(reservableId);

            long overlaps = reservationRepository.countOverlaps(
                    reservable.getId(),
                    Collections.singletonList(ReservationStatus.CONFIRMED),
                    start,
                    end
            );

            if (overlaps > 0) {
                throw new IllegalStateException("Ya existe una reserva en ese rango de fechas");
            }

            Reservation saved = reservationRepository.save(
                    Reservation.builder()
                            .user(currentUser)
                            .reservable(reservable)
                            .startDate(start)
                            .endDate(end)
                            .status(ReservationStatus.CONFIRMED)
                            .build()
            );

            Product product = findProductByReservableId(reservable.getId());
            eventPublisher.publishEvent(new ReservationCreatedEvent(
                    saved.getId(),
                    currentUser.getEmail(),
                    currentUser.getFullName(),
                    resolveProductName(product, reservable),
                    saved.getStartDate(),
                    saved.getEndDate(),
                    resolveReservationDate(saved)
            ));

            return new ReservationResponse(
                    saved.getId(),
                    reservable.getId(),
                    saved.getStartDate(),
                    saved.getEndDate(),
                    saved.getStatus().name()
            );
        } finally {
            lock.unlock();
            if (!lock.hasQueuedThreads()) {
                reservableLocks.remove(reservableId, lock);
            }
        }
    }

    public List<ReservationResponse> getByReservable(Long reservableId) {
        Reservable reservable = reservableService.getOrThrow(reservableId);

        List<Reservation> list = reservationRepository.findOverlappingReservations(
                reservable.getId(),
                Collections.singletonList(ReservationStatus.CONFIRMED),
                LocalDate.of(1900, 1, 1),
                LocalDate.of(3000, 1, 1)
        );

        return list.stream()
                .map(r -> new ReservationResponse(
                        r.getId(),
                        reservable.getId(),
                        r.getStartDate(),
                        r.getEndDate(),
                        r.getStatus().name()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationHistoryResponse> getMyHistory() {
        User currentUser = getCurrentUser();

        List<Reservation> reservations = reservationRepository.findByUserId(currentUser.getId());
        List<Long> reservableIds = reservations.stream()
                .map(r -> r.getReservable().getId())
                .distinct()
                .toList();

        Map<Long, Product> productByReservableId = new HashMap<>();
        if (!reservableIds.isEmpty()) {
            productRepository.findByReservableIdIn(reservableIds)
                    .forEach(product -> productByReservableId.put(product.getReservableId(), product));
        }

        return reservations.stream()
                .sorted(Comparator
                        .comparing(this::resolveReservationDate)
                        .reversed()
                        .thenComparing(Reservation::getId, Comparator.nullsLast(Comparator.reverseOrder()))
                )
                .map(reservation -> {
                    Long reservableId = reservation.getReservable().getId();
                    Product product = productByReservableId.get(reservableId);

                    String productName = resolveProductName(product, reservation.getReservable());

                    String productImageUrl = null;
                    if (product != null && product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
                        productImageUrl = product.getImageUrls().get(0);
                    }

                    return new ReservationHistoryResponse(
                            reservation.getId(),
                            reservableId,
                            product != null ? product.getId() : null,
                            productName,
                            productImageUrl,
                            reservation.getStartDate(),
                            reservation.getEndDate(),
                            resolveReservationDate(reservation),
                            reservation.getStatus().name()
                    );
                })
                .toList();
    }

    public List<Long> findAvailableReservables(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new IllegalArgumentException("from y to son obligatorias");
        }
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("from no puede ser posterior a to");
        }

        return reservationRepository.findAvailableReservableIds(
                from,
                to,
                List.of(ReservationStatus.CONFIRMED)
        );
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User currentUser)) {
            throw new IllegalStateException("Usuario no autenticado");
        }
        return currentUser;
    }

    private LocalDateTime resolveReservationDate(Reservation reservation) {
        if (reservation == null) return LocalDateTime.MIN;
        if (reservation.getCreatedAt() != null) return reservation.getCreatedAt();
        if (reservation.getStartDate() != null) return reservation.getStartDate().atStartOfDay();
        return LocalDateTime.MIN;
    }

    private Product findProductByReservableId(Long reservableId) {
        if (reservableId == null) return null;
        List<Product> products = productRepository.findByReservableIdIn(List.of(reservableId));
        if (products.isEmpty()) return null;
        return products.get(0);
    }

    private String resolveProductName(Product product, Reservable reservable) {
        if (product != null && product.getName() != null && !product.getName().isBlank()) {
            return product.getName();
        }
        if (reservable != null && reservable.getName() != null && !reservable.getName().isBlank()) {
            return reservable.getName();
        }
        return "Alojamiento reservado";
    }
}

