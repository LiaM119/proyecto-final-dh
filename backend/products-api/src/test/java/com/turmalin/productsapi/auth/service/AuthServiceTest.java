package com.turmalin.productsapi.auth.service;

import com.turmalin.productsapi.auth.JwtUtil;
import com.turmalin.productsapi.auth.User;
import com.turmalin.productsapi.auth.UserRepository;
import com.turmalin.productsapi.auth.dto.AuthResponse;
import com.turmalin.productsapi.auth.dto.LoginDTO;
import com.turmalin.productsapi.auth.dto.RegisterDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtil jwtUtil;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                authenticationManager,
                jwtUtil,
                userRepository,
                passwordEncoder,
                false,
                "demo@demo.com",
                "demo123"
        );
    }

    @Test
    void registerShouldFailWhenEmailAlreadyExists() {
        RegisterDTO dto = new RegisterDTO("Liam", "Romero", "liam@test.com", "password123");
        when(userRepository.existsByEmail("liam@test.com")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.register(dto));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void loginShouldFailWithBadCredentials() {
        LoginDTO dto = new LoginDTO("liam@test.com", "wrong");
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad creds"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.login(dto));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    @Test
    void loginShouldPromoteFirstUserToAdminWhenNoAdminsExist() {
        LoginDTO dto = new LoginDTO("liam@test.com", "password123");
        User user = User.builder()
                .id(10L)
                .firstName("Liam")
                .lastName("Romero")
                .email("liam@test.com")
                .password("hashed")
                .admin(false)
                .role(User.Role.USER)
                .build();

        when(userRepository.findByEmail("liam@test.com")).thenReturn(Optional.of(user));
        when(userRepository.countByAdminTrue()).thenReturn(0L);
        when(userRepository.countByRole(User.Role.ADMIN)).thenReturn(0L);
        when(jwtUtil.generate(anyString(), anyMap())).thenReturn("jwt-token");

        AuthResponse response = authService.login(dto);

        assertEquals("jwt-token", response.getToken());
        assertEquals(true, response.getUser().admin());
    }
}
