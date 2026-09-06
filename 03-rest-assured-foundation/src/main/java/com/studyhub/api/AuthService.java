package com.studyhub.api;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/** 单个教学账号；token 只在当前服务实例内有效。 */
public final class AuthService {
    private final Set<String> tokens = new HashSet<>();

    public String login(String username, String password) {
        if (!"student".equals(username) || !"study123".equals(password)) {
            throw new ApiException(401, "INVALID_CREDENTIALS", "Invalid username or password");
        }
        String token = UUID.randomUUID().toString();
        tokens.add(token);
        return token;
    }

    public void requireToken(String authorization) {
        if (authorization == null) {
            throw new ApiException(401, "AUTH_REQUIRED", "Bearer token is required");
        }
        if (!authorization.startsWith("Bearer ") || !tokens.contains(authorization.substring(7))) {
            throw new ApiException(401, "INVALID_TOKEN", "Invalid bearer token");
        }
    }
}
