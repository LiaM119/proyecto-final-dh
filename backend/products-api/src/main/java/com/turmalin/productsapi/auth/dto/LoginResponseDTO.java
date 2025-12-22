package com.turmalin.productsapi.auth.dto;

import java.util.List;

public class LoginResponseDTO {

    private Long id;
    private String name;
    private String email;
    private List<String> roles;
    private String token;

    public LoginResponseDTO(Long id, String name, String email, List<String> roles, String token) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.roles = roles;
        this.token = token;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public List<String> getRoles() { return roles; }
    public String getToken() { return token; }
}
