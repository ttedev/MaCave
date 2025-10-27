package fr.ttelab.vin.vin_back.controller;

import fr.ttelab.vin.vin_back.dto.CaveDto;
import fr.ttelab.vin.vin_back.dto.DtoMapper;
import fr.ttelab.vin.vin_back.model.Cave;
import fr.ttelab.vin.vin_back.model.User;
import fr.ttelab.vin.vin_back.repository.CaveRepository;
import fr.ttelab.vin.vin_back.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/caves")
@CrossOrigin(origins = "*")
@Slf4j
public class CaveController {

    @Autowired
    private CaveRepository caveRepository;
    
    @Autowired
    private UserService userService;

    // GET /api/caves - Récupérer toutes les caves de l'utilisateur courant
    @GetMapping
    public List<CaveDto> getAllCaves() {
        User currentUser = userService.getCurrentUser();

        List<CaveDto> list= caveRepository.findByOwnerId(currentUser.getId())
            .stream().map(DtoMapper::toCaveDtoDeep).collect(Collectors.toList());
        return list;
    }

    // GET /api/caves/{id} - Récupérer une cave par ID (si elle appartient à l'utilisateur)
    @GetMapping("/{id}")
    public ResponseEntity<CaveDto> getCaveById(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        Optional<Cave> cave = caveRepository.findById(id);
        if (cave.isPresent() && cave.get().getOwner().getId().equals(currentUser.getId())) {
            return ResponseEntity.ok(DtoMapper.toCaveDtoDeep(cave.get()));
        }
        return ResponseEntity.notFound().build();
    }

    // POST /api/caves - Créer une nouvelle cave pour l'utilisateur courant
    @PostMapping
    public CaveDto createCave(@RequestBody CaveDto caveDto) {
        User currentUser = userService.getCurrentUser();
        Cave cave = new Cave(caveDto.getNom(), caveDto.getDescription());
        cave.setNombreLignesParCasier(caveDto.getNombreLignesParCasier());
        cave.setCapacitesParLigne(caveDto.getCapacitesParLigne());
        cave.setOwner(currentUser);
        return DtoMapper.toCaveDto(caveRepository.save(cave));
    }

    // PUT /api/caves/{id} - Mettre à jour une cave (si elle appartient à l'utilisateur)
    @PutMapping("/{id}")
    public ResponseEntity<CaveDto> updateCave(@PathVariable Long id, @RequestBody CaveDto caveDetails) {
        User currentUser = userService.getCurrentUser();
        Optional<Cave> optionalCave = caveRepository.findById(id);
        if (optionalCave.isPresent() && optionalCave.get().getOwner().getId().equals(currentUser.getId())) {
            Cave cave = optionalCave.get();
            cave.setNom(caveDetails.getNom());
            cave.setDescription(caveDetails.getDescription());
            cave.setNombreLignesParCasier(caveDetails.getNombreLignesParCasier());
            cave.setCapacitesParLigne(caveDetails.getCapacitesParLigne());
            return ResponseEntity.ok(DtoMapper.toCaveDto(caveRepository.save(cave)));
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE /api/caves/{id} - Supprimer une cave (si elle appartient à l'utilisateur)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCave(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        Optional<Cave> cave = caveRepository.findById(id);
        
        if (cave.isPresent() && cave.get().getOwner().getId().equals(currentUser.getId())) {
            caveRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        
        return ResponseEntity.notFound().build();
    }

}