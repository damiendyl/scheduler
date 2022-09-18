package com.example.demo;

import com.example.demo.AppUser.AppUser;
import com.example.demo.AppUser.AppUserRepository;
import com.example.demo.Classroom.Classroom;
import com.example.demo.Classroom.ClassroomRepository;
import com.example.demo.Group.Group;
import com.example.demo.LectureModule.LectureModule;
import com.example.demo.Group.GroupRepository;
import com.example.demo.LectureModule.ModuleRepository;
import com.example.demo.Role.Role;
import com.example.demo.Role.RoleRepository;
import com.example.demo.TimeTable.*;
import com.github.javafaker.App;
import com.github.javafaker.Faker;
import com.github.javafaker.service.FakeValuesService;
import com.github.javafaker.service.RandomService;
import org.bson.types.ObjectId;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.BufferedReader;
import java.io.FileReader;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	CommandLineRunner runner(
			GroupRepository groupRepository,
			ModuleRepository moduleRepository,
			ClassroomRepository classroomRepository,
			TimetableRepository timetableRepository,
			RoleRepository roleRepository,
			AppUserRepository appUserRepository
	){
		return args -> {
			if (roleRepository.findAll().isEmpty()) {
				List<Role> roles = new ArrayList<>();
				roles.add(new Role(
						null,
						"ROLE_ADMIN"
				));

				roles.add(new Role(
						null,
						"ROLE_LECTURER"
				));

				roles.add(new Role(
						null,
						"ROLE_STUDENT"
				));

				roleRepository.saveAll(roles);
			}

			if (appUserRepository.findAllLecturers().isEmpty()) {
				Role adminRole = roleRepository.findByName("ROLE_ADMIN");
				Role lecturerRole = roleRepository.findByName("ROLE_LECTURER");
				List<Role> roles = Arrays.asList(adminRole, lecturerRole);

				List<AppUser> records = new ArrayList<>();
				BufferedReader br = new BufferedReader(new FileReader("src/main/java/com/example/demo/lecturers.csv"));
				String line = null;
				while ((line = br.readLine()) != null ) {
					String[] row = line.split(",");
					//String orgId = row[2].split("@")[0].replace(".", "").trim();
					String adminPassword = passwordEncoder().encode("admin");
					AppUser appUser = new AppUser(
							row[0].trim(),
							row[1].trim(),
							adminPassword,
							row[2].trim(),
							row[3].trim(),
							roles
					);
					records.add(appUser);
				}
				appUserRepository.saveAll(records);
				System.out.println("lecturers done");
			}

			if (groupRepository.findAll().isEmpty()) {
				groupRepository.save(new Group(
						"Year 1",
						"1/C",
						LocalDateTime.now()
				));
				groupRepository.save(new Group(
						"YiCS",
						"1/C I",
						LocalDateTime.now()
				));
				groupRepository.save(new Group(
						"Year 2",
						"2/I",
						LocalDateTime.now()
				));
				groupRepository.save(new Group(
						"Year 3",
						"3/H",
						LocalDateTime.now()
				));
				groupRepository.save(new Group(
						"Year 4",
						"4/M",
						LocalDateTime.now()
				));
			}

			if (moduleRepository.findAll().isEmpty()) {
				Role adminRole = roleRepository.findByName("ROLE_ADMIN");
				Role lecturerRole = roleRepository.findByName("ROLE_LECTURER");
				List<Role> roles = Arrays.asList(adminRole, lecturerRole);

				List<AppUser> lecturers = appUserRepository.findAllLecturers();
				Map<String, AppUser> lecturerByName = new HashMap<>();
				for(AppUser appUser : lecturers){
					lecturerByName.put(
							appUser.getFirstName() + ' ' + appUser.getLastName(),
							appUser
					);
				}

				List<LectureModule> lectureModules = new ArrayList<>();
				BufferedReader br = new BufferedReader(new FileReader("src/main/java/com/example/demo/modules.csv"));
				String line = null;
				while ((line = br.readLine()) != null ) {
					String[] row = line.split(",");
					String[] lecturerNames = row[4].split(" - ");
					List<AppUser> teachers = new ArrayList<>();
					for (String lecturerName : lecturerNames) {
						lecturerName = lecturerName.trim();
						AppUser lecturer = lecturerByName.containsKey(lecturerName) ? lecturerByName.get(lecturerName) : null;
						if (lecturer == null) {
							System.out.println(lecturerName);
							List<AppUser> l = appUserRepository.findByFullName(lecturerName);
							if (l.size() > 0) {
								System.out.println(l.size());
								lecturer = l.get(0);
							} else {
								String firstName = lecturerName.split(" ")[0];
								String lastName = lecturerName.split(" ")[1];
								String orgId = firstName.charAt(0) + lastName;
								String email = String.format("%s.%s@bham.ac.uk", firstName.charAt(0), lastName);
								AppUser newLecturer = new AppUser(
										orgId,
										email,
										passwordEncoder().encode("admin"),
										firstName,
										lastName,
										roles
								);

								lecturer = appUserRepository.save(newLecturer);
							}
						}
						teachers.add(lecturer);
					}
					System.out.println(teachers);

					String level = row[0];
					String moduleCode = row[1];
					String title = row[2];
					int year = 2022;
					String semester = row[3];
					LocalDate beginDate = semester.equals("1") ? LocalDate.of(year, 10, 1) : LocalDate.of(year+1, 2, 1);
					LocalDate endDate = semester.equals("1") ? LocalDate.of(year, 12, 15) : LocalDate.of(year+1, 4, 15);
					List<ObjectId> studentIdList = new ArrayList<>();
					AppUser coordinator = lecturerByName.get(row[5]);
					AppUser reviewer = lecturerByName.get(row[6]);
					int capacity = Integer.parseInt(row[7].trim());

					LectureModule newLectureModule = new LectureModule(
							level,
							moduleCode,
							title,
							year,
							semester,
							2,
							beginDate,
							endDate,
							teachers,
							studentIdList,
							coordinator,
							reviewer,
							capacity
					);
					lectureModules.add(newLectureModule);
				}
				moduleRepository.saveAll(lectureModules);
			}

			if (classroomRepository.findAll().isEmpty()) {
				List<Classroom> classroomList = new ArrayList<>();
				List<String> classroomNames = new ArrayList<>(Arrays.asList(
						"University Centre Avon Room (T02)",
						"Aston Webb Main LT (C-block)",
						"Alan Walters G03 (LT1)",
						"Aston Webb WG5",
						"Y3 (Old Engineering) G29"
				));
				for (String classroomName : classroomNames) {
					int randomCapacity = ThreadLocalRandom.current().nextInt(200, 441);
					// lat radius 0.002
					double minLat = 52.44813;
					double latRange = 0.002*2;
					double randomLatitude = minLat + Math.random() * latRange;
					//lon radius 0.0055
					double minLon = -1.9374763;
					double lonRange = 0.0055*2;
					double randomLongitude = minLon + Math.random() * lonRange;
					Classroom newClassroom = new Classroom(
							classroomName,
							randomCapacity,
							randomLatitude,
							randomLongitude
					);
					classroomList.add(newClassroom);
					classroomRepository.saveAll(classroomList);
				}
			}

			if (appUserRepository.findAllStudents().isEmpty()) {
				System.out.println("students begin");
				List<Role> studentRoles = Arrays.asList(roleRepository.findByName("ROLE_STUDENT"));

				Map<String, Integer> studentsInLevel = new HashMap<>();
				studentsInLevel.put("1/C", 420);
				studentsInLevel.put("1/C I", 72);
				studentsInLevel.put("2/I", 370);
				studentsInLevel.put("3/H", 179);
				studentsInLevel.put("4/M", 448);

				List<String> semesters = new ArrayList<>(Arrays.asList("1", "2"));
				List<String> levels123 = new ArrayList<>(Arrays.asList("1/C", "1/C I", "2/I"));
				List<String> levels45 = new ArrayList<>(Arrays.asList("3/H", "4/M"));

				String studentPassword = passwordEncoder().encode("student");

				int totalNumStud = 1;

				for (String level: levels123) {
					int capacity = studentsInLevel.get(level);
					List<AppUser> studentsList = new ArrayList<>();

					for (int i=0; i<capacity; i++) {
						FakeValuesService fakeValuesService = new FakeValuesService(new Locale("en-GB"), new RandomService());

						String orgId;

						// generate id until one that is not taken is found
						boolean orgIdTaken = true;
						do {
							orgId = fakeValuesService.bothify("???###");
							if (!appUserRepository.existsByOrgId(orgId)) {
								orgIdTaken = false;
							}
						} while(orgIdTaken);

						String email = String.format("%s@student.bham.ac.uk", orgId);

						Faker faker = new Faker();
						String firstName = faker.name().firstName();
						String lastName = faker.name().lastName();


						AppUser newStudent = new AppUser(
								orgId,
								email,
								studentPassword,
								firstName,
								lastName,
								studentRoles
						);
						studentsList.add(newStudent);
						totalNumStud++;
					}

					// save students for generated id
					List<AppUser> savedStudents = appUserRepository.saveAll(studentsList);

					// add all students of this year to all lecture modules for the year
					List<LectureModule> thisYearModules = moduleRepository.findByLevel(level);
					for (LectureModule module : thisYearModules) {
						for (AppUser student : savedStudents) {
							module.getStudents().add(new ObjectId(student.getId()));
						}
					}
					moduleRepository.saveAll(thisYearModules);
				}

				for (String level : levels45) {
					int capacity = studentsInLevel.get(level);
					// 1. save number of students for each level and get returned list for document id
					// 2. pick 3 random modules for each student
					// 3. add to moduleStudents to update student list in each lectureModule later
					List<AppUser> students = new ArrayList<>();

					for (int i=0; i<capacity; i++) {
						String orgId;

						// generate id until one that is not taken is found
						FakeValuesService fakeValuesService = new FakeValuesService(new Locale("en-GB"), new RandomService());
						boolean orgIdTaken = true;
						do {
							orgId = fakeValuesService.bothify("???###");
							if (!appUserRepository.existsByOrgId(orgId)) {
								orgIdTaken = false;
							}
						} while(orgIdTaken);

						String email = String.format("%s@student.bham.ac.uk", orgId);

						Faker faker = new Faker();
						String firstName = faker.name().firstName();
						String lastName = faker.name().lastName();

						AppUser newStudent = new AppUser(
								orgId,
								email,
								studentPassword,
								"Student",
								String.valueOf(totalNumStud),
								studentRoles
						);

						students.add(newStudent);
						totalNumStud++;
					}

					List<AppUser> savedStudents = appUserRepository.saveAll(students);
					// split students randomly and add to modules
					List<LectureModule> thisYearModules = moduleRepository.findByLevel(level);
					int j = 1;
					int length = savedStudents.size();

					for (AppUser student : savedStudents) {
						System.out.println(String.format("%s %s of %s - %s", level, j, length, capacity));
						j++;
						for (String semester : semesters) {
							List<LectureModule> thisSemesterModules = thisYearModules.stream()
									.filter(module -> module.getSemester().equals(semester))
									.collect(Collectors.toList());
							int moduleCountThisSemester = 0;
							int totalWeights = 0;
							for (LectureModule module : thisSemesterModules) {
								totalWeights += module.getCapacity();
							}

							while (moduleCountThisSemester < 3) {
								int randomNum = ThreadLocalRandom.current().nextInt(0, totalWeights);
								for (LectureModule module : thisSemesterModules) {
									ObjectId moduleId = new ObjectId(module.getId());
									randomNum -= module.getCapacity();
									if (randomNum <= 0 && !module.getStudents().contains(moduleId)) {
										module.getStudents().add(new ObjectId(student.getId()));
										moduleCountThisSemester++;
										break;
									}
								}
							}
							moduleRepository.saveAll(thisSemesterModules);
						}
					}
				}
			}

			if (timetableRepository.findAll().isEmpty()) {
				Random r = new Random();
				List<Classroom> classrooms = classroomRepository.findAll();
				List<LectureModule> lectureModules = moduleRepository.findAll();

				Map<String, List<LectureModule>> semModules = new HashMap<>();
				lectureModules.forEach(module -> {
					semModules.merge(module.getSemester(), Arrays.asList(module), (lectureModules1, lectureModules2) -> {
						List<LectureModule> newList = new ArrayList<>();
						newList.addAll(lectureModules1);
						newList.addAll(lectureModules2);
						return newList;
					});
				});

				List<String> semesters = Arrays.asList("1", "2");
				List<Timetable> newTimetables = new ArrayList<>();

				for (String semester : semesters) {

					List<TimetableSlot> slotList = new ArrayList<>();
					List<LectureModule> modulesThisSem = semModules.get(semester);
					List<String> takenSlots = new ArrayList<>();
					Map<String, Integer> scheduledHours = new HashMap<>();
					for (int i = 0; i < 40; i++) {
						System.out.println(String.format("Semester %s lecture %s", semester, i));
						LectureModule randomLecture;
						Classroom randomClassroom;
						DayOfWeek day;
						int hourSlot;

						// find new lecture module which hasn't reached weekly fulfillment
						boolean weeklyHoursFulfilled = false;
						do {
							randomLecture = modulesThisSem.get(r.nextInt(modulesThisSem.size()));
							if (scheduledHours.containsKey(randomLecture.getId()) && scheduledHours.get(randomLecture.getId()) >= 2) {
								weeklyHoursFulfilled = true;
							} else {
								scheduledHours.merge(randomLecture.getId(), 1, Integer::sum);
								weeklyHoursFulfilled = false;
							}
						} while (weeklyHoursFulfilled);


						// find a time slot in a classroom that isn't already scheduled to a lecture
						boolean slotTaken = false;
						do {
							randomClassroom = classrooms.get(r.nextInt(classrooms.size()));
							day = DayOfWeek.getRandom();
							hourSlot = r.nextInt(9);
							String slotString = randomClassroom + "," + day + "," + hourSlot;
							slotTaken = takenSlots.contains(slotString);
							if (!slotTaken) {
								takenSlots.add(slotString);
							}
						} while (slotTaken);

						TimetableSlot slot = new TimetableSlot(
								day,
								hourSlot,
								randomClassroom,
								randomLecture
						);

						slotList.add(slot);
					}

					Timetable tt = new Timetable(
							2022,
							semester,
							slotList
					);
					newTimetables.add(tt);
				}

				timetableRepository.saveAll(newTimetables);
			}

//			List<LectureModule> modules = moduleRepository.findAll();
//			modules.forEach(module -> {
//				String semester = module.getSemester();
//				int year = module.getYear();
//				module.setBeginDate(semester.equals("1") ? LocalDate.of(year, 10, 1) : LocalDate.of(year+1, 2, 1));
//				module.setEndDate(semester.equals("1") ? LocalDate.of(year, 12, 15) : LocalDate.of(year+1, 4, 15));
//			});
//			moduleRepository.saveAll(modules);


			System.out.println("done");
		};
	}
}
