package com.example.demo.TimeTable;

import com.example.demo.AppUser.AppUser;
import com.example.demo.Classroom.Classroom;
import com.example.demo.Classroom.ClassroomRepository;
import com.example.demo.LectureModule.LectureModule;
import com.example.demo.LectureModule.ModuleRepository;
import com.mongodb.BasicDBObject;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.util.*;

@Service
@AllArgsConstructor
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final ClassroomRepository classroomRepository;
    private final ModuleRepository moduleRepository;

//    DayOfWeek : {
//        hourSlot : {
//            classroom1 : module,
//            classroom2 : module        },
//    }
    private void transformTimetable(Timetable timetable) {
        // Map<String, Map<Integer, Map<String, List<LectureModule>>>>
        timetable.getSchedule().forEach(scheduledLecture -> {
            DayOfWeek dow = scheduledLecture.getDow();
            int hourSlot = scheduledLecture.getHourSlot();
            String classroom;
        });
    }
/*
    private Map<String, String> ttViolations(Timetable timetable) {
        Map<String, List<StudentClashes>> allStudentClashes = new HashMap<>();
        timetable.getSchedule().forEach(lecture -> {
            lecture.getModule().getStudents().forEach(studentId -> {
                if (!allStudentClashes.containsKey(studentId.toString())) {
                    allStudentClashes.put(studentId.toString(), new ArrayList<>());
                }
            });
        });

        List<DayOfWeek> days = Arrays.asList(DayOfWeek.values());
        days.forEach(day -> {
            // each time slot of each day
            for (int slot=0; slot<9; slot++) {
                if (nLecturesAttendingAtTimeSlot(timetable, studentId, day, slot) > 1) {

                }
            }
        });
    }

 */

    // return list of rooms that are booked for more than 1 lecture at a time
    private List<DoubleBookedClassroom> doubleBookedClassrooms(Timetable timetable) {
        Map<String, Map<String, Integer>> doubleBookedClassrooms = new HashMap<>();
        for (TimetableSlot scheduledLecture : timetable.getSchedule()) {
            String classroom = scheduledLecture.getClassroom().getName();
            String slotTime = scheduledLecture.getDow() + "," + scheduledLecture.getHourSlot();
            if (!doubleBookedClassrooms.containsKey(classroom)) {
                doubleBookedClassrooms.put(classroom, new HashMap<>());
            } else {
                doubleBookedClassrooms.get(classroom).merge(slotTime, 1, Integer::sum);
            }
        }


        List<DoubleBookedClassroom> rooms = new ArrayList<>();
        doubleBookedClassrooms.forEach((room, slotTimeMap) -> {
            slotTimeMap.forEach((slotTime, count) -> {
                if (count > 1) {
                    DayOfWeek dow = DayOfWeek.valueOf(slotTime.split(",")[0]);
                    int slot = Integer.parseInt(slotTime.split(",")[1]);
                    rooms.add(new DoubleBookedClassroom(
                            room,
                            dow,
                            slot
                    ));
                }
            });
        });
        return rooms;
    }

    // constraint 2
    // returns number of times a student appears in a given time slot
    private int nLecturesAttendingAtTimeSlot(Timetable timetable, String studentId, DayOfWeek dow, int hourSlot) {
        int count = 0;
        for (TimetableSlot timetableSlot : timetable.getSchedule()) {
            if (timetableSlot.getDow().equals(dow) && (timetableSlot.getHourSlot() == hourSlot)) {
                List<ObjectId> students = timetableSlot.getModule().getStudents();
                for (ObjectId sId : students) {
                    if (sId.toString().equals(studentId)) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    // constraint 3
    // returns number of times a lecturer appears in a given time slot
    private int lecturesGivenAtTimeSlot(Timetable timetable, String lecturerId, DayOfWeek dow, int hourSlot) {
        int count = 0;
        for (TimetableSlot timetableSlot : timetable.getSchedule()) {
            if (timetableSlot.getDow().equals(dow) && (timetableSlot.getHourSlot() == hourSlot)) {
                List<AppUser> lecturers = timetableSlot.getModule().getLecturers();
                for (AppUser l : lecturers) {
                    if (l.getId().equals(lecturerId)) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    // constraint 4
    // number of times a lecture module appears in a given time slot
    private int lectureFreqGivenTimeSlot(Timetable timetable, LectureModule module, DayOfWeek dow, int hourSlot) {
        int count = 0;
        for (TimetableSlot timetableSlot : timetable.getSchedule()) {
            if (timetableSlot.getDow().equals(dow)
                    && (timetableSlot.getHourSlot() == hourSlot)
                    && timetableSlot.getModule().equals(module)) {
                count++;
            }
        }
        return count;
    }

    // constraint 5
    // number of lecture hours scheduled for given module
    private int hoursScheduled(Timetable timetable, LectureModule lectureModule) {
        int count = 0;
        for (TimetableSlot timetableSlot : timetable.getSchedule()) {
            if (timetableSlot.getModule().equals(lectureModule)) {
                count++;
            }
        }
        return count;
    }

    public List<Timetable> getTimetable(int year, String semester) {
        List<Timetable> timetable = new ArrayList<>();
        if (semester == null || semester.isEmpty()) {
            timetable = timetableRepository.findByYear(year);
        }
        return timetable;
    }


    public Timetable saveNewTimetable(int year, String semester, List<Map<String, String>> schedules) {

        List<Classroom> classrooms = classroomRepository.findAll();
        Map<String, Classroom> classroomMap = new HashMap<>();
        classrooms.forEach(classroom -> {
            classroomMap.put(classroom.getId(), classroom);
        });

        List<LectureModule> modules = moduleRepository.findAll();
        Map<String, LectureModule> moduleMap = new HashMap<>();
        modules.forEach(module -> {
            moduleMap.put(module.getId(), module);
        });

        List<TimetableSlot> newTimetableSlots = new ArrayList<>();
        schedules.forEach(slot -> {
            newTimetableSlots.add(new TimetableSlot(
                    DayOfWeek.valueOf(slot.get("dow")),
                    Integer.parseInt(slot.get("hourSlot")),
                    classroomMap.get(slot.get("classroomId")),
                    moduleMap.get(slot.get("moduleId"))
            ));
        });

        Timetable newTimetable = new Timetable(
                year,
                semester,
                newTimetableSlots
        );

        return timetableRepository.save(newTimetable);
    }

    public List<Timetable> newTimetablesFromSlots(List<Map<String, String>> slots) {
        List<Classroom> classroomsList = classroomRepository.findAll();
        Map<String, Classroom> classroomMap = new HashMap<>();
        classroomsList.forEach(classroom -> {
            classroomMap.put(classroom.getName(), classroom);
        });

        List<LectureModule> modulesList = moduleRepository.findAll();
        Map<String, Map<String, LectureModule>> moduleMap = new HashMap<>();
        modulesList.forEach(lectureModule -> {
            String yearSemesterMapKey = lectureModule.getYear() + "," + lectureModule.getSemester();
            if (!moduleMap.containsKey(yearSemesterMapKey)) {
                Map<String, LectureModule> newModuleMap = new HashMap<>();
                newModuleMap.put(lectureModule.getModuleCode(), lectureModule);
                moduleMap.put(yearSemesterMapKey, newModuleMap);
            } else {
                moduleMap.get(yearSemesterMapKey).put(lectureModule.getModuleCode(), lectureModule);
            }
        });

        List<Timetable> timetableList = new ArrayList<>();

        slots.forEach(slot -> {
            int year = Integer.parseInt(slot.get("year"));
            int hourSlot = Integer.parseInt(slot.get("hourSlot"));
            String semester = slot.get("semester");
            String classroom = slot.get("classroom");
            DayOfWeek dow = DayOfWeek.valueOf(slot.get("dow"));
            String moduleCode = slot.get("moduleCode");
            String moduleTitle = slot.get("moduleTitle");
            String mmKey = year + "," + semester;

            if (!classroomMap.containsKey(classroom)) {
                Classroom newClassroom = new Classroom(
                        classroom,
                        0,
                        0,
                        0
                );
                classroomMap.put(classroom, classroomRepository.save(newClassroom));
            }

            if (!moduleMap.containsKey(mmKey)) {
                moduleMap.put(mmKey, new HashMap<>());
            }
            if (!moduleMap.get(mmKey).containsKey(moduleCode)) {
                LectureModule newLectureModule = new LectureModule(
                        "0",
                        moduleCode,
                        moduleTitle,
                        year,
                        semester,
                        2,
                        new ArrayList<>(),
                        new ArrayList<>(),
                        null,
                        null,
                        0
                );

                moduleMap.get(mmKey).put(moduleCode, moduleRepository.save(newLectureModule));
            }

            if (!timetableList.stream().anyMatch(tt -> Objects.equals(tt.getYear(), Integer.parseInt(slot.get("year"))) && Objects.equals(tt.getSemester(), slot.get("semester")))) {;
                timetableList.add(new Timetable(
                        Integer.parseInt(slot.get("year")),
                        slot.get("semester"),
                        new ArrayList<TimetableSlot>()
                ));
            }

            for (int i = 0; i < timetableList.size(); i++) {
                if (timetableList.get(i).getYear() == year && timetableList.get(i).getSemester().equals(semester)) {
                    timetableList.get(i).getSchedule().add(new TimetableSlot(
                            dow,
                            hourSlot,
                            classroomMap.get(classroom),
                            moduleMap.get(year + "," + semester).get(moduleCode)
                    ));
                }
            }
        });

        return timetableRepository.saveAll(timetableList);
    }

    public ArrayList<Integer> getYears() {
        BasicDBObject res = timetableRepository.getYears();
        return (ArrayList<Integer>) res.get("year");
    }

    public List<Timetable> findMyTimetable(int year, String userId) {
        return timetableRepository.findMyTimetable(year, new ObjectId(userId));
    }
}

@Data
@AllArgsConstructor
class StudentClashes {
    private DayOfWeek dow;
    private int slotHour;
    private List<LectureModule> modules;
}

@Data
@AllArgsConstructor
class DoubleBookedClassroom {
    private String classroom;
    private DayOfWeek dow;
    private int slotHour;
}