package com.example.demo.TimeTable;

import com.example.demo.Classroom.Classroom;
import com.example.demo.LectureModule.LectureModule;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TimetableSlot {
    private DayOfWeek dow;
    private int hourSlot;
    private Classroom classroom;
    private LectureModule module;
}
