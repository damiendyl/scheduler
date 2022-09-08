package com.example.demo.Group;

import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("api/v1/group")
@AllArgsConstructor
@CrossOrigin
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public List<Group> getAllGroups() {return groupService.getAllGroups();}

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Group addNewGroup(@RequestBody Group group){
        group.setCreatedAt(LocalDateTime.now());
        return groupService.addNewGroup(group);
    }
}
