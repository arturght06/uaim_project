package com.example.event.ui.home;

public class Event {
    public String id;
    public String title;
    public String createdAt;
    public String eventDate;
    public String country;
    public String city;
    public String address;
    public String description;
    public String organizerFirstName;
    public String organizerLastName;
    public String reservationStatus;
    public int reservationCount;
    public int maxParticipants;
    public String reservationId;
    public String organizerId;
    public int commentCount;

    public Event(
        String id,
        String title,
        String createdAt,
        String eventDate,
        String country,
        String city,
        String address,
        String description,
        String organizerFirstName,
        String organizerLastName,
        String reservationStatus,
        int reservationCount,
        int maxParticipants,
        String reservationId,
        String organizerId
    ) {
        this(id, title, createdAt, eventDate, country, city, address, description, organizerFirstName, organizerLastName, reservationStatus, reservationCount, maxParticipants, reservationId, organizerId, 0);
    }

    public Event(
        String id,
        String title,
        String createdAt,
        String eventDate,
        String country,
        String city,
        String address,
        String description,
        String organizerFirstName,
        String organizerLastName,
        String reservationStatus,
        int reservationCount,
        int maxParticipants,
        String reservationId,
        String organizerId,
        int commentCount
    ) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.eventDate = eventDate;
        this.country = country;
        this.city = city;
        this.address = address;
        this.description = description;
        this.organizerFirstName = organizerFirstName;
        this.organizerLastName = organizerLastName;
        this.reservationStatus = reservationStatus;
        this.reservationCount = reservationCount;
        this.maxParticipants = maxParticipants;
        this.reservationId = reservationId;
        this.organizerId = organizerId;
        this.commentCount = commentCount;
    }
}
