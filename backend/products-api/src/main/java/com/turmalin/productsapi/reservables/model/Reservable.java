package com.turmalin.productsapi.reservables.model;

import jakarta.persistence.*;

@Entity
@Table(name = "reservables")
public class Reservable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private com.tuapp.reservables.model.ReservableType type;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 2000)
    private String description;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public com.tuapp.reservables.model.ReservableType getType() { return type; }
    public void setType(com.tuapp.reservables.model.ReservableType type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
