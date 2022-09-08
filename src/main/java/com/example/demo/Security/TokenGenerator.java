package com.example.demo.Security;

import com.example.demo.AppUser.AppUser;
import com.example.demo.DTO.TokenDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

import java.text.MessageFormat;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
public class TokenGenerator {

    @Autowired
    JwtEncoder accessTokenEncoder;

    @Autowired
    @Qualifier("jwtRefreshTokenEncoder")
    JwtEncoder refreshTokenEncoder;

    private String createAccessToken(Authentication authentication) {
        AppUser appUser = (AppUser) authentication.getPrincipal();
        boolean isAdmin = appUser.getRoleList().stream().anyMatch(o -> Objects.equals("ROLE_ADMIN", o.getName()));
        Instant now = Instant.now();

        JwtClaimsSet claimsSet = JwtClaimsSet.builder()
                .issuer("schedulingApp")
                .issuedAt(now)
                .expiresAt(now.plus(30, ChronoUnit.MINUTES))
                .subject(appUser.getId())
                .claim("isAdmin", isAdmin)
                .build();

        return accessTokenEncoder.encode(JwtEncoderParameters.from(claimsSet)).getTokenValue();
    }

    private String createRefreshToken(Authentication authentication) {
        AppUser appUser = (AppUser) authentication.getPrincipal();
        Instant now = Instant.now();
        boolean isAdmin = appUser.getRoleList().stream().anyMatch(o -> Objects.equals("ROLE_ADMIN", o.getName()));

        JwtClaimsSet claimsSet = JwtClaimsSet.builder()
                .issuer("schedulingApp")
                .issuedAt(now)
                .expiresAt(now.plus(30, ChronoUnit.DAYS))
                .subject(appUser.getId())
                .claim("isAdmin", isAdmin)
                .build();

        return refreshTokenEncoder.encode(JwtEncoderParameters.from(claimsSet)).getTokenValue();
    }

    public TokenDTO createToken(Authentication authentication) {
        if (!(authentication.getPrincipal() instanceof AppUser appUser)) {
            throw new BadCredentialsException(
                    MessageFormat.format("principal {0} is not of AppUser type", authentication.getPrincipal().getClass())
            );
        }

        TokenDTO tokenDTO = new TokenDTO();
        tokenDTO.setUserId(appUser.getId());
        tokenDTO.setAdmin(false);
        tokenDTO.setAccessToken(createAccessToken(authentication));

        appUser.getRoleList().forEach(role -> {
            if (role.getName().equals("ROLE_ADMIN")) {
                tokenDTO.setAdmin(true);
            }
        });

        String refreshToken;
        if (authentication.getCredentials() instanceof Jwt jwt) {
            Instant now = Instant.now();
            Instant expiresAt = jwt.getExpiresAt();
            Duration duration = Duration.between(now, expiresAt);
            long daysUntilExpired = duration.toDays();

            if (daysUntilExpired < 7) {
                refreshToken = createRefreshToken(authentication);
            } else {
                refreshToken = jwt.getTokenValue();
            }
        } else {
            refreshToken = createRefreshToken(authentication);
        }

        tokenDTO.setRefreshToken(refreshToken);

        return tokenDTO;
    }
}
