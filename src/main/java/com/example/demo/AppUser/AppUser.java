package com.example.demo.AppUser;

import com.example.demo.Role.Role;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Data
@Document
@RequiredArgsConstructor
@NoArgsConstructor
public class AppUser implements UserDetails {
    @Id
    private String id;
    @NonNull
    @Indexed(unique = true)
    private String orgId;
    @NonNull
    @Indexed(unique = true)
    private String email;
    @NonNull
    private String password;
    private String firstName;
    private String lastName;
    private List<Role> roleList;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;

    public AppUser(@NonNull String orgId, @NonNull String email, @NonNull String password, String firstName, String lastName, List<Role> roleList) {
        this.orgId = orgId;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.roleList = roleList;
        this.createdAt = LocalDateTime.now();
        this.deletedAt = null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        this.roleList.forEach(role -> {
            authorities.add(new SimpleGrantedAuthority(role.getName()));
        });

        return authorities;
    }

    @Override
    public String getUsername() {
        return this.orgId;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
