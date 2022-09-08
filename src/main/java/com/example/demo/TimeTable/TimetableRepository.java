package com.example.demo.TimeTable;

import com.mongodb.BasicDBObject;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends MongoRepository<Timetable, String> {

    String matchYear = "{ $match: { year: ?0 } }";
    String sortByCreated = "{ $sort: { createdAt: -1 } }";
    String groupByYearSemester = "{ $group: { _id: { year: '$doc.year', semester: '$semester' }, doc: { $first: '$$ROOT' } } }";
    String project = "{ $project: { _id: '$doc._id', year: '$doc.year', semester: '$doc.semester', createdAt: '$doc.createdAt', schedule: '$doc.schedule' } }";
    @Aggregation(pipeline = {matchYear, sortByCreated, groupByYearSemester, project})
    List<Timetable> findByYear(int year);

    @Aggregation(pipeline = {"{ $group: { _id: null, year: { $addToSet: '$year' } } }"})
    BasicDBObject getYears();

    String unwindSchedule = "{ $unwind: { path: '$schedule' } }";
    String matchUserSchedule = "{ $match: { year: ?0, $or: [{ 'schedule.module.students': { $in: [?1] } }, { 'schedule.module.lecturers._id': ?1 }] } }";
    String groupIntoYearSemester = "{ $group: { _id: { year: '$year', semester: '$semester' }, schedule: { $addToSet: '$schedule' }, year: { $first: '$year' }, semester: { $first: '$semester' } } }";
    @Aggregation(pipeline = {matchYear, sortByCreated, groupByYearSemester, project, unwindSchedule, matchUserSchedule, groupIntoYearSemester})
    List<Timetable> findMyTimetable(int year, ObjectId userId);
}
