// src/main/java/com/turmalin/productsapi/auth/AuthController.java
package com.turmalin.productsapi.auth;

import com.turmalin.productsapi.auth.dto.AuthResponse;
import com.turmalin.productsapi.auth.dto.LoginDTO;
import com.turmalin.productsapi.auth.dto.RegisterDTO;
import com.turmalin.productsapi.auth.dto.UserView;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin // deja que llame el front
public class AuthController {

    private final AuthenticationManager am;
    private final JwtUtil jwt;
    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public AuthController(
            AuthenticationManager am,
            JwtUtil jwt,
            UserRepository repo,
            PasswordEncoder encoder
    ) {
        this.am = am;
        this.jwt = jwt;
        this.repo = repo;
        this.encoder = encoder;
    }

    // ================== SEED ADMIN DEMO ==================
    @PostConstruct
    public void seed() {
        if (!repo.existsByEmail("demo@demo.com")) {
            User u = User.builder()
                    .firstName("Demo")
                    .lastName("Admin")
                    .email("demo@demo.com")
                    .password(encoder.encode("demo123")) // pass demo123
                    .admin(true)
                    .role(User.Role.ADMIN)               // 👈 IMPORTANTE
                    .build();
            repo.save(u);
            System.out.println(">>> Usuario demo@demo.com creado como ADMIN (pass: demo123)");
        }
    }


    // ================== LOGIN ==================
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginDTO req) {

        String email = req.getEmail();
        String password = req.getPassword();

        System.out.println(">>> /auth/login email=" + email);

        if (email == null || password == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Falta email o contraseña"
            );
        }

        try {
            Authentication auth = am.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            // Usuario encontrado y password OK
            User u = repo.findByEmail(email).orElseThrow();

            String token = jwt.generate(
                    u.getEmail(),
                    Map.of(
                            "uid",   u.getId(),
                            "name",  u.getFirstName() + " " + u.getLastName(),
                            "admin", u.isAdmin()
                    )
            );

            return new AuthResponse(
                    token,
                    UserView.from(u)
            );

        } catch (BadCredentialsException e) {
            // credenciales incorrectas → 401
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Correo o contraseña incorrectos"
            );
        }
    }

    // ================== REGISTER ==================
    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterDTO req) {

        System.out.println(">>> LLEGÓ A /auth/register con: " + req.getEmail());

        if (repo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El email ya está registrado."
            );
        }

        User u = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .admin(false)          // nuevos = usuario normal
                .build();

        repo.save(u);

        String token = jwt.generate(
                u.getEmail(),
                Map.of(
                        "uid",   u.getId(),
                        "name",  u.getFirstName() + " " + u.getLastName(),
                        "admin", u.isAdmin()
                )
        );

        return new AuthResponse(
                token,
                UserView.from(u)
        );
    }

    // ================== /me ==================
    @GetMapping("/me")
    public UserView me(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwt.getSubject(token);
        User u = repo.findByEmail(email).orElseThrow();
        return UserView.from(u);
    }
}
