package fr.ttelab.vin.vin_back.dto;

import java.util.ArrayList;
import java.util.List;

public class CasierDto {
    private Long id;
    private Integer numeroCasier;
    private Long caveId;
    private  Integer position;
    private List<LigneDto> lignes = new ArrayList<>();

    public CasierDto() {}
    public CasierDto(Long id, Integer numeroCasier, Long caveId, Integer position) { this.id = id; this.numeroCasier = numeroCasier; this.caveId = caveId; this.position = position; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getNumeroCasier() { return numeroCasier; }
    public void setNumeroCasier(Integer numeroCasier) { this.numeroCasier = numeroCasier; }
    public Long getCaveId() { return caveId; }
    public void setCaveId(Long caveId) { this.caveId = caveId; }
    public Integer getPosition() {return position; }
    public void setPosition(Integer position) { this.position = position; }
    public List<LigneDto> getLignes() { return lignes; }
    public void setLignes(List<LigneDto> lignes) { this.lignes = lignes; }
}
