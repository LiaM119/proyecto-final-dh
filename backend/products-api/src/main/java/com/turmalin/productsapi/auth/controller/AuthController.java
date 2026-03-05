package com.turmalin.productsapi.auth.controller;

import com.turmalin.productsapi.auth.dto.AuthResponse;
import com.turmalin.productsapi.auth.dto.LoginDTO;
import com.turmalin.productsapi.auth.dto.RegisterDTO;
import com.turmalin.productsapi.auth.dto.UserView;
import com.turmalin.productsapi.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginDTO req) {
        return authService.login(req);
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterDTO req) {
        return authService.register(req);
    }

    @GetMapping("/me")
    public UserView me(@RequestHeader("Authorization") String authHeader) {
        return authService.me(authHeader);
    }
}
