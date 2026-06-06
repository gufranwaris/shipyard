package com.shipyard.producer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;

import com.shipyard.config.RabbitMQConfig;

public class BuildConsumer {
      @RabbitListener(
            queues = RabbitMQConfig.QUEUE
    )
    public void consume(String message) {

        System.out.println(
                "Message Received: " + message
        );
    }
}
