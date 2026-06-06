package com.shipyard.service.impl;

import com.shipyard.dto.CreateProjectRequest;
import com.shipyard.dto.BuildJobMessage;
import com.shipyard.dto.ProjectResponse;
import com.shipyard.entity.ProjectEntity;
import com.shipyard.producer.BuildPublisher;
import com.shipyard.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements com.shipyard.service.ProjectService {

    private final ProjectRepository projectRepository;
    private final BuildPublisher buildPublisher;

    @Override
    public ProjectResponse create(CreateProjectRequest request){
        System.out.println("Creating project with name: " + request.getName());;
        ProjectEntity project = ProjectEntity.builder()
                .name(request.getName())
                .gitUrl(request.getGitUrl())
                .build();
        ProjectEntity savedProjectEntity = projectRepository.save(project);
        buildPublisher.publishBuildJob(new BuildJobMessage(
                String.valueOf(savedProjectEntity.getId()),
                savedProjectEntity.getId(),
                savedProjectEntity.getGitUrl()
        ));
        return new ProjectResponse(
                savedProjectEntity.getId(),
                savedProjectEntity.getName(),
                savedProjectEntity.getGitUrl(),
                savedProjectEntity.getCreatedAt()
        );
    }
}
