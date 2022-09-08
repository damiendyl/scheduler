package com.example.demo.TimeTable;

import com.example.demo.Classroom.Classroom;
import com.example.demo.LectureModule.LectureModule;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document
public class Timetable {
    @Id
    private String id;
    private int year;
    private String semester;
    private List<TimetableSlot> schedule;
    private LocalDateTime createdAt;

    public Timetable(int year, String semester, List<TimetableSlot> schedule) {
        this.year = year;
        this.semester = semester;
        this.schedule = schedule;
        this.createdAt = LocalDateTime.now();
    }
}
