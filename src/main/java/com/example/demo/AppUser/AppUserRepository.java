package com.example.demo.AppUser;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends MongoRepository<AppUser, String> {

    boolean existsByEmail(String email);
    boolean existsByOrgId(String orgId);

    @Query("{$or: [{orgId: ?0}, {email: ?0}]}")
    Optional<AppUser> findByEmailOrOrgId(String orgIdOrEmail);

    @Query("{'roleList.name': 'ROLE_LECTURER', 'deletedAt': {$eq: null} }")
    List<AppUser> findAllLecturers();

    @Query("{'roleList.name': 'ROLE_STUDENT', 'deletedAt': {$eq: null} }")
    List<AppUser> findAllStudents();

    @Aggregation(pipeline = {"{$addFields: {fullName: {$concat: ['$firstName', ' ', '$lastName']}}}", "{$match: {fullName: ?0}}"})
    List<AppUser> findByFullName(String fullName);
}
