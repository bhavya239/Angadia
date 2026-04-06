package com.angadia.backend.controller;

import com.angadia.backend.domain.entity.City;
import com.angadia.backend.domain.entity.User;
import com.angadia.backend.dto.response.ApiResponse;
import com.angadia.backend.service.CityService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Cities", description = "City reference data")
@RestController
@RequestMapping("/api/v1/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<City>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(cityService.getAllActiveCities()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<City>> create(
        @RequestBody Map<String, String> body,
        @AuthenticationPrincipal User user
    ) {
        City city = cityService.createCity(body.get("name"), body.get("state"), user.getId(), user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(city, "City created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<City>> update(
        @PathVariable String id,
        @RequestBody Map<String, String> body,
        @AuthenticationPrincipal User user
    ) {
        City city = cityService.updateCity(id, body.get("name"), body.get("state"), user.getId(), user.getUsername());
        return ResponseEntity.ok(ApiResponse.success(city, "City updated"));
    }
}
