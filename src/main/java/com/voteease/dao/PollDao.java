package com.voteease.dao;

import com.voteease.model.Poll;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class PollDao {

    private final JdbcTemplate jdbc;

    public PollDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public int create(String title, String createdBy) {
        jdbc.update("INSERT INTO polls (title, created_by) VALUES (?, ?)", title, createdBy);
        Integer id = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        return id != null ? id : 0;
    }

    public void addOption(int pollId, String optionText) {
        jdbc.update("INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)", pollId, optionText);
    }

    public List<String> getOptions(int pollId) {
        return jdbc.queryForList("SELECT option_text FROM poll_options WHERE poll_id = ?", String.class, pollId);
    }

    public List<Poll> findAll(String currentUsername) {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM polls ORDER BY id DESC");
        List<Poll> polls = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            Poll p = new Poll();
            p.setId((int) row.get("id"));
            p.setTitle((String) row.get("title"));
            p.setStatus(row.get("status").toString());
            p.setCreated(row.get("created").toString());
            p.setCreatedBy((String) row.get("created_by"));
            p.setOptions(getOptions(p.getId()));

            Integer vc = jdbc.queryForObject("SELECT COUNT(*) FROM votes WHERE poll_id = ?", Integer.class, p.getId());
            p.setVoteCount(vc != null ? vc : 0);

            if (currentUsername != null) {
                List<String> uv = jdbc.queryForList(
                        "SELECT option_text FROM votes WHERE poll_id = ? AND voter = ?",
                        String.class, p.getId(), currentUsername);
                p.setUserVote(uv.isEmpty() ? null : uv.get(0));
            }
            polls.add(p);
        }
        return polls;
    }

    public Poll findById(int id) {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM polls WHERE id = ?", id);
        if (rows.isEmpty()) return null;
        Map<String, Object> row = rows.get(0);
        Poll p = new Poll();
        p.setId((int) row.get("id"));
        p.setTitle((String) row.get("title"));
        p.setStatus(row.get("status").toString());
        p.setCreated(row.get("created").toString());
        p.setCreatedBy((String) row.get("created_by"));
        p.setOptions(getOptions(p.getId()));
        return p;
    }

    public void toggleStatus(int id) {
        jdbc.update("UPDATE polls SET status = IF(status='open','closed','open') WHERE id = ?", id);
    }

    public String getStatus(int id) {
        List<String> s = jdbc.queryForList("SELECT status FROM polls WHERE id = ?", String.class, id);
        return s.isEmpty() ? null : s.get(0);
    }

    public void delete(int id) {
        jdbc.update("DELETE FROM votes WHERE poll_id = ?", id);
        jdbc.update("DELETE FROM poll_options WHERE poll_id = ?", id);
        jdbc.update("DELETE FROM polls WHERE id = ?", id);
    }

    public int count() {
        Integer c = jdbc.queryForObject("SELECT COUNT(*) FROM polls", Integer.class);
        return c != null ? c : 0;
    }

    public int countOpen() {
        Integer c = jdbc.queryForObject("SELECT COUNT(*) FROM polls WHERE status = 'open'", Integer.class);
        return c != null ? c : 0;
    }

    public List<Poll> findAllWithResults() {
        List<Poll> polls = findAll(null);
        for (Poll p : polls) {
            Map<String, Integer> counts = new LinkedHashMap<>();
            for (String opt : p.getOptions()) counts.put(opt, 0);

            List<Map<String, Object>> vc = jdbc.queryForList(
                    "SELECT option_text, COUNT(*) as cnt FROM votes WHERE poll_id = ? GROUP BY option_text", p.getId());
            for (Map<String, Object> v : vc) {
                counts.put((String) v.get("option_text"), ((Long) v.get("cnt")).intValue());
            }
            p.setCounts(counts);
            p.setTotal(counts.values().stream().mapToInt(Integer::intValue).sum());
        }
        return polls;
    }
}
