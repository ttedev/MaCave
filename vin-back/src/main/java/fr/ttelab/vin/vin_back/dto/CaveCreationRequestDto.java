package fr.ttelab.vin.vin_back.dto;

public class CaveCreationRequestDto {
    private String nom;
    private String description;
    private Integer nombreCasiers;
    private Integer nombreLignesParCasier;
    private Integer capaciteParLigne;

    public CaveCreationRequestDto() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getNombreCasiers() { return nombreCasiers; }
    public void setNombreCasiers(Integer nombreCasiers) { this.nombreCasiers = nombreCasiers; }
    public Integer getNombreLignesParCasier() { return nombreLignesParCasier; }
    public void setNombreLignesParCasier(Integer nombreLignesParCasier) { this.nombreLignesParCasier = nombreLignesParCasier; }
    public Integer getCapaciteParLigne() { return capaciteParLigne; }
    public void setCapaciteParLigne(Integer capaciteParLigne) { this.capaciteParLigne = capaciteParLigne; }
}

