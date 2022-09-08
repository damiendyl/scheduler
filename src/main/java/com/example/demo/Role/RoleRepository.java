package com.example.demo.Role;

import org.springframework.data.mongodb.repository.MongoRepository;


public interface RoleRepository extends MongoRepository<Role, String> {
    Role findByName(String roleName);
}
