package com.voteease.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbc;

    public DataInitializer(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {
        try {
            Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM polls", Integer.class);
            if (count != null && count > 0) {
                System.out.println("\n  Database already has polls — skipping seed.\n");
                return;
            }

            String[][] seeds = {
                {"Best programming language?", "Python", "JavaScript", "Java", "C++"},
                {"Preferred project theme?", "Web App", "Mobile App", "AI/ML", "Game Dev"},
                {"Favorite database?", "MySQL", "MongoDB", "PostgreSQL", "Firebase"}
            };

            for (String[] s : seeds) {
                jdbc.update("INSERT INTO polls (title, created_by) VALUES (?, ?)", s[0], "System");
                Integer pollId = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
                for (int i = 1; i < s.length; i++) {
                    jdbc.update("INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)", pollId, s[i]);
                }
            }
            System.out.println("\n  Seeded 3 default polls into the database.\n");
        } catch (Exception e) {
            System.out.println("\n  Database table not ready yet or seed failed: " + e.getMessage() + "\n");
        }
    }
}
