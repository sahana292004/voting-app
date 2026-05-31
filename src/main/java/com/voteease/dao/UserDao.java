package com.voteease.dao;

import com.voteease.model.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class UserDao {

    private final JdbcTemplate jdbc;

    public UserDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<User> mapper = (rs, i) -> {
        User u = new User();
        u.setId(rs.getInt("id"));
        u.setName(rs.getString("name"));
        u.setUsername(rs.getString("username"));
        u.setEmail(rs.getString("email"));
        u.setPassword(rs.getString("password"));
        u.setRole(rs.getString("role"));
        u.setJoined(rs.getString("joined"));
        return u;
    };

    private final RowMapper<User> safeMapper = (rs, i) -> {
        User u = new User();
        u.setId(rs.getInt("id"));
        u.setName(rs.getString("name"));
        u.setUsername(rs.getString("username"));
        u.setEmail(rs.getString("email"));
        u.setRole(rs.getString("role"));
        u.setJoined(rs.getString("joined"));
        return u;
    };

    public User findByUsername(String username) {
        List<User> list = jdbc.query("SELECT * FROM users WHERE username = ?", mapper, username.toLowerCase());
        return list.isEmpty() ? null : list.get(0);
    }

    public User findById(int id) {
        List<User> list = jdbc.query("SELECT * FROM users WHERE id = ?", mapper, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public User findByEmail(String email) {
        List<User> list = jdbc.query("SELECT * FROM users WHERE email = ?", mapper, email.toLowerCase());
        return list.isEmpty() ? null : list.get(0);
    }

    public void create(String name, String username, String email, String hashedPassword, String role) {
        jdbc.update("INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)",
                name, username.toLowerCase(), email.toLowerCase(), hashedPassword, role);
    }

    public void updatePassword(int id, String hashedPassword) {
        jdbc.update("UPDATE users SET password = ? WHERE id = ?", hashedPassword, id);
    }

    public List<User> findAll() {
        return jdbc.query("SELECT id, name, username, email, role, joined FROM users ORDER BY id DESC", safeMapper);
    }

    public int count() {
        Integer c = jdbc.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
        return c != null ? c : 0;
    }

    public int countVotesByUser(String username) {
        Integer c = jdbc.queryForObject("SELECT COUNT(*) FROM votes WHERE voter = ?", Integer.class, username);
        return c != null ? c : 0;
    }
}
