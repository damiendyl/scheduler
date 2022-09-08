package com.example.demo.Classroom;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ClassroomService {
    private final ClassroomRepository classroomRepository;

    public List<Classroom> getAllClassrooms() { return classroomRepository.findAll(); }

    public List<Classroom> addNewClassrooms(List<Classroom> classrooms) {
        return classroomRepository.saveAll(classrooms);
    }

    public Iterable<Classroom> findClassroomsById(List<String> classroomIds) {
        return classroomRepository.findAllById(classroomIds);
    }

    public void deleteClassrooms(Iterable<Classroom> classrooms) {
        classroomRepository.deleteAll(classrooms);
    }
}
