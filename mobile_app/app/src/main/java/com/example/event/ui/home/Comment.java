package com.example.event.ui.home;

public class Comment {
    public String id;
    public String eventId;
    public String userId;
    public String content;
    public String createdAt;
    public String authorFirstName;
    public String authorLastName;

    public Comment(String id, String eventId, String userId, String content, String createdAt, 
                   String authorFirstName, String authorLastName) {
        this.id = id;
        this.eventId = eventId;
        this.userId = userId;
        this.content = content;
        this.createdAt = createdAt;
        this.authorFirstName = authorFirstName;
        this.authorLastName = authorLastName;
    }
}
