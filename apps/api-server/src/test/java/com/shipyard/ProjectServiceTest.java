package com.shipyard;

import com.shipyard.dto.CreateProjectRequest;
import com.shipyard.dto.ProjectResponse;
import com.shipyard.service.ProjectService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ProjectServiceTest {

    @Autowired
    private ProjectService projectService;

    @Test
    void createProjectTest() {

        CreateProjectRequest request = CreateProjectRequest.builder()
                .name("Test Project")
                .gitUrl("https://github.com/test/test-project.git")
                .build();

        ProjectResponse response = projectService.create(request);

        System.out.println("Created Project ID: " + response.getId());

    }
}