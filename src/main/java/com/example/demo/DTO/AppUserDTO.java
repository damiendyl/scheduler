package com.example.demo.DTO;

import com.example.demo.AppUser.AppUser;
import com.example.demo.Role.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Builder
@Data
public class AppUserDTO {
    private String id;
    private String orgId;
    private String email;
    private String firstName;
    private String lastName;
    private List<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;

    public static AppUserDTO from(AppUser appUser) {
        List<String> roles = new ArrayList<>();
        appUser.getRoleList().forEach(role -> {
            roles.add(role.getName());
        });

        return builder()
                .id(appUser.getId())
                .orgId(appUser.getOrgId())
                .email(appUser.getEmail())
                .firstName(appUser.getFirstName())
                .lastName(appUser.getLastName())
                .roles(roles)
                .createdAt(appUser.getCreatedAt())
                .deletedAt(appUser.getDeletedAt())
                .build();
    }
}
