package fr.ttelab.vin.vin_back.service;

import fr.ttelab.vin.vin_back.model.*;
import fr.ttelab.vin.vin_back.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@Slf4j
public class CaveService {

    @Autowired
    private CaveRepository caveRepository;
    
    @Autowired
    private CasierRepository casierRepository;
    
    @Autowired
    private LigneRepository ligneRepository;

    @Autowired
    private UserService userService;
    
    /**
     * Ajoute un nouveau casier à une cave existante
     */
    public Casier ajouterCasierACave(Long caveId, Integer numeroCasier) {
        Optional<Cave> optionalCave = caveRepository.findById(caveId);
        if (optionalCave.isPresent()) {
            Cave cave = optionalCave.get();

            if (! cave.getOwner().getUsername().equals(userService.getCurrentUser().getUsername())){
                throw new RuntimeException("L'utilisateur courant n'est pas le propriétaire de la cave avec l'id: " + caveId);
            }

                return creerCasierAvecLignes(cave, numeroCasier,
                                       cave.getNombreLignesParCasier());
        }
        throw new RuntimeException("Cave non trouvée avec l'id: " + caveId);
    }

    
    private Casier creerCasierAvecLignes(Cave cave, Integer numeroCasier, 
                                        Integer nombreLignes) {
        Casier casier = new Casier(numeroCasier);
        casier.setCave(cave);

        // Créer les lignes
        List<Ligne> lignes = new ArrayList<>();
        for (int i = 0; i < nombreLignes; i++) {
            Ligne ligne = new Ligne(cave.getCapacitesParLigne().get(i));
            ligne.setCasier(casier);
            ligne.setBouteilles(new ArrayList<>());
            ligne.setPosition(i + 1);
            lignes.add(ligne);
        }
        
        casier.setLignes(lignes);
        casier.setPosition(numeroCasier);
        return casierRepository.save(casier);
    }
}