package com.turmalin.productsapi.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterDTO {
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    private String firstName;
    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100, message = "El apellido no puede superar 100 caracteres")
    private String lastName;
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato valido")
    private String email;
    @NotBlank(message = "La contrasena es obligatoria")
    @Size(min = 6, max = 200, message = "La contrasena debe tener entre 6 y 200 caracteres")
    private String password;

    public RegisterDTO() {}
    public RegisterDTO(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
