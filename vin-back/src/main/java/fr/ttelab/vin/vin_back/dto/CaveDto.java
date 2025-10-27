package fr.ttelab.vin.vin_back.dto;

import java.util.ArrayList;
import java.util.List;

public class CaveDto {
    private Long id;
    private String nom;
    private String description;
    private Integer nombreLignesParCasier;
    private List<Integer> capacitesParLigne  = new ArrayList<>();
    private Long ownerId;
    private List<CasierDto> casiers = new ArrayList<>();

    public CaveDto() {}

    public CaveDto(Long id, String nom, String description, Integer nombreLignesParCasier, List<Integer> capaciteParDefautParLigne, Long ownerId) {
        this.id = id; this.nom = nom; this.description = description; this.nombreLignesParCasier = nombreLignesParCasier; this.capacitesParLigne = capaciteParDefautParLigne; this.ownerId = ownerId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getNombreLignesParCasier() { return nombreLignesParCasier; }
    public void setNombreLignesParCasier(Integer nombreLignesParCasier) { this.nombreLignesParCasier = nombreLignesParCasier; }

    public List<Integer> getCapacitesParLigne() {
        return capacitesParLigne;
    }

    public void setCapacitesParLigne(List<Integer> capacitesParLigne) {
        this.capacitesParLigne = capacitesParLigne;
    }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public List<CasierDto> getCasiers() { return casiers; }
    public void setCasiers(List<CasierDto> casiers) { this.casiers = casiers; }



}
