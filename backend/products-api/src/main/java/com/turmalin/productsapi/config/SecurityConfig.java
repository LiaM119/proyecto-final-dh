// src/main/java/com/turmalin/productsapi/config/SecurityConfig.java
package com.turmalin.productsapi.config;

import com.turmalin.productsapi.auth.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    // IGNORAR COMPLETAMENTE LA CONSOLA H2
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers("/h2/**");
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // Desactivamos CSRF
        http.csrf(csrf -> csrf.disable());

        // Permitir iframes (necesario para H2)
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        // Sesión stateless para JWT
        http.sessionManagement(sm ->
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

        // CORS
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // Autorizaciones
        http.authorizeHttpRequests(auth -> auth
                // ENDPOINTS PÚBLICOS (APIs y recursos estáticos)
                .requestMatchers(
                        "/auth/**",
                        "/api/auth/**",
                        "/products/**",
                        "/api/products/**",
                        "/images/**",
                        "/api/images/**",
                        "/uploads/**",        // 👈 imágenes subidas (file:./uploads/)
                        "/placeholder.jpg"    // 👈 tu imagen de placeholder si la usás en raíz
                ).permitAll()

                // ENDPOINTS /admin/**: requieren estar autenticado,
                // la verificación de admin se hace en los controllers
                .requestMatchers("/admin/**", "/api/admin/**").authenticated()

                // Todo lo demás requiere estar autenticado
                .anyRequest().authenticated()
        );

        // Filtro JWT
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Configuración de CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}


