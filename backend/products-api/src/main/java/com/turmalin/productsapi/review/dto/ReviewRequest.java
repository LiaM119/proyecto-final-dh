package com.turmalin.productsapi.review.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequest {
    private Integer rating;   // 1..5
    private String comment;   // opcional
}
