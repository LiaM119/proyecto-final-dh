package com.turmalin.productsapi.auth.dto;

import com.turmalin.productsapi.auth.User;

public record UserView(
        Long id,
        String name,
        String email,
        boolean admin,
        String role
) {
    public static UserView from(User u) {

        String fullName = (u.getFirstName() + " " + u.getLastName()).trim();
        String roleName = u.getRole() != null ? u.getRole().name() : null;

        return new UserView(
                u.getId(),
                fullName,
                u.getEmail(),
                u.isAdmin(),
                roleName
        );
    }
}
