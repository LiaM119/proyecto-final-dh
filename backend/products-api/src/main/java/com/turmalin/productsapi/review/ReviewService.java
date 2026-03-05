package com.turmalin.productsapi.review;

import com.turmalin.productsapi.auth.User;
import com.turmalin.productsapi.product.Product;
import com.turmalin.productsapi.product.ProductRepository;
import com.turmalin.productsapi.reservations.service.ReservationReviewChecker;
import com.turmalin.productsapi.review.dto.ReviewRequest;
import com.turmalin.productsapi.review.dto.ReviewResponse;
import com.turmalin.productsapi.review.dto.ReviewsSummaryResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final ReservationReviewChecker reservationReviewChecker;

    @Transactional(readOnly = true)
    public ReviewsSummaryResponse getReviews(Long productId, User currentUserOrNull) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Alojamiento no encontrado"));

        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);

        long total = reviewRepository.countByProductId(productId);
        double avg = reviewRepository.avgRating(productId);

        Long currentUserId = currentUserOrNull != null ? currentUserOrNull.getId() : null;

        List<ReviewResponse> mapped = reviews.stream().map(r -> ReviewResponse.builder()
                .id(r.getId())
                .productId(product.getId())
                .rating(r.getRating())
                .comment(r.getComment())
                .userName((r.getUser().getFirstName() + " " + r.getUser().getLastName()).trim())
                .userEmail(r.getUser().getEmail())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .mine(currentUserId != null && r.getUser().getId().equals(currentUserId))
                .build()
        ).toList();

        boolean canReview = false;
        if (currentUserOrNull != null && product.getReservableId() != null) {
            canReview = reservationReviewChecker.canReview(
                    currentUserOrNull.getId(),
                    product.getReservableId()
            );
        }

        return ReviewsSummaryResponse.builder()
                .averageRating(round1(avg))
                .totalReviews(total)
                .canReview(canReview)
                .reviews(mapped)
                .build();
    }

    @Transactional
    public ReviewResponse upsertMyReview(Long productId, ReviewRequest req, User currentUser) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Alojamiento no encontrado"));

        if (product.getReservableId() == null) {
            throw new IllegalStateException("Este alojamiento no tiene un reservable asociado");
        }

        boolean canReview = reservationReviewChecker.canReview(
                currentUser.getId(),
                product.getReservableId()
        );

        if (!canReview) {
            throw new AccessDeniedException("Solo podes valorar si tenes una reserva de este alojamiento");
        }

        Review review = reviewRepository.findByProductIdAndUserId(productId, currentUser.getId())
                .orElseGet(() -> Review.builder()
                        .product(product)
                        .user(currentUser)
                        .build());

        review.setRating(req.getRating());
        review.setComment(req.getComment());

        Review saved = reviewRepository.save(review);

        return ReviewResponse.builder()
                .id(saved.getId())
                .productId(productId)
                .rating(saved.getRating())
                .comment(saved.getComment())
                .userName((currentUser.getFirstName() + " " + currentUser.getLastName()).trim())
                .userEmail(currentUser.getEmail())
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .mine(true)
                .build();
    }

    @Transactional
    public void deleteMyReview(Long productId, User currentUser) {
        reviewRepository.findByProductIdAndUserId(productId, currentUser.getId())
                .ifPresent(reviewRepository::delete);
    }

    private double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}

