package com.example.demo.LectureModule;

import com.mongodb.BasicDBObject;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;


public interface ModuleRepository extends MongoRepository<LectureModule, String> {

    @Aggregation(pipeline = {"{$group: {_id: null, years: {$addToSet: '$year'}}}"})
    BasicDBObject findDistinctYears();

    String unwindStudents = "{ $unwind: { path: '$students' } }";
    String groupModulesByStudents = "{ $group: { _id: '$students', semester1: { $addToSet: { $cond: { 'if': { $eq: ['$semester', '1'] }, then: '$title', 'else': '$$REMOVE' } } }, semester2: { $addToSet: { $cond: { 'if': { $eq: ['$semester', '2'] }, then: '$title', 'else': '$$REMOVE' } } } } }";
    @Aggregation(pipeline = {unwindStudents, groupModulesByStudents})
    List<BasicDBObject> findAllStudentsModules();

    String unwindLecturers = "{ $unwind: { path: '$lecturers', preserveNullAndEmptyArrays: true } }";
    String addStudentSize = "{ $addFields: { numberOfStudents: { $size: '$students' } } }";
    String groupByModules = "{ $group: { _id: '$_id', level: { $first: '$level' }, moduleCode: { $first: '$moduleCode' }, title: { $first: '$title' }, year: { $first: '$year' }, semester: { $first: '$semester' }, hoursPerWeek: { $first: '$hoursPerWeek' }, numberOfStudents: { $first: '$numberOfStudents' }, coordinator: { $first: { $concat: ['$coordinator.firstName', ' ', '$coordinator.lastName'] } }, reviewer: { $first: { $concat: ['$reviewer.firstName', ' ', '$reviewer.lastName'] } }, lecturers: { $addToSet: { $concat: ['$lecturers.firstName', ' ', '$lecturers.lastName'] } } } }";
    @Aggregation(pipeline = {unwindLecturers, addStudentSize, groupByModules})
    List<BasicDBObject> findAllModuleInfo();

    @Query("{students: {$in: ?0}}")
    List<LectureModule> findByStudentIdList(List<ObjectId> studentIds);

    @Query("{'year': ?0}")
    List<LectureModule> findByYear(int year);

    List<LectureModule> findByLevel(String level);
}
