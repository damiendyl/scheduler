package com.example.demo.Classroom;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document
public class Classroom {
    @Id
    private String id;
    private String name;
    private int capacity;
    private double latitude;
    private double longitude;
    private LocalDateTime deletedAt;

    public Classroom(String name, int capacity, double latitude, double longitude) {
        this.name = name;
        this.capacity = capacity;
        this.latitude = latitude;
        this.longitude = longitude;
        this.deletedAt = null;
    }
}
