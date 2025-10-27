package fr.ttelab.vin.vin_back.controller;

import fr.ttelab.vin.vin_back.dto.WineDto;
import fr.ttelab.vin.vin_back.model.User;
import fr.ttelab.vin.vin_back.service.ScanService;
import fr.ttelab.vin.vin_back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Controller
@RequestMapping("/api/scan")
public class ScanController {

  @Autowired
  private UserService userService;

  @Autowired
  private ScanService scanService;

  // POST /api/wines/{id}/scan - poste une photo de la bouteille pour scanner l'étiquette
  @PostMapping()
  public ResponseEntity<?> scanWineLabel(@RequestParam("file") MultipartFile file) throws IOException {
    User user = userService.getCurrentUser();

    if (user == null) {
      return ResponseEntity.status(401).build();
    }
    if (user.getQuotasApi() <= 0) {
      return ResponseEntity.status(403).body("No More api call");
    }


    WineDto wineDto = scanService.scanWineLabel(file);
    user.setQuotasApi(user.getQuotasApi() - 1);
    userService.saveUser(user);
    return ResponseEntity.ok(wineDto);
  }


  }
