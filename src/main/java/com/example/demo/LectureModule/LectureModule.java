package com.example.demo.LectureModule;

import com.example.demo.AppUser.AppUser;
import com.mongodb.lang.Nullable;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.bytebuddy.asm.Advice;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

import java.time.LocalDate;
import java.util.List;

@Data
@Document
@NoArgsConstructor
public class LectureModule {
    @Id
    private String id;
    private String level;
    private String moduleCode;
    private String title;
    private int year;
    private String semester;
    private int hoursPerWeek;
    private LocalDate beginDate;
    private LocalDate endDate;
    @DocumentReference()
    private List<AppUser> lecturers;
    private List<ObjectId> students;
    @DocumentReference()
    private AppUser coordinator;
    @DocumentReference()
    private AppUser reviewer;
    private int capacity;


    public LectureModule(
            String level,
            String moduleCode,
            String title,
            int year,
            String semester,
            int hoursPerWeek,
            List<AppUser> lecturers,
            List<ObjectId> students,
            AppUser coordinator,
            AppUser reviewer,
            int capacity) {
        this.level = level;
        this.moduleCode = moduleCode;
        this.title = title;
        this.year = year;
        this.semester = semester;
        this.hoursPerWeek = hoursPerWeek;
        this.beginDate = semester.equals("1") ? LocalDate.of(year, 10, 1) : LocalDate.of(year+1, 2, 1);
        this.endDate = semester.equals("1") ? LocalDate.of(year, 12, 15) : LocalDate.of(year+1, 4, 15);
        this.lecturers = lecturers;
        this.students = students;
        this.coordinator = coordinator;
        this.reviewer = reviewer;
        this.capacity = capacity;
    }

    public LectureModule(String level, String moduleCode, String title, int year, String semester, int hoursPerWeek, LocalDate beginDate, LocalDate endDate, List<AppUser> lecturers, List<ObjectId> students, AppUser coordinator, AppUser reviewer, int capacity) {
        this.level = level;
        this.moduleCode = moduleCode;
        this.title = title;
        this.year = year;
        this.semester = semester;
        this.hoursPerWeek = hoursPerWeek;
        this.beginDate = beginDate;
        this.endDate = endDate;
        this.lecturers = lecturers;
        this.students = students;
        this.coordinator = coordinator;
        this.reviewer = reviewer;
        this.capacity = capacity;
    }
}
