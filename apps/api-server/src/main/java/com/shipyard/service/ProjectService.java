package com.shipyard.service;

import com.shipyard.dto.CreateProjectRequest;
import com.shipyard.dto.ProjectResponse;
import org.springframework.stereotype.Service;

@Service
public interface ProjectService {
    public ProjectResponse create(CreateProjectRequest request);
}
