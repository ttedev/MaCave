package fr.ttelab.vin.vin_back.config;

import fr.ttelab.vin.vin_back.model.*;
import fr.ttelab.vin.vin_back.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty; // ajout

import java.math.BigDecimal;
import java.util.List;

@Component
@ConditionalOnProperty(name = "PRODUCTION_MODE", havingValue = "false", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CaveRepository caveRepository;
    
    @Autowired
    private CasierRepository casierRepository;
    
    @Autowired
    private LigneRepository ligneRepository;
    
    @Autowired
    private WineRepository wineRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Override
    public void run(String... args) throws Exception {
        if(!userRepository.existsByUsername("admin")) {
            User user = new User("admin", "admin@example.com",passwordEncoder.encode("admin"));
            user.setFirstName("Admin");
            user.setLastName("User");
            user = userRepository.save(user);

            Cave cave = new Cave("Ma Cave Personnelle", "Cave familiale pour mes meilleurs vins");
            cave.setNombreLignesParCasier(2);
            cave.setCapacitesParLigne(List.of(5,6));
            cave.setOwner(user);
            cave = caveRepository.save(cave);

            Casier casier1 = new Casier(1);
            casier1.setPosition(1);
            casier1.setCave(cave);
            casier1 = casierRepository.save(casier1);
            cave.getCasiers().add(casier1);

            Casier casier2 = new Casier(2);
            casier2.setCave(cave);
            casier2.setPosition(2);
            casier2 = casierRepository.save(casier2);
            cave.getCasiers().add(casier2);

            Ligne ligne1_1 = new Ligne(5);
            ligne1_1.setCasier(casier1);
            ligne1_1.setPosition(1);
            ligne1_1 = ligneRepository.save(ligne1_1);

            Ligne ligne1_2 = new Ligne(6);
            ligne1_2.setCasier(casier1);
            ligne1_2.setPosition(2);
            ligne1_2 = ligneRepository.save(ligne1_2);

            Ligne ligne2_1 = new Ligne(5);
            ligne2_1.setCasier(casier2);
            ligne2_1.setPosition(1);
            ligne2_1 = ligneRepository.save(ligne2_1);

            Ligne ligne2_2 = new Ligne(6);
            ligne2_2.setCasier(casier2);
            ligne2_2.setPosition(2);
            ligne2_2 = ligneRepository.save(ligne2_2);

            Wine wine1 = new Wine("Château Margaux", "Margaux", 2015, Wine.Couleur.ROUGE, new BigDecimal("450.00"),"75cl");
            wine1.setLigne(ligne1_1);
            wine1.setPosition(1);
            wineRepository.save(wine1);

            Wine wine2 = new Wine("Château d'Yquem", "Sauternes", 2010, Wine.Couleur.BLANC, new BigDecimal("380.00"),"75cl");
            wine2.setLigne(ligne1_1);
            wine2.setPosition(4);
            wineRepository.save(wine2);

            Wine wine3 = new Wine("Dom Pérignon", "Champagne", 2012, Wine.Couleur.CHAMPAGNE, new BigDecimal("180.00"),"75cl");
            wine3.setLigne(ligne1_2);
            wine3.setPosition(1);
            wineRepository.save(wine3);

            Wine wine4 = new Wine("Château Pichon Baron", "Pauillac", 2016, Wine.Couleur.ROUGE, new BigDecimal("85.00"),"75cl");
            wine4.setLigne(ligne2_1);
            wine4.setPosition(2);
            wineRepository.save(wine4);

            Wine wine5 = new Wine("Whispering Angel", "Côtes de Provence", 2022, Wine.Couleur.ROSE, new BigDecimal("15.00"),"75cl");
            wine5.setLigne(ligne2_2);
            wine5.setPosition(3);
            wineRepository.save(wine5);

            System.out.println("Données d'exemple initialisées avec succès !");
        }
    }
}