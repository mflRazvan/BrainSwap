package com.FoRS.BrainSwap_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BrainSwapApplication {

	public static void main(String[] args) {
		SpringApplication.run(BrainSwapApplication.class, args);
	}

}
