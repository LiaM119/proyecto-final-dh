// src/main/java/com/turmalin/productsapi/auth/AppUserDetailsService.java
package com.turmalin.productsapi.auth;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository repo;

    public AppUserDetailsService(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User u = repo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        // si tu enum es Role { USER, ADMIN }
        String roleName = u.getRole().name(); // "USER" o "ADMIN"

        return org.springframework.security.core.userdetails.User
                .withUsername(u.getEmail())
                .password(u.getPassword())
                // 🚨 IMPORTANTE: ROLE_ + nombre
                .authorities("ROLE_" + roleName)
                .build();
    }
}

