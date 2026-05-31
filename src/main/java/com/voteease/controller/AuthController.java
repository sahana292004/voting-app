package com.voteease.controller;

import com.voteease.dao.UserDao;
import com.voteease.model.User;
import jakarta.servlet.http.HttpSession;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private static final String ADMIN_SECRET = "ADMIN2026";
    private final UserDao userDao;

    public AuthController(UserDao userDao) {
        this.userDao = userDao;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "").trim();
        String username = body.getOrDefault("username", "").trim();
        String email = body.getOrDefault("email", "").trim();
        String password = body.getOrDefault("password", "");
        String role = body.getOrDefault("role", "voter");
        String adminCode = body.getOrDefault("adminCode", "");

        if (name.isEmpty() || username.isEmpty() || email.isEmpty() || password.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required."));
        if (username.length() < 3)
            return ResponseEntity.badRequest().body(Map.of("error", "Username must be at least 3 characters."));
        if (password.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters."));
        if (!email.contains("@"))
            return ResponseEntity.badRequest().body(Map.of("error", "Enter a valid email."));
        if (userDao.findByUsername(username) != null)
            return ResponseEntity.badRequest().body(Map.of("error", "Username already taken."));
        if (userDao.findByEmail(email) != null)
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered."));
        if ("admin".equals(role) && !ADMIN_SECRET.equals(adminCode))
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid admin secret code."));

        String hash = BCrypt.hashpw(password, BCrypt.gensalt(10));
        userDao.create(name, username, email, hash, role);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpSession session) {
        String username = body.getOrDefault("username", "").trim();
        String password = body.getOrDefault("password", "");

        if (username.isEmpty() || password.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Enter username and password."));

        User user = userDao.findByUsername(username);
        if (user == null || !BCrypt.checkpw(password, user.getPassword()))
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password."));

        session.setAttribute("userId", user.getId());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "user", Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole(),
                        "joined", user.getJoined()
                )
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));

        User u = userDao.findById(userId);
        if (u == null) return ResponseEntity.status(401).body(Map.of("error", "User not found"));

        int voteCount = userDao.countVotesByUser(u.getUsername());
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "name", u.getName(),
                "username", u.getUsername(),
                "email", u.getEmail(),
                "role", u.getRole(),
                "joined", u.getJoined(),
                "voteCount", voteCount
        ));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));

        User u = userDao.findById(userId);
        if (u == null) return ResponseEntity.status(401).body(Map.of("error", "User not found"));

        String oldPw = body.getOrDefault("oldPassword", "");
        String newPw = body.getOrDefault("newPassword", "");

        if (oldPw.isEmpty() || newPw.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "All fields required."));
        if (!BCrypt.checkpw(oldPw, u.getPassword()))
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect."));
        if (newPw.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 6 characters."));

        userDao.updatePassword(userId, BCrypt.hashpw(newPw, BCrypt.gensalt(10)));
        return ResponseEntity.ok(Map.of("success", true, "message", "Password updated successfully!"));
    }
}
