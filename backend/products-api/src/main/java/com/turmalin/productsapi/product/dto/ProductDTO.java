package com.turmalin.productsapi.product.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProductDTO {
    public record AmenityItem(Long id, String name, String description, String icon) {}

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private List<String> imageUrls;

    // Categoría (nuevo)
    private Long categoryId;
    private String categoryName;
    private List<Long> amenityIds;
    private List<AmenityItem> amenities;
    private Long reservableId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public List<Long> getAmenityIds() { return amenityIds; }
    public void setAmenityIds(List<Long> amenityIds) { this.amenityIds = amenityIds; }

    public List<AmenityItem> getAmenities() { return amenities; }
    public void setAmenities(List<AmenityItem> amenities) { this.amenities = amenities; }

    public Long getReservableId() { return reservableId; }
    public void setReservableId(Long reservableId) { this.reservableId = reservableId; }
}
