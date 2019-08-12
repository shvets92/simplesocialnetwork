package com.simplesocialnetwork.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.simplesocialnetwork.user.models.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Calendar;
import java.util.Date;

@Component
public class AccessTokenWorker {
    @Value("${jwtProperties.secretKey}")
    private byte[] secretKey;

    private Algorithm algorithm;
    private String issuer = "SimpleSocialNetwork";
    private int hoursTillExpiration = 4;
    private long leewaySeconds = 30;

    private String UUID = "UUID";
    private String FIRST_NAME = "FIRST_NAME";
    private String LAST_NAME = "LAST_NAME";
    private String ROLE = "ROLE";

    public AccessTokenWorker() {//can use this to generate a new secret key and then empty it out
        byte[] secretKey = new byte[64];
        new SecureRandom().nextBytes(secretKey);
    }

    public String createJWT(String uuid, String firstName, String lastName, String role) {
        String token = "";
        try {
            algorithm = Algorithm.HMAC512(secretKey);
            token = JWT.create()
                    .withIssuer(issuer)
                    .withIssuedAt(currentDateAndTime())
                    .withExpiresAt(addHoursToCurrentDateAndTime(hoursTillExpiration))
                    .withClaim(UUID, uuid)
                    .withClaim(FIRST_NAME, firstName)
                    .withClaim(LAST_NAME, lastName)
                    .withClaim(ROLE, role)
                    .sign(algorithm);
        } catch (JWTCreationException e) {
            e.printStackTrace();
        }
        return token;
    }

    public String createJWT(User user) {
        return createJWT(user.getUuid(), user.getFirstName(), user.getLastName(), user.getRole());
    }

    public DecodedJWT validateAndReturnJWT(String uuid, String firstName, String lastName, String role, String token) throws JWTVerificationException {
        algorithm = Algorithm.HMAC512(secretKey);
        JWTVerifier verifier = JWT.require(algorithm)
                .withIssuer(issuer)
                .withClaim(UUID, uuid)
                .withClaim(FIRST_NAME, firstName)
                .withClaim(LAST_NAME, lastName)
                .withClaim(ROLE, role)
                .acceptLeeway(leewaySeconds)
                .build();
        return verifier.verify(token);
    }

    public DecodedJWT validateAndReturnJWT(String token) throws JWTVerificationException {
        DecodedJWT jwt = JWT.decode(token);
        return validateAndReturnJWT(jwt.getClaim(UUID).asString(), jwt.getClaim(FIRST_NAME).asString(),
                jwt.getClaim(LAST_NAME).asString(), jwt.getClaim(ROLE).asString(), token);
    }

    public String getUuidIfValid(String token_with_Bearer) throws JWTVerificationException {
        String bareJWT = token_with_Bearer.replace("Bearer ", "");
        DecodedJWT jwt = validateAndReturnJWT(bareJWT);
        return jwt.getClaim(UUID).asString();
    }

    private Date currentDateAndTime() {
        Calendar calendar = Calendar.getInstance();
        return calendar.getTime();
    }

    private Date addHoursToCurrentDateAndTime(int hours) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.add(Calendar.HOUR_OF_DAY, hours);
        return calendar.getTime();
    }
}
