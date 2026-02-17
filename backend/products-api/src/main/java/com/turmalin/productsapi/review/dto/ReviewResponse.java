package com.turmalin.productsapi.review.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Long productId;

    private int rating;
    private String comment;

    private String userName;
    private String userEmail;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private boolean mine;
}
