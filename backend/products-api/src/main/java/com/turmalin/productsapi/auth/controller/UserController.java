package com.turmalin.productsapi.auth.controller;

import com.turmalin.productsapi.auth.dto.UserView;
import com.turmalin.productsapi.auth.service.UserManagementService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserController {
    private final UserManagementService userManagementService;

    public UserController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping
    public List<UserView> all() {
        return userManagementService.listAllUsers();
    }

    @PutMapping("/{id}/make-admin")
    public UserView makeAdmin(@PathVariable Long id) {
        return userManagementService.makeAdmin(id);
    }

    @PutMapping("/{id}/remove-admin")
    public UserView removeAdmin(@PathVariable Long id) {
        return userManagementService.removeAdmin(id);
    }
}
