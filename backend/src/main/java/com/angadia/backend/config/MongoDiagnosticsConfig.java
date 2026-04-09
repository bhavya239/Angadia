package com.angadia.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class MongoDiagnosticsConfig implements CommandLineRunner {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Override
    public void run(String... args) {
        if (mongoUri == null || mongoUri.isBlank()) {
            log.error("MONGODB_URI is not set!");
            return;
        }

        try {
            // Mask password for security: split by '@'
            String maskedUri;
            if (mongoUri.contains("@")) {
                int atIndex = mongoUri.lastIndexOf("@");
                int userIndex = mongoUri.indexOf("//") + 2;
                maskedUri = mongoUri.substring(0, userIndex) + "****:****" + mongoUri.substring(atIndex);
            } else {
                maskedUri = "URI format unknown (unable to mask)";
            }

            log.info("DATABASE DIAGNOSTICS: Attempting connection to MongoDB at: {}", maskedUri);
            
            // Log if the URI contains Atlas indicator
            if (mongoUri.contains("mongodb+srv")) {
                log.info("DATABASE DIAGNOSTICS: Protocol 'mongodb+srv' detected (Atlas Mode)");
            } else {
                log.warn("DATABASE DIAGNOSTICS: Standard 'mongodb' protocol detected (Local/Legacy Mode)");
            }

        } catch (Exception e) {
            log.error("DATABASE DIAGNOSTICS: Failed to parse MongoDB URI for logging: {}", e.getMessage());
        }
    }
}
