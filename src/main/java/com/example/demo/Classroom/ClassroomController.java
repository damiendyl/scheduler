package com.example.demo.Classroom;


import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("api/v1/classroom")
@AllArgsConstructor
public class ClassroomController {
    private final ClassroomService classroomService;

    @GetMapping
    public List<Classroom> getAllClassrooms() { return classroomService.getAllClassrooms(); }

    @PostMapping
    public List<Classroom> addNewClassrooms(@RequestBody List<Classroom> classrooms) { return classroomService.addNewClassrooms(classrooms); }

    @PostMapping(
            path = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public List<Classroom> addClassroomsByFiles(@RequestParam List<MultipartFile> files) {
        List<Classroom> toAdd = new ArrayList<>();
        files.forEach(file -> {
            try {
                CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()));
                String[] nextLine;
                while ((nextLine = reader.readNext()) != null) {
                    Classroom classroom = new Classroom(
                            nextLine[0],
                            Integer.parseInt(nextLine[1]),
                            Double.parseDouble(nextLine[2]),
                            Double.parseDouble(nextLine[3])
                    );
                    toAdd.add(classroom);
                }
            } catch (IOException | CsvValidationException e) {
                // to add: ignore if email already exists add those which do not
                e.printStackTrace();
            }
        });

        return classroomService.addNewClassrooms(toAdd);
    }

    @DeleteMapping
    public Iterable<Classroom> deleteClassroomIds(@RequestBody List<String> classroomIds) {
        Iterable<Classroom> classrooms = classroomService.findClassroomsById(classroomIds);

        classroomService.deleteClassrooms(classrooms);
        return classrooms;
    }

}
