package com.turmalin.productsapi.review;

import com.turmalin.productsapi.auth.User;
import com.turmalin.productsapi.review.dto.ReviewRequest;
import com.turmalin.productsapi.review.dto.ReviewResponse;
import com.turmalin.productsapi.review.dto.ReviewsSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ReviewsSummaryResponse> getReviews(
            @PathVariable Long productId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(reviewService.getReviews(productId, user));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> upsertMyReview(
            @PathVariable Long productId,
            @RequestBody ReviewRequest req,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(reviewService.upsertMyReview(productId, req, user));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyReview(
            @PathVariable Long productId,
            @AuthenticationPrincipal User user
    ) {
        reviewService.deleteMyReview(productId, user);
        return ResponseEntity.noContent().build();
    }
}
