package com.voteease.controller;

import com.voteease.dao.PollDao;
import com.voteease.dao.UserDao;
import com.voteease.dao.VoteDao;
import com.voteease.model.Poll;
import com.voteease.model.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PollController {

    private final PollDao pollDao;
    private final VoteDao voteDao;
    private final UserDao userDao;

    public PollController(PollDao pollDao, VoteDao voteDao, UserDao userDao) {
        this.pollDao = pollDao;
        this.voteDao = voteDao;
        this.userDao = userDao;
    }

    private User getUser(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        return userId != null ? userDao.findById(userId) : null;
    }

    @PostMapping("/polls")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, HttpSession session) {
        User user = getUser(session);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        if (!"admin".equals(user.getRole())) return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));

        String title = (String) body.getOrDefault("title", "");
        @SuppressWarnings("unchecked")
        List<String> options = (List<String>) body.getOrDefault("options", List.of());

        if (title == null || title.trim().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Enter a question."));

        List<String> clean = options.stream().map(String::trim).filter(s -> !s.isEmpty()).toList();
        if (clean.size() < 2)
            return ResponseEntity.badRequest().body(Map.of("error", "Add at least 2 options."));

        int pollId = pollDao.create(title.trim(), user.getUsername());
        for (String opt : clean) pollDao.addOption(pollId, opt);

        return ResponseEntity.ok(Map.of("success", true, "pollId", pollId));
    }

    @GetMapping("/polls")
    public ResponseEntity<?> getAll(HttpSession session) {
        User user = getUser(session);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        return ResponseEntity.ok(pollDao.findAll(user.getUsername()));
    }

    @PutMapping("/polls/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable int id, HttpSession session) {
        User user = getUser(session);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        if (!"admin".equals(user.getRole())) return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));

        Poll p = pollDao.findById(id);
        if (p == null) return ResponseEntity.status(404).body(Map.of("error", "Poll not found."));

        pollDao.toggleStatus(id);
        String newStatus = pollDao.getStatus(id);
        return ResponseEntity.ok(Map.of("success", true, "status", newStatus));
    }

    @DeleteMapping("/polls/{id}")
    public ResponseEntity<?> delete(@PathVariable int id, HttpSession session) {
        User user = getUser(session);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        if (!"admin".equals(user.getRole())) return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));

        pollDao.delete(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/polls/{id}/vote")
    public ResponseEntity<?> vote(@PathVariable int id, @RequestBody Map<String, String> body, HttpSession session) {
        User user = getUser(session);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));

        String option = body.getOrDefault("option", "");
        if (option.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Please select an option."));

        Poll p = pollDao.findById(id);
        if (p == null) return ResponseEntity.status(404).body(Map.of("error", "Poll not found."));
        if (!"open".equals(p.getStatus())) return ResponseEntity.badRequest().body(Map.of("error", "This poll is closed."));
        if (voteDao.hasVoted(id, user.getUsername()))
            return ResponseEntity.badRequest().body(Map.of("error", "You have already voted on this poll."));

        voteDao.cast(id, user.getUsername(), option);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/results")
    public ResponseEntity<?> results(HttpSession session) {
        User user = getUser(session);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        return ResponseEntity.ok(pollDao.findAllWithResults());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats(HttpSession session) {
        User user = getUser(session);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));

        boolean isAdmin = "admin".equals(user.getRole());
        int totalVotes = isAdmin ? voteDao.count() : voteDao.countByVoter(user.getUsername());

        return ResponseEntity.ok(Map.of(
                "totalPolls", pollDao.count(),
                "openPolls", pollDao.countOpen(),
                "totalVotes", totalVotes,
                "totalUsers", userDao.count(),
                "isAdmin", isAdmin
        ));
    }
}
