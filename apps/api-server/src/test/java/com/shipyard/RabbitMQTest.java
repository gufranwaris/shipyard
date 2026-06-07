package com.shipyard;

import com.shipyard.producer.BuildPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Slf4j
public class RabbitMQTest {
    @Autowired
    private BuildPublisher buildPublisher;

    @Test
    public void buildPublicerTest(){
//        log.info("exchange is: {}", buildPublisher.getDeploymentExchange());
//        log.info("routing key is: {}", buildPublisher.getDeploymentRoutingKey());
        log.info("message are sending to RabbitMQ!");
        buildPublisher.sendMessage(123);
        log.info("message sending completed to RabbitMQ!");
    }
}
