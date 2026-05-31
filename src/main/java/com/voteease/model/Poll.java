package com.voteease.model;

import java.util.List;
import java.util.Map;

public class Poll {
    private int id;
    private String title;
    private String status;
    private String created;
    private String createdBy;
    private List<String> options;
    private int voteCount;
    private String userVote;
    private Map<String, Integer> counts;
    private int total;

    public Poll() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreated() { return created; }
    public void setCreated(String created) { this.created = created; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
    public int getVoteCount() { return voteCount; }
    public void setVoteCount(int voteCount) { this.voteCount = voteCount; }
    public String getUserVote() { return userVote; }
    public void setUserVote(String userVote) { this.userVote = userVote; }
    public Map<String, Integer> getCounts() { return counts; }
    public void setCounts(Map<String, Integer> counts) { this.counts = counts; }
    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }
}
