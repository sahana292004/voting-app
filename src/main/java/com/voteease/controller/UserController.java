package com.voteease.controller;

import com.voteease.dao.UserDao;
import com.voteease.dao.VoteDao;
import com.voteease.model.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserDao userDao;
    private final VoteDao voteDao;

    public UserController(UserDao userDao, VoteDao voteDao) {
        this.userDao = userDao;
        this.voteDao = voteDao;
    }

    private User getUser(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        return userId != null ? userDao.findById(userId) : null;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAll(HttpSession session) {
        User user = getUser(session);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        if (!"admin".equals(user.getRole())) return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        return ResponseEntity.ok(userDao.findAll());
    }

    @GetMapping("/votes")
    public ResponseEntity<?> getVotes(HttpSession session) {
        User user = getUser(session);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));

        if ("admin".equals(user.getRole())) {
            return ResponseEntity.ok(voteDao.getHistoryAll());
        } else {
            return ResponseEntity.ok(voteDao.getHistoryByUser(user.getUsername()));
        }
    }
}
