package com.turmalin.productsapi.product;

import com.turmalin.productsapi.category.Category;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class Product {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    @Column(length = 2000)
    private String description;

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal price;

    @NotNull
    @Min(0)
    private Integer stock;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "url")
    private List<String> imageUrls = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

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

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public void addImage(String url) {
        if (this.imageUrls == null) this.imageUrls = new ArrayList<>();
        this.imageUrls.add(url);
    }
}
