package com.example.demo.AppUser;

import com.example.demo.DTO.AppUserDTO;
import com.example.demo.Role.Role;
import com.example.demo.Role.RoleRepository;
import lombok.AllArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class AppUserService implements UserDetailsManager {
    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    @Override
    public void createUser(UserDetails user) {
        ((AppUser) user).setPassword(passwordEncoder.encode(user.getPassword()));
        appUserRepository.save((AppUser) user);
    }

    @Override
    public void updateUser(UserDetails user) {

    }

    @Override
    public void deleteUser(String orgIdOrEmail) {
        AppUser appUser = appUserRepository.findByEmailOrOrgId(orgIdOrEmail).get();
        appUser.setDeletedAt(LocalDateTime.now());
        appUserRepository.save(appUser);
    }

    @Override
    public void changePassword(String oldPassword, String newPassword) {

    }

    @Override
    public boolean userExists(String username) {
        return (appUserRepository.existsByEmail(username) || appUserRepository.existsByOrgId(username));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return appUserRepository.findByEmailOrOrgId(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        MessageFormat.format("user {0} not found", username)
                ));
    }

    public AppUser saveUser(AppUser appUser) {
        if (appUser.getPassword().isEmpty()) {
            appUser.setPassword(passwordEncoder.encode("admin"));
        }

        return appUserRepository.save(appUser);
    }

    public List<AppUser> addNewUsers(List<AppUser> appUsers) {
        return appUserRepository.saveAll(appUsers);
    }

    public List<AppUserDTO> getAllLecturers() {
        List<AppUser> lecturers = appUserRepository.findAllLecturers();
        List<AppUserDTO> lecturersDTO = new ArrayList<>();
        lecturers.forEach(lecturer -> {
            lecturersDTO.add(AppUserDTO.from(lecturer));
        });
        return lecturersDTO;
    }

    public AppUser addRoleToUser(String emailOrOrgId, String roleName) {
        AppUser appUser = appUserRepository
                .findByEmailOrOrgId(emailOrOrgId)
                .orElseThrow(() -> new UsernameNotFoundException(
                        MessageFormat.format("user {0} not found", emailOrOrgId)
                ));
        Role role = roleRepository.findByName(roleName);

        appUser.getRoleList().add(role);
        return appUserRepository.save(appUser);
    }

    public List<AppUserDTO> getAllStudents() {
        List<AppUser> students = appUserRepository.findAllStudents();
        List<AppUserDTO> studentsDTO = new ArrayList<>();
        students.forEach(student -> {
            studentsDTO.add(AppUserDTO.from(student));
        });
        return studentsDTO;
    }

    public AppUser findById(String userId) {
        return appUserRepository.findById(userId).get();
    }

    public List<AppUser> deleteUserIds(List<String> userIds) {
        Iterable<AppUser> appUsers = appUserRepository.findAllById(userIds);
        appUsers.forEach(user -> {
            user.setDeletedAt(LocalDateTime.now());
        });
        return appUserRepository.saveAll(appUsers);
    }

    public List<AppUser> addnewLecturers(List<AppUser> toAdd) {
        return appUserRepository.saveAll(toAdd);
    }
}
