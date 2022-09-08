package com.example.demo.Group;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends MongoRepository<Group, String> {

    @Query("{ 'level' : ?0 }")
    List<Group> findByLevel(String level);
}
