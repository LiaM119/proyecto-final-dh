package com.turmalin.productsapi.auth.service;

import com.turmalin.productsapi.auth.JwtUtil;
import com.turmalin.productsapi.auth.User;
import com.turmalin.productsapi.auth.UserRepository;
import com.turmalin.productsapi.auth.dto.AuthResponse;
import com.turmalin.productsapi.auth.dto.LoginDTO;
import com.turmalin.productsapi.auth.dto.RegisterDTO;
import com.turmalin.productsapi.auth.dto.UserView;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean seedDemoAdmin;
    private final String seedEmail;
    private final String seedPassword;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed-demo-admin:false}") boolean seedDemoAdmin,
            @Value("${app.seed-demo-admin-email:demo@demo.com}") String seedEmail,
            @Value("${app.seed-demo-admin-password:demo123}") String seedPassword
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedDemoAdmin = seedDemoAdmin;
        this.seedEmail = seedEmail;
        this.seedPassword = seedPassword;
    }

    @PostConstruct
    public void seedDemoAdminUser() {
        if (!seedDemoAdmin || seedEmail == null || seedEmail.isBlank() || seedPassword == null || seedPassword.isBlank()) {
            return;
        }

        User user = userRepository.findByEmail(seedEmail).orElse(
                User.builder()
                        .firstName("Demo")
                        .lastName("Admin")
                        .email(seedEmail)
                        .build()
        );

        user.setFirstName(user.getFirstName() == null || user.getFirstName().isBlank() ? "Demo" : user.getFirstName());
        user.setLastName(user.getLastName() == null || user.getLastName().isBlank() ? "Admin" : user.getLastName());
        user.setEmail(seedEmail);
        user.setPassword(passwordEncoder.encode(seedPassword));
        user.setAdmin(true);
        user.setRole(User.Role.ADMIN);
        userRepository.save(user);

        log.info("Seeded/updated demo admin account: {}", seedEmail);
    }

    public AuthResponse login(LoginDTO req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
            User user = userRepository.findByEmail(req.getEmail())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

            ensureAtLeastOneAdmin(user);
            normalizeAdminFlags(user);

            return new AuthResponse(buildToken(user), UserView.from(user));
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Correo o contrasena incorrectos"
            );
        }
    }

    public AuthResponse register(RegisterDTO req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya esta registrado.");
        }

        User user = User.builder()
                .firstName(req.getFirstName().trim())
                .lastName(req.getLastName().trim())
                .email(req.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .admin(false)
                .role(User.Role.USER)
                .build();

        userRepository.save(user);
        return new AuthResponse(buildToken(user), UserView.from(user));
    }

    public UserView me(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token faltante o invalido");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.getSubject(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
        normalizeAdminFlags(user);
        return UserView.from(user);
    }

    private String buildToken(User user) {
        return jwtUtil.generate(
                user.getEmail(),
                Map.of(
                        "uid", user.getId(),
                        "name", user.getFirstName() + " " + user.getLastName(),
                        "admin", user.isAdmin()
                )
        );
    }

    private void normalizeAdminFlags(User user) {
        boolean changed = false;

        if (user.getRole() == User.Role.ADMIN && !user.isAdmin()) {
            user.setAdmin(true);
            changed = true;
        }

        if (user.isAdmin() && user.getRole() != User.Role.ADMIN) {
            user.setRole(User.Role.ADMIN);
            changed = true;
        }

        if (user.getRole() == null) {
            user.setRole(user.isAdmin() ? User.Role.ADMIN : User.Role.USER);
            changed = true;
        }

        if (changed) {
            userRepository.save(user);
        }
    }

    private void ensureAtLeastOneAdmin(User currentUser) {
        boolean hasAdmin = userRepository.countByAdminTrue() > 0 || userRepository.countByRole(User.Role.ADMIN) > 0;
        if (hasAdmin) return;

        currentUser.setAdmin(true);
        currentUser.setRole(User.Role.ADMIN);
        userRepository.save(currentUser);
    }
}
