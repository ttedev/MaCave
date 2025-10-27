package fr.ttelab.vin.vin_back.scheduled;

import fr.ttelab.vin.vin_back.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@EnableScheduling
@Component
public class ApiQuotasReset {

    @Autowired
  private UserRepository userRepository;

    @Scheduled(cron = "0 0 0 * * 1")
    public void resetApiQuotas() {
        userRepository.findAll().forEach(user -> {
            user.setQuotasApi(20);
            userRepository.save(user);
        });
    }


}
