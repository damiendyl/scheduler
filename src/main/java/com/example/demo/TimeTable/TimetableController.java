package com.example.demo.TimeTable;

import com.mongodb.BasicDBObject;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.bson.json.JsonObject;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.*;

import javax.persistence.criteria.CriteriaBuilder;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@AllArgsConstructor
@RequestMapping("api/v1/timetable")
public class TimetableController {

    private final TimetableService timetableService;
    JwtDecoder jwtAccessTokenDecoder;

    @GetMapping
    public List<Timetable> getTimetable(@RequestParam int year, @RequestParam(required = false) String semester) {
        List<Timetable> res = timetableService.getTimetable(year, semester);
        return res;
    }

    @GetMapping("/years")
    public ArrayList<Integer> getYears() {
        ArrayList<Integer> years = timetableService.getYears();
        return years;
    }

    @GetMapping("/my-timetable/{year}")
    public List<Timetable> findMyTimetable(@PathVariable int year, @RequestHeader String authorization) {
        String token = authorization.split(" ")[1];
        String userId = jwtAccessTokenDecoder.decode(token).getSubject();
        return timetableService.findMyTimetable(year, userId);
    }


    @PostMapping
    public Timetable saveNewTimetable(@RequestBody Map<String, Object> body) {
        int year = (int) body.get("year");
        String semester = (String) body.get("semester");
        List<Map<String, String>> schedules = (List<Map<String, String>>) body.get("schedules");
        return timetableService.saveNewTimetable(year, semester, schedules);
    }

    @PostMapping("/new-timetables")
    public List<Timetable> newTimetablesFromSlots(@RequestBody List<Map<String, String>> slots) {
        return timetableService.newTimetablesFromSlots(slots);
    }
}
