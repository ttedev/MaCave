package fr.ttelab.vin.vin_back.controller;

import fr.ttelab.vin.vin_back.dto.CasierDto;
import fr.ttelab.vin.vin_back.dto.CaveDto;
import fr.ttelab.vin.vin_back.dto.DtoMapper;
import fr.ttelab.vin.vin_back.model.Casier;
import fr.ttelab.vin.vin_back.model.Cave;
import fr.ttelab.vin.vin_back.repository.CasierRepository;
import fr.ttelab.vin.vin_back.repository.CaveRepository;
import fr.ttelab.vin.vin_back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/casiers")
@CrossOrigin(origins = "*")
public class CasierController {

    @Autowired
    private UserService userService;

    @Autowired
    private CaveRepository caveRepository;

    @Autowired
    private CasierRepository casierRepository;

    // GET /api/casiers/cave/{caveId} - Récupérer tous les casiers d'une cave
    @GetMapping("/cave/{caveId}")
    public ResponseEntity<List<CasierDto>> getCasiersByCaveId(@PathVariable Long caveId) {
        userService.getCurrentUser();

        Cave cave= caveRepository.findById(caveId).orElse(null);
        if (cave == null) {
            return ResponseEntity.notFound().build();
        }

        if (!cave.getOwner().getId().equals(userService.getCurrentUser().getId())) {
            return ResponseEntity.notFound().build();
        }


        return ResponseEntity.ok(
            cave.getCasiers()
                .stream()
                .map(DtoMapper::toCasierDtoDeep)
                .toList()
        );
    }

    //POST /api/casiers - Créer un nouveau casier
    @PostMapping
    public ResponseEntity<CasierDto> createCasier(@RequestBody CasierDto casierDto) {
        userService.getCurrentUser();
        Optional<Cave> optionalCave = caveRepository.findById(casierDto.getCaveId());
        if (optionalCave.isPresent()) {
            Cave cave = optionalCave.get();
            if (!cave.getOwner().getId().equals(userService.getCurrentUser().getId())) {
                return ResponseEntity.notFound().build();
            }
            Casier casier = new Casier();
            casier.setNumeroCasier(casierDto.getNumeroCasier());
            casier.setCave(cave);
            Casier savedCasier = casierRepository.save(casier);
            return ResponseEntity.ok(DtoMapper.toCasierDto(savedCasier));
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE /api/casiers/{id} - Supprimer un casier
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCasier(@PathVariable Long id) {
        Optional<Casier> optionalCasier = casierRepository.findById(id);
                if (optionalCasier.isPresent()) {
                    Casier casier = optionalCasier.get();
                    if (!casier.getCave().getOwner().getId().equals(userService.getCurrentUser().getId())) {
                        return ResponseEntity.notFound().build();
                    }
                    casierRepository.deleteById(id);
                    return ResponseEntity.ok().build();
                }
        return ResponseEntity.notFound().build();
    }
}