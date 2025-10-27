package fr.ttelab.vin.vin_back.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.ttelab.vin.vin_back.dto.CaveData;
import fr.ttelab.vin.vin_back.model.Casier;
import fr.ttelab.vin.vin_back.model.Cave;
import fr.ttelab.vin.vin_back.model.Ligne;
import fr.ttelab.vin.vin_back.model.Wine;
import fr.ttelab.vin.vin_back.repository.CaveRepository;
import fr.ttelab.vin.vin_back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.math.BigDecimal;
import java.util.List;

@Controller
@RequestMapping("/api/import-export")
@CrossOrigin(origins = "*")
public class ImportExportController {

  @Autowired
  private CaveRepository caveRepository;

  @Autowired
  private UserService userService;


  //POST /api/import-export/import - Importer les données de la cave depuis un fichier JSON
  @PostMapping("/import")
  public ResponseEntity<Void> importCaveData(@RequestBody String jsonData) throws JsonProcessingException {
    ObjectMapper objectMapper = new ObjectMapper();
    CaveData rootNode = objectMapper.readValue(jsonData, CaveData.class);

    rootNode.getCaves().forEach(cave -> {
      Cave caveEntity = new Cave();
      caveEntity.setNom(cave.getNom());
      caveEntity.setDescription(cave.getDescription());
      caveEntity.setNombreLignesParCasier(cave.getCasierConfig().getNbLignes());
      caveEntity.setCapacitesParLigne(
          cave.getCasierConfig().getLignes());
      caveEntity.setOwner(userService.getCurrentUser());

      cave.getCasiers().forEach(casierDto -> {
        Casier casier = new Casier();
        casier.setPosition(casierDto.getId());
        casier.setNumeroCasier(casierDto.getId()); // pour avoir un numéro lisible
        casier.setCave(caveEntity); // lien propriétaire
        caveEntity.getCasiers().add(casier);

        for (int i = 0; i < casierDto.getLignes().size(); i++) {
          List<CaveData.Bouteille> ligneDto = casierDto.getLignes().get(i);
          Ligne ligne = new Ligne();
          ligne.setPosition(i+1);
          ligne.setNombreBouteillesMax(ligneDto.size());
          ligne.setCasier(casier); // lien propriétaire
          casier.getLignes().add(ligne);

          for (int j = 0; j < ligneDto.size(); j++) {
            CaveData.Bouteille bouteilleDto = ligneDto.get(j);
            if (bouteilleDto != null) {
              Wine wine = new Wine();
              wine.setChateau(bouteilleDto.getChateau());
              wine.setAnnee(Integer.valueOf(bouteilleDto.getAnnee()));
              wine.setAppellation(bouteilleDto.getAppellation());
              wine.setPrix(BigDecimal.valueOf(bouteilleDto.getPrix()));
              wine.setPosition(j+1);
              wine.setTaille(bouteilleDto.getTaille());
              wine.setLigne(ligne); // lien propriétaire
              ligne.getBouteilles().add(wine);
            }
          }
        }
      });

      caveRepository.save(caveEntity);
    });

    return ResponseEntity.ok().build();
  }
}
