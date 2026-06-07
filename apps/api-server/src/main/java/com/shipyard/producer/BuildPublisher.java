package com.shipyard.producer;

import com.shipyard.config.RabbitMQConfig;
import com.shipyard.dto.BuildJobMessage;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Data
public class BuildPublisher {

    @Value("${shipyard.rabbitmq.exchange}")
    private String deploymentExchange;
    @Value("${shipyard.rabbitmq.build-routing-key}")
    private String deploymentRoutingKey;

    private final RabbitTemplate rabbitTemplate;

    public void sendMessage(BuildJobMessage message) {

        rabbitTemplate.convertAndSend(
                deploymentExchange,
                deploymentRoutingKey,
                message
        );

        System.out.println(
                "Message Published: " + message
        );
    }
}
