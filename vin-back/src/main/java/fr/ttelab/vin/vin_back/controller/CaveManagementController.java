package fr.ttelab.vin.vin_back.controller;

import fr.ttelab.vin.vin_back.dto.CasierDto;
import fr.ttelab.vin.vin_back.dto.DtoMapper;
import fr.ttelab.vin.vin_back.model.Casier;
import fr.ttelab.vin.vin_back.model.Ligne;
import fr.ttelab.vin.vin_back.model.Wine;
import fr.ttelab.vin.vin_back.repository.WineRepository;
import fr.ttelab.vin.vin_back.service.CaveService;
import fr.ttelab.vin.vin_back.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RestController
@RequestMapping("/api/cave-management")
@CrossOrigin(origins = "*")
@Slf4j
public class CaveManagementController {

    @Autowired
    private CaveService caveService;

    @Autowired
    private UserService userService;

    @Autowired
    private WineRepository wineRepository;


    /**
     * POST /api/cave-management/{caveId}/add-casier
     * Ajoute un casier à une cave existante
     */
    @PostMapping("/{caveId}/add-casier")
    public ResponseEntity<CasierDto> ajouterCasier(@PathVariable Long caveId, @RequestParam Integer numeroCasier) {
        try {
            Casier casier = caveService.ajouterCasierACave(caveId, numeroCasier);
            return ResponseEntity.ok(DtoMapper.toCasierDtoDeep(casier));
        } catch (Exception e) {
            log.error("Error adding casier to cave with id {}: {}", caveId, e.getMessage(),e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * POST /api/cave-management/swap-wines
     * Échange deux bouteilles entre elles
     */
    @PostMapping("/swap-wines")
    public ResponseEntity<String> swapWines(@RequestParam Long wineId1, @RequestParam Long wineId2) {
        Optional<Wine> wineOpt1 = wineRepository.findById(wineId1);
        Optional<Wine> wineOpt2 = wineRepository.findById(wineId2);

        if (wineOpt1.isEmpty() || wineOpt2.isEmpty()) {
            return ResponseEntity.badRequest().body("One or both wines not found.");
        }

        Wine wine1 = wineOpt1.get();
        Wine wine2 = wineOpt2.get();

        // Vérifier que les deux bouteilles appartiennent à l'utilisateur courant
        Long currentUserId = userService.getCurrentUser().getId();
        if (!wine1.getLigne().getCasier().getCave().getOwner().getId().equals(currentUserId) ||
            !wine2.getLigne().getCasier().getCave().getOwner().getId().equals(currentUserId)) {
            return ResponseEntity.status(403).body("You do not have permission to swap these wines.");
        }

        // Échanger les positions et lignes
        Ligne ligne1 = wine1.getLigne();
        Integer position1 = wine1.getPosition();

        Ligne ligne2 = wine2.getLigne();
        Integer position2 = wine2.getPosition();

        wine1.setLigne(ligne2);
        wine1.setPosition(position2);

        wine2.setLigne(ligne1);
        wine2.setPosition(position1);

        wineRepository.save(wine1);
        wineRepository.save(wine2);

        return ResponseEntity.ok("Wines swapped successfully.");
    }
}