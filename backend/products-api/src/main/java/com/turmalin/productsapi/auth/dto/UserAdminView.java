package com.turmalin.productsapi.auth.dto;

import com.turmalin.productsapi.auth.User;

public class UserAdminView {

    private Long id;
    private String fullName;
    private String email;
    private boolean admin;
    private String role;

    public UserAdminView() {}

    public UserAdminView(Long id, String fullName, String email, boolean admin, String role) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.admin = admin;
        this.role = role;
    }

    public static UserAdminView from(User u) {
        String name = u.getFirstName() + " " + u.getLastName();
        return new UserAdminView(
                u.getId(),
                name,
                u.getEmail(),
                u.isAdmin(),
                u.getRole().name()
        );
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public boolean isAdmin() {
        return admin;
    }

    public String getRole() {
        return role;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
