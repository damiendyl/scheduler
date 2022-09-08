package com.example.demo.Security;

import com.example.demo.AppUser.AppUser;
import com.example.demo.AppUser.AppUserRepository;
import lombok.AllArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;


@Component
@AllArgsConstructor
public class JwtToUserConverter implements Converter<Jwt, UsernamePasswordAuthenticationToken> {

    private final AppUserRepository appUserRepository;

    @Override
    public UsernamePasswordAuthenticationToken convert(Jwt jwt) {
        AppUser appUser = appUserRepository.findById(jwt.getSubject()).get();
        return new UsernamePasswordAuthenticationToken(appUser, jwt, appUser.getAuthorities());
    }
}
