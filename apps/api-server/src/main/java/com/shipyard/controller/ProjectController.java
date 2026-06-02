package com.shipyard.controller;

import com.shipyard.dto.CreateProjectRequest;
import com.shipyard.dto.ProjectResponse;
import com.shipyard.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

//    @GetMapping("/{id}")
//    public ResponseEntity<UserResponse> getUser(
//            @PathVariable Long id
//    ) {
//        return ResponseEntity.ok(
//                userService.getById(id)
//        );
//    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @RequestBody CreateProjectRequest request
    ) {
        ProjectResponse response =
                projectService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}

