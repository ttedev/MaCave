package fr.ttelab.vin.vin_back.dto;

import java.util.ArrayList;
import java.util.List;

public class LigneDto {
    private Long id;
    private Integer nombreBouteillesMax;
    private Long casierId;
    private  Integer position;
    // Liste des bouteilles
    private List<WineDto> bouteilles = new ArrayList<>();

    public LigneDto() {}
    public LigneDto(Long id, Integer nombreBouteillesMax, Long casierId,Integer position) { this.id = id; this.nombreBouteillesMax = nombreBouteillesMax; this.casierId = casierId; this.position=position; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getNombreBouteillesMax() { return nombreBouteillesMax; }
    public void setNombreBouteillesMax(Integer nombreBouteillesMax) { this.nombreBouteillesMax = nombreBouteillesMax; }
    public Long getCasierId() { return casierId; }
    public void setCasierId(Long casierId) { this.casierId = casierId; }
    public Integer getPosition() {return position; }
    public void setPosition(Integer position) { this.position = position; }
    public List<WineDto> getBouteilles() { return bouteilles; }
    public void setBouteilles(List<WineDto> bouteilles) { this.bouteilles = bouteilles; }
}
