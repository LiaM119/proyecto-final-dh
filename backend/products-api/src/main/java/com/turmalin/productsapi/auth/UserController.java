package com.turmalin.productsapi.auth;

import com.turmalin.productsapi.auth.dto.UserView;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserController {

    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<UserView> all() {
        return repo.findAll()
                .stream()
                .map(UserView::from)
                .toList();
    }

    @PutMapping("/{id}/make-admin")
    public UserView makeAdmin(@PathVariable Long id) {
        User u = repo.findById(id).orElseThrow();
        u.setAdmin(true);
        repo.save(u);
        return UserView.from(u);
    }

    @PutMapping("/{id}/remove-admin")
    public UserView removeAdmin(@PathVariable Long id) {
        User u = repo.findById(id).orElseThrow();
        u.setAdmin(false);
        repo.save(u);
        return UserView.from(u);
    }
}
