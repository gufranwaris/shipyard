package com.shipyard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Main {

//    private static ProjectService projectService;

    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }

//    public static void run() {
//        System.out.println("Running the Shipyard application...");
//        CreateProjectRequest request = CreateProjectRequest.builder()
//                .name("Test Project")
//                .gitUrl("https://github.com/test/test-project.git")
//                .build();
//        System.out.println("Creating project with name: " + request.getName());
//        ProjectResponse createdProjectData = projectService.create(request);
//        System.out.println("Project created with ID: " + createdProjectData.getId());
//    }
}