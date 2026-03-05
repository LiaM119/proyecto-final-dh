package com.turmalin.productsapi.config;

import com.turmalin.productsapi.auth.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    public SecurityConfig(
            JwtAuthFilter jwtAuthFilter,
            AuthenticationProvider authenticationProvider
    ) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())

                .csrf(csrf -> csrf.disable())

                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authenticationProvider(authenticationProvider)

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers("/auth/**").permitAll()

                        .requestMatchers("/uploads/**").permitAll()

                        .requestMatchers("/api/reservables/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/amenities/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/amenities/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/amenities/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/amenities/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/products/*/reviews").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products/*/reviews").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/products/*/reviews/**").authenticated()

                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products/").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/*").hasRole("ADMIN")

                        .requestMatchers("/api/favorites/**").authenticated()

                        .anyRequest().authenticated()
                );

        return http.build();
    }
}

