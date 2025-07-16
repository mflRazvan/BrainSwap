package com.FoRS.BrainSwap_backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtGenerator {
    private final Key secret = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private static final long EXP_MS = 1000 * 60 * 60; // 1 h

    public String generateToken(Long id, String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("id", id)
                .addClaims(Map.of("role", role))
                .setExpiration(new Date(System.currentTimeMillis() + EXP_MS))
                .signWith(secret)
                .compact();
    }

    public Claims extract(String token) {
        return Jwts.parserBuilder().setSigningKey(secret).build()
                .parseClaimsJws(token).getBody();
    }

    public boolean isValid(String token, String username) {
        return extract(token).getSubject().equals(username)
                && extract(token).getExpiration().after(new Date());
    }
}
