package com.example.demo.AppUser;

import com.example.demo.DTO.AddNewUserDTO;
import com.example.demo.DTO.AppUserDTO;
import com.example.demo.Role.Role;
import com.example.demo.Role.RoleRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import lombok.AllArgsConstructor;
import org.apache.commons.collections.ArrayStack;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;

@RestController
@RequestMapping("api/v1/user")
@AllArgsConstructor
@CrossOrigin
public class AppUserController {

    private final AppUserService appUserService;
    private final RoleRepository roleRepository;
    JwtDecoder jwtAccessTokenDecoder;
    PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public AppUserDTO getAppUser(@RequestHeader String authorization) {
        String token = authorization.split(" ")[1];
        Jwt jwt = jwtAccessTokenDecoder.decode(token);
        return AppUserDTO.from(appUserService.findById(jwt.getSubject()));
    }

    @GetMapping("/students")
    public List<AppUserDTO> getStudents() {
        return appUserService.getAllStudents();
    }

    @GetMapping("/lecturers")
    public List<AppUserDTO> getLecturers() {
        return appUserService.getAllLecturers();
    }

    @DeleteMapping
    public List<AppUser> deleteUserIds(@RequestBody List<String> userIds) {
        return appUserService.deleteUserIds(userIds);
    }

    @PatchMapping("/{id}")
    public AppUserDTO updateUser(@PathVariable String id, @RequestParam Optional<String> firstName, @RequestParam Optional<String> lastName) {
        AppUser user = appUserService.findById(id);
        user.setFirstName(firstName.orElse(user.getFirstName()));
        user.setLastName(lastName.orElse(user.getLastName()));
        return AppUserDTO.from(appUserService.saveUser(user));
    }

    @PostMapping()
    public ResponseEntity<AppUserDTO> addNewUser(@RequestBody AddNewUserDTO user) {
        List<Role> roles = new ArrayList<>();
        user.getRoles().forEach(role -> {
            roles.add(roleRepository.findByName(role));
        });

        AppUser newUser = new AppUser(
                user.getOrgId(),
                user.getEmail(),
                passwordEncoder.encode("admin"),
                user.getFirstName(),
                user.getLastName(),
                roles
        );

        try {
            return ResponseEntity.ok().body(AppUserDTO.from(appUserService.saveUser(newUser)));
        } catch (DuplicateKeyException e) {
            return ResponseEntity.internalServerError().body(AppUserDTO.from(newUser));
        }
    }

    @PostMapping(
            path = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<List<AppUserDTO>> addLecturersByFiles(HttpServletResponse response, @RequestParam List<MultipartFile> files) {
        List<AppUserDTO> addedUsers = new ArrayList<>();
        Role admin = roleRepository.findByName("ROLE_ADMIN");
        Role l = roleRepository.findByName("ROLE_LECTURER");

        List<AppUser> toAdd = new ArrayList<>();
        files.forEach(file -> {
            try {
                CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()));
                String[] nextLine;
                while ((nextLine = reader.readNext()) != null) {
                    AppUser newLecturer = new AppUser(
                            nextLine[0],
                            nextLine[3],
                            passwordEncoder.encode("admin"),
                            nextLine[1],
                            nextLine[2],
                            Arrays.asList(admin, l)
                    );
                    toAdd.add(newLecturer);
                }
            } catch (IOException | CsvValidationException e) {
                e.printStackTrace();
            }
        });
        try {
            List<AppUser> added = appUserService.addnewLecturers(toAdd);
            added.forEach(user -> {
                addedUsers.add(AppUserDTO.from(user));
            });
            return ResponseEntity.ok().body(addedUsers);

        } catch (DuplicateKeyException e) {
            List<AppUserDTO> duplicates = new ArrayList<>();
            toAdd.forEach(lecturer -> {
                String orgId = lecturer.getOrgId();
                String email = lecturer.getEmail();
                if (appUserService.userExists(orgId) || appUserService.userExists(email)) {
                    duplicates.add(AppUserDTO.from(lecturer));
                }
            });

            return ResponseEntity.internalServerError().body(duplicates);
        }

    }



}
