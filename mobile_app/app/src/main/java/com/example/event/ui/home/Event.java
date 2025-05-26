package com.example.event.ui.home;

public class Event {
    public String id;
    public String title;
    public String date;
    public String location;
    public String description;
    public String authorName;
    public String authorSurname;
    public String createdAt;
    public String eventDate;
    public String locationCountry;
    public String locationCity;
    public String locationAddress;
    public String reservationStatus;
    public int reservationCount;
    public int maxParticipants;
    public String reservationId;
    public String organizerId;

    public Event(
        String id,
        String title,
        String createdAt,
        String eventDate,
        String locationCountry,
        String locationCity,
        String locationAddress,
        String description,
        String authorName,
        String authorSurname,
        String reservationStatus,
        int reservationCount,
        int maxParticipants,
        String reservationId,
        String organizerId
    ) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.eventDate = eventDate;
        this.locationCountry = locationCountry;
        this.locationCity = locationCity;
        this.locationAddress = locationAddress;
        this.description = description;
        this.authorName = authorName;
        this.authorSurname = authorSurname;
        this.reservationStatus = reservationStatus;
        this.reservationCount = reservationCount;
        this.maxParticipants = maxParticipants;
        this.reservationId = reservationId;
        this.organizerId = organizerId;
    }
}
