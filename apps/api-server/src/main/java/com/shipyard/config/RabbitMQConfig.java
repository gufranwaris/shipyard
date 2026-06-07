package com.shipyard.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

//    public static final String QUEUE = "demo.queue";
//    public static final String EXCHANGE = "demo.exchange";
//    public static final String ROUTING_KEY = "demo.routing.key";
    @Value("${shipyard.rabbitmq.build-queue}")
    private String deploymentQueue;
    @Value("${shipyard.rabbitmq.exchange}")
    private String deploymentExchange;
    @Value("${shipyard.rabbitmq.build-routing-key}")
    private String deploymentRoutingKey;

    @Bean
    public Queue queue() {
        return new Queue(deploymentQueue, true);
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(deploymentExchange);
    }

     @Bean
     public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
     }

    @Bean
    public Binding binding() {

        return BindingBuilder
                .bind(queue())
                .to(exchange())
                .with(deploymentRoutingKey);
    }
}
