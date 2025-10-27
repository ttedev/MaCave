package fr.ttelab.vin.vin_back.dto;

import java.math.BigDecimal;
import fr.ttelab.vin.vin_back.model.Wine;

public class WineDto {
    private Long id;
    private String chateau;
    private String appellation;
    private String taille;
    private Integer annee;
    private Wine.Couleur couleur;
    private BigDecimal prix;
    private Long ligneId;
    private  Integer position;

    public WineDto() {}

    public WineDto(Long id, String chateau, String appellation, String taille,Integer annee, Wine.Couleur couleur, BigDecimal prix, Long ligneId,Integer position) {
        this.id=id; this.chateau=chateau; this.appellation=appellation;this.taille=taille; this.annee=annee; this.couleur=couleur; this.prix=prix; this.ligneId=ligneId;this.position=position;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getChateau() { return chateau; }
    public void setChateau(String chateau) { this.chateau = chateau; }
    public String getAppellation() { return appellation; }
    public void setAppellation(String appellation) { this.appellation = appellation; }
    public Integer getAnnee() { return annee; }
    public void setAnnee(Integer annee) { this.annee = annee; }
    public Wine.Couleur getCouleur() { return couleur; }
    public void setCouleur(Wine.Couleur couleur) { this.couleur = couleur; }
    public BigDecimal getPrix() { return prix; }
    public void setPrix(BigDecimal prix) { this.prix = prix; }
    public Long getLigneId() { return ligneId; }
    public void setLigneId(Long ligneId) { this.ligneId = ligneId; }
    public Integer getPosition() {return position;    }
    public void setPosition(Integer position) { this.position = position;    }

    public String getTaille() {
        return taille;
    }

    public void setTaille(String taille) {
        this.taille = taille;
    }
}

