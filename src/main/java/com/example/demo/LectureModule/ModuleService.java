package com.example.demo.LectureModule;

import com.mongodb.BasicDBObject;
import lombok.AllArgsConstructor;
import org.bson.BSONObject;
import org.bson.Document;
import org.bson.json.JsonObject;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class ModuleService {
    private final ModuleRepository moduleRepository;

    public List<BasicDBObject> findAllModuleInfo() {
        List<BasicDBObject> obj = moduleRepository.findAllModuleInfo();
        obj.forEach(mod -> {
            mod.put("id", mod.get("_id").toString());
            mod.remove("_id");
        });
        return obj;
    }

    public List<Integer> findDistinctYears() {
        return ((List<Integer>) moduleRepository.findDistinctYears().get("years"));
    }

    public Map<String, BasicDBObject> findAllStudentsModules() {
        List<BasicDBObject> obj = moduleRepository.findAllStudentsModules();
        Map<String, BasicDBObject> response = new HashMap<>();
        obj.forEach(student -> {
            String id = student.get("_id").toString();
            response.put(id, student);
            response.get(id).remove("_id");
        });
        return response;
    }

    public List<LectureModule> findModulesByYear(int year) {
        return moduleRepository.findByYear(year);
    }
}
