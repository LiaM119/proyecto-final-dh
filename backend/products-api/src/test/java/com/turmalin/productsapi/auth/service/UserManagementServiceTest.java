package com.turmalin.productsapi.auth.service;

import com.turmalin.productsapi.auth.User;
import com.turmalin.productsapi.auth.UserRepository;
import com.turmalin.productsapi.auth.dto.UserView;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock private UserRepository userRepository;
    private UserManagementService userManagementService;

    @BeforeEach
    void setUp() {
        userManagementService = new UserManagementService(userRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listAllUsersShouldFailForNonAdmin() {
        User regularUser = User.builder()
                .id(1L)
                .firstName("User")
                .lastName("Regular")
                .email("user@test.com")
                .password("x")
                .admin(false)
                .role(User.Role.USER)
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(regularUser, null, regularUser.getAuthorities())
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> userManagementService.listAllUsers());

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void updateAdminFlagShouldUpdateRoleAndAdminField() {
        User admin = User.builder()
                .id(2L)
                .firstName("Admin")
                .lastName("User")
                .email("admin@test.com")
                .password("x")
                .admin(true)
                .role(User.Role.ADMIN)
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities())
        );

        User target = User.builder()
                .id(3L)
                .firstName("Target")
                .lastName("User")
                .email("target@test.com")
                .password("x")
                .admin(false)
                .role(User.Role.USER)
                .build();

        when(userRepository.findById(3L)).thenReturn(Optional.of(target));

        UserView updated = userManagementService.updateAdminFlag(3L, true);

        assertEquals(true, updated.admin());
        assertEquals("ADMIN", updated.role());
    }
}
