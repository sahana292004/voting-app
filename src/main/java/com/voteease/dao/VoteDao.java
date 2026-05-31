package com.voteease.dao;

import com.voteease.model.Vote;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class VoteDao {

    private final JdbcTemplate jdbc;

    public VoteDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Vote> mapper = (rs, i) -> {
        Vote v = new Vote();
        v.setId(rs.getInt("id"));
        v.setPollId(rs.getInt("poll_id"));
        v.setVoter(rs.getString("voter"));
        v.setOptionText(rs.getString("option_text"));
        v.setVotedAt(rs.getString("voted_at"));
        try { v.setPollTitle(rs.getString("poll_title")); } catch (Exception ignored) {}
        return v;
    };

    public void cast(int pollId, String voter, String option) {
        jdbc.update("INSERT INTO votes (poll_id, voter, option_text) VALUES (?, ?, ?)", pollId, voter, option);
    }

    public boolean hasVoted(int pollId, String voter) {
        Integer c = jdbc.queryForObject("SELECT COUNT(*) FROM votes WHERE poll_id = ? AND voter = ?",
                Integer.class, pollId, voter);
        return c != null && c > 0;
    }

    public List<Vote> getHistoryAll() {
        return jdbc.query(
                "SELECT v.*, p.title as poll_title FROM votes v LEFT JOIN polls p ON v.poll_id = p.id ORDER BY v.id DESC",
                mapper);
    }

    public List<Vote> getHistoryByUser(String voter) {
        return jdbc.query(
                "SELECT v.*, p.title as poll_title FROM votes v LEFT JOIN polls p ON v.poll_id = p.id WHERE v.voter = ? ORDER BY v.id DESC",
                mapper, voter);
    }

    public int count() {
        Integer c = jdbc.queryForObject("SELECT COUNT(*) FROM votes", Integer.class);
        return c != null ? c : 0;
    }

    public int countByVoter(String voter) {
        Integer c = jdbc.queryForObject("SELECT COUNT(*) FROM votes WHERE voter = ?", Integer.class, voter);
        return c != null ? c : 0;
    }
}
