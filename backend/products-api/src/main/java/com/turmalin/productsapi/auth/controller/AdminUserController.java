package com.turmalin.productsapi.auth.controller;

import com.turmalin.productsapi.auth.dto.AdminUpdateDTO;
import com.turmalin.productsapi.auth.dto.UserView;
import com.turmalin.productsapi.auth.service.UserManagementService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@CrossOrigin
public class AdminUserController {
    private final UserManagementService userManagementService;

    public AdminUserController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping
    public List<UserView> listAll() {
        return userManagementService.listAllUsers();
    }

    @PatchMapping("/{id}/admin")
    public UserView updateAdmin(@PathVariable Long id, @Valid @RequestBody AdminUpdateDTO body) {
        return userManagementService.updateAdminFlag(id, body.admin());
    }
}
