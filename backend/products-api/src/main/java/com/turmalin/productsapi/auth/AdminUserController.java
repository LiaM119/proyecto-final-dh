// src/main/java/com/turmalin/productsapi/auth/AdminUserController.java
package com.turmalin.productsapi.auth;

import com.turmalin.productsapi.auth.dto.UserView;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@CrossOrigin
public class AdminUserController {

    private final UserRepository repo;

    public AdminUserController(UserRepository repo) {
        this.repo = repo;
    }

    // -------- Helpers --------

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof User u)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        return u;
    }

    private void ensureAdmin() {
        User u = getCurrentUser();
        if (!u.isAdmin()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Solo administradores pueden realizar esta acción"
            );
        }
    }

    // 1) Listar todos los usuarios
    @GetMapping
    public List<UserView> listAll() {
        ensureAdmin();

        return repo.findAll()
                .stream()
                .map(UserView::from)
                .toList();
    }

    // DTO simple para recibir el nuevo valor de admin
    public record AdminUpdateDTO(boolean admin) {}

    // 2) Asignar / quitar admin a un usuario concreto
    @PatchMapping("/{id}/admin")
    public UserView updateAdmin(@PathVariable Long id,
                                @RequestBody AdminUpdateDTO body) {

        ensureAdmin();

        User u = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuario no encontrado"
                ));

        boolean newAdmin = body.admin();

        // actualizamos flags y rol
        u.setAdmin(newAdmin);
        u.setRole(newAdmin ? User.Role.ADMIN : User.Role.USER);

        repo.save(u);

        return UserView.from(u);
    }
}

