package com.shipyard.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.shipyard.entity.type.Status;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.EnumType;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeploymentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String publicId;
    
    private String deploymentUrl;

    @Enumerated(EnumType.STRING)
    private Status status;

    @OneToOne(cascade = { CascadeType.MERGE, CascadeType.PERSIST })
    @JoinColumn(name = "project_id") // owning side
    private ProjectEntity project;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
