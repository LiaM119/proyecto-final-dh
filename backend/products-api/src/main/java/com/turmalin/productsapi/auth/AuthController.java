package com.turmalin.productsapi.auth;

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
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager am;
    private final JwtUtil jwt;
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final boolean seedDemoAdmin;
    private final String seedEmail;
    private final String seedPassword;

    public AuthController(
            AuthenticationManager am,
            JwtUtil jwt,
            UserRepository repo,
            PasswordEncoder encoder,
            @Value("${app.seed-demo-admin:false}") boolean seedDemoAdmin,
            @Value("${app.seed-demo-admin-email:demo@demo.com}") String seedEmail,
            @Value("${app.seed-demo-admin-password:demo123}") String seedPassword
    ) {
        this.am = am;
        this.jwt = jwt;
        this.repo = repo;
        this.encoder = encoder;
        this.seedDemoAdmin = seedDemoAdmin;
        this.seedEmail = seedEmail;
        this.seedPassword = seedPassword;
    }

    @PostConstruct
    public void seed() {
        if (!seedDemoAdmin || seedEmail == null || seedEmail.isBlank() || seedPassword == null || seedPassword.isBlank()) {
            return;
        }

        if (!repo.existsByEmail(seedEmail)) {
            User u = User.builder()
                    .firstName("Demo")
                    .lastName("Admin")
                    .email(seedEmail)
                    .password(encoder.encode(seedPassword))
                    .admin(true)
                    .role(User.Role.ADMIN)
                    .build();
            repo.save(u);
            log.info("Seeded demo admin account: {}", seedEmail);
        }
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginDTO req) {
        String email = req.getEmail();
        String password = req.getPassword();

        if (email == null || password == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Falta email o contrasena"
            );
        }

        try {
            am.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            User u = repo.findByEmail(email).orElseThrow();

            String token = jwt.generate(
                    u.getEmail(),
                    Map.of(
                            "uid", u.getId(),
                            "name", u.getFirstName() + " " + u.getLastName(),
                            "admin", u.isAdmin()
                    )
            );

            return new AuthResponse(
                    token,
                    UserView.from(u)
            );
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Correo o contrasena incorrectos"
            );
        }
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterDTO req) {
        if (repo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El email ya esta registrado."
            );
        }

        User u = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .admin(false)
                .build();

        repo.save(u);

        String token = jwt.generate(
                u.getEmail(),
                Map.of(
                        "uid", u.getId(),
                        "name", u.getFirstName() + " " + u.getLastName(),
                        "admin", u.isAdmin()
                )
        );

        return new AuthResponse(
                token,
                UserView.from(u)
        );
    }

    @GetMapping("/me")
    public UserView me(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwt.getSubject(token);
        User u = repo.findByEmail(email).orElseThrow();
        return UserView.from(u);
    }
}
