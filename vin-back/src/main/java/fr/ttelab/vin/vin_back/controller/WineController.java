package fr.ttelab.vin.vin_back.controller;

import fr.ttelab.vin.vin_back.dto.DtoMapper;
import fr.ttelab.vin.vin_back.dto.WineDto;
import fr.ttelab.vin.vin_back.model.Ligne;
import fr.ttelab.vin.vin_back.model.Wine;
import fr.ttelab.vin.vin_back.repository.LigneRepository;
import fr.ttelab.vin.vin_back.repository.WineRepository;
import fr.ttelab.vin.vin_back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sound.sampled.Line;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/wines")
@CrossOrigin(origins = "*")
public class WineController {

    @Autowired
    private WineRepository wineRepository;

    @Autowired
    private LigneRepository ligneRepository;;

    @Autowired
    private UserService userService;;

    // POST /api/wines - Créer une nouvelle bouteille
    @PostMapping
    public ResponseEntity<WineDto> createWine(@RequestBody WineDto wine) {
        if (wine.getLigneId() == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Ligne> ligneOpt = ligneRepository.findById(wine.getLigneId());
        if (ligneOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Ligne ligne = ligneOpt.get();
        if (!ligne.getCasier().getCave().getOwner().getId().equals(userService.getCurrentUser().getId())) {
            return ResponseEntity.badRequest().build();
        }

        Wine newWine = new Wine();
        newWine.setChateau(wine.getChateau());
        newWine.setAppellation(wine.getAppellation());
        newWine.setAnnee(wine.getAnnee());
        newWine.setCouleur(wine.getCouleur());
        newWine.setPrix(wine.getPrix());
        newWine.setLigne(ligne);
        newWine.setPosition(wine.getPosition());

        return ResponseEntity.ok(DtoMapper.toWineDto(wineRepository.save(newWine)));
    }
    // PUT /api/wines/{id} - Mettre à jour une bouteille
    @PutMapping("/{id}")
    public ResponseEntity<Wine> updateWine( @PathVariable Integer id,@RequestBody WineDto wineDetails) {
        Optional<Wine> optionalWine = wineRepository.findById(Long.valueOf(id));
        if (optionalWine.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        Ligne ligne = wineDetails.getLigneId() == null ? optionalWine.get().getLigne() : ligneRepository.findById(wineDetails.getLigneId()).orElseGet(null);
        if (ligne ==null) {
            return ResponseEntity.badRequest().build();
        }
        if (!ligne.getCasier().getCave().getOwner().getId().equals(userService.getCurrentUser().getId())) {
            return ResponseEntity.badRequest().build();
        }

        if (optionalWine.isPresent()) {
            Wine wine = getWine(wineDetails, optionalWine, ligne);

            return ResponseEntity.ok(wineRepository.save(wine));
        }
        
        return ResponseEntity.notFound().build();
    }

    private static Wine getWine(WineDto wineDetails, Optional<Wine> optionalWine, Ligne ligne) {
        Wine wine = optionalWine.get();
        wine.setChateau(wineDetails.getChateau()==null?wine.getChateau(): wineDetails.getChateau());
        wine.setAppellation(wineDetails.getAppellation()==null?wine.getAppellation(): wineDetails.getAppellation());
        wine.setAnnee(wineDetails.getAnnee()==null?wine.getAnnee(): wineDetails.getAnnee());
        wine.setCouleur(wineDetails.getCouleur()==null?wine.getCouleur(): wineDetails.getCouleur());
        wine.setTaille(wineDetails.getTaille()==null?wine.getTaille(): wineDetails.getTaille());
        wine.setPrix(wineDetails.getPrix()==null?wine.getPrix(): wineDetails.getPrix());
        wine.setPosition(wineDetails.getPosition()==null?wine.getPosition(): wineDetails.getPosition());
        wine.setLigne(ligne);
        return wine;
    }

    // DELETE /api/wines/{id} - Supprimer une bouteille
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWine(@PathVariable Long id) {
        if (wineRepository.existsById(id)) {
            wineRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }


}