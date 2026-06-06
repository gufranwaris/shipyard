package com.shipyard.repository;

import com.shipyard.entity.DeploymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeploymentRepository extends JpaRepository<DeploymentEntity, Long> {

} 