package com.example.demo.LectureModule;

import com.mongodb.BasicDBObject;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("api/v1/module")
@AllArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping
    public List<BasicDBObject> findAllModuleInfo() {
        return moduleService.findAllModuleInfo();
    }

    @GetMapping("/{year}")
    public List<LectureModule> findModulesByYear(@PathVariable int year) {
        return moduleService.findModulesByYear(year);
    }

    @GetMapping("/years")
    public List<Integer> findDistinctYears() {return moduleService.findDistinctYears();}

    @GetMapping("/students-modules")
    public Map<String, BasicDBObject> findAllStudentsModules() { return moduleService.findAllStudentsModules(); }

}
