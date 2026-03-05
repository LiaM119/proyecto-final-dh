package com.turmalin.productsapi.auth.service;

import com.turmalin.productsapi.auth.User;
import com.turmalin.productsapi.auth.UserRepository;
import com.turmalin.productsapi.auth.dto.UserView;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserManagementService {
    private final UserRepository userRepository;

    public UserManagementService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserView> listAllUsers() {
        ensureCurrentUserIsAdmin();
        return userRepository.findAll().stream().map(UserView::from).toList();
    }

    public UserView updateAdminFlag(Long id, boolean admin) {
        ensureCurrentUserIsAdmin();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        user.setAdmin(admin);
        user.setRole(admin ? User.Role.ADMIN : User.Role.USER);
        userRepository.save(user);
        return UserView.from(user);
    }

    public UserView makeAdmin(Long id) {
        return updateAdminFlag(id, true);
    }

    public UserView removeAdmin(Long id) {
        return updateAdminFlag(id, false);
    }

    private void ensureCurrentUserIsAdmin() {
        User user = getCurrentUser();
        boolean effectiveAdmin = user.isAdmin() || user.getRole() == User.Role.ADMIN;
        if (!effectiveAdmin) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Solo administradores pueden realizar esta accion"
            );
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        return user;
    }
}
