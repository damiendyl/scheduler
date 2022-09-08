package com.example.demo.Group;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document
public class Group {
    @Id
    private ObjectId id;
    private String name;
    private String level;
    private LocalDateTime createdAt;

    public Group(String name, String level, LocalDateTime createdAt) {
        this.name = name;
        this.level = level;
        this.createdAt = createdAt;
    }
}
