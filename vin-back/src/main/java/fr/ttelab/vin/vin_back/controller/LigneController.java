package fr.ttelab.vin.vin_back.controller;

import fr.ttelab.vin.vin_back.dto.DtoMapper;
import fr.ttelab.vin.vin_back.dto.LigneDto;
import fr.ttelab.vin.vin_back.model.Casier;
import fr.ttelab.vin.vin_back.model.Ligne;
import fr.ttelab.vin.vin_back.repository.CasierRepository;
import fr.ttelab.vin.vin_back.repository.LigneRepository;
import fr.ttelab.vin.vin_back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/lignes")
@CrossOrigin(origins = "*")
public class LigneController {

    @Autowired
    private LigneRepository ligneRepository;

    @Autowired
    private CasierRepository casierRepository;

    @Autowired
    private UserService userService;

    //POST /api/lignes - Créer une nouvelle ligne
    @PostMapping
    public ResponseEntity<LigneDto> createLigne(@RequestBody LigneDto ligne) {
        Optional<Casier> casierOpt = casierRepository.findById(ligne.getCasierId());
        if (casierOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Casier casier = casierOpt.get();
        if (!casier.getCave().getOwner().getId().equals(userService.getCurrentUser().getId())) {
            return ResponseEntity.badRequest().build();
        }
        Ligne newLigne = new Ligne();
        newLigne.setCasier(casier);
        newLigne.setNombreBouteillesMax(ligne.getNombreBouteillesMax());

        Ligne savedLigne = ligneRepository.save(newLigne);
        // Mapping simple (pas deep car pas de GET actuellement)
        return ResponseEntity.ok(DtoMapper.toLigneDto(savedLigne));
    }

    // TODO: Si endpoints GET pour lignes sont ajoutés, utiliser DtoMapper.toLigneDtoDeep
}