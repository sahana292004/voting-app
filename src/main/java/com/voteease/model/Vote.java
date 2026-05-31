package com.voteease.model;

public class Vote {
    private int id;
    private int pollId;
    private String voter;
    private String optionText;
    private String votedAt;
    private String pollTitle;

    public Vote() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getPollId() { return pollId; }
    public void setPollId(int pollId) { this.pollId = pollId; }
    public String getVoter() { return voter; }
    public void setVoter(String voter) { this.voter = voter; }
    public String getOptionText() { return optionText; }
    public void setOptionText(String optionText) { this.optionText = optionText; }
    public String getVotedAt() { return votedAt; }
    public void setVotedAt(String votedAt) { this.votedAt = votedAt; }
    public String getPollTitle() { return pollTitle; }
    public void setPollTitle(String pollTitle) { this.pollTitle = pollTitle; }
}
