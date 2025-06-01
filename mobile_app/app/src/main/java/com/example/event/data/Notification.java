package com.example.event.data;

public class Notification {
    public String id;
    public String title;
    public String message;
    public String createdAt;
    public boolean isRead;
    public String type;

    public Notification(String id, String title, String message, String createdAt, boolean isRead, String type) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.createdAt = createdAt;
        this.isRead = isRead;
        this.type = type;
    }
}
