package fr.ttelab.vin.vin_back.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.math.BigDecimal;

@Entity
@Table(name = "wine")
public class Wine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chateau", nullable = false)
    private String chateau;
    
    @Column(name = "appellation", nullable = false)
    private String appellation;
    
    @Column(name = "annee")
    private Integer annee;

    @Column(name = "position",nullable = false)
    private Integer position;

    @Column(name = "taille")
    private  String taille;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "couleur")
    private Couleur couleur;


    
    @Column(name = "prix", precision = 10, scale = 2)
    private BigDecimal prix;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ligne_id")
    @JsonBackReference("ligne-bouteilles")
    private Ligne ligne;
    
    // Énumération pour les couleurs de vin
    public enum Couleur {
        ROUGE, BLANC, ROSE, PETILLANT, CHAMPAGNE
    }
    
    // Constructeurs
    public Wine() {}
    
    public Wine(String chateau, String appellation, Integer annee, Couleur couleur, BigDecimal prix, String taille) {
        this.chateau = chateau;
        this.appellation = appellation;
        this.annee = annee;
        this.couleur = couleur;
        this.prix = prix;
        this.taille = taille;
    }

    public String getTaille() {
        return taille;
    }

    public void setTaille(String taille) {
        this.taille = taille;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getChateau() {
        return chateau;
    }
    
    public void setChateau(String chateau) {
        this.chateau = chateau;
    }
    
    public String getAppellation() {
        return appellation;
    }
    
    public void setAppellation(String appellation) {
        this.appellation = appellation;
    }
    
    public Integer getAnnee() {
        return annee;
    }
    
    public void setAnnee(Integer annee) {
        this.annee = annee;
    }
    
    public Couleur getCouleur() {
        return couleur;
    }
    
    public void setCouleur(Couleur couleur) {
        this.couleur = couleur;
    }
    
    public BigDecimal getPrix() {
        return prix;
    }
    
    public void setPrix(BigDecimal prix) {
        this.prix = prix;
    }
    
    public Ligne getLigne() {
        return ligne;
    }
    
    public void setLigne(Ligne ligne) {
        this.ligne = ligne;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }
}
