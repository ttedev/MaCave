package fr.ttelab.vin.vin_back.config;

import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI api() {
    return new OpenAPI()
        .info(new Info()
            .title("API Cave à vin")
            .description("Documentation OpenAPI des endpoints /api")
            .version("1.0.0")
            .contact(new Contact().name("Support").email("support@example.com")));
  }
}