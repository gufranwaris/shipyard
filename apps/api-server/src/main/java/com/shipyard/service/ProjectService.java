package com.shipyard.service;

import com.shipyard.dto.CreateProjectRequest;
import com.shipyard.dto.ProjectResponse;

public interface ProjectService {
    public ProjectResponse create(CreateProjectRequest request);
}
