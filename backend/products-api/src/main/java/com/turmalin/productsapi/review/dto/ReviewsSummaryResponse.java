package com.turmalin.productsapi.review.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewsSummaryResponse {
    private double averageRating;
    private long totalReviews;
    private boolean canReview;
    private List<ReviewResponse> reviews;
}
