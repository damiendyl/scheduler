package com.example.demo.Group;

import com.example.demo.Group.Group;
import com.example.demo.Group.GroupRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;

    public List<Group> getAllGroups() {return groupRepository.findAll();}

    public Group addNewGroup(Group group) {
        return groupRepository.save(group);
    }
}
