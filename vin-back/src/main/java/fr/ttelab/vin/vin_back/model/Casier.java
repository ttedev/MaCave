package fr.ttelab.vin.vin_back.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "casier")
public class Casier {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_casier")
    private Integer numeroCasier;

    @Column(name = "position",nullable = false)
    private Integer position;
    
    @OneToMany(mappedBy = "casier", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("casier-lignes")
    private List<Ligne> lignes = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cave_id")
    @JsonBackReference("cave-casiers")
    private Cave cave;
    
    // Constructeurs
    public Casier() {
        this.lignes = new ArrayList<>();
    }
    
    public Casier(Integer numeroCasier) {
        this.numeroCasier = numeroCasier;
        this.lignes = new ArrayList<>();
    }
    
    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Integer getNumeroCasier() {
        return numeroCasier;
    }
    
    public void setNumeroCasier(Integer numeroCasier) {
        this.numeroCasier = numeroCasier;
    }
    
    public List<Ligne> getLignes() {
        return lignes;
    }
    
    public void setLignes(List<Ligne> lignes) {
        this.lignes = lignes;
    }
    
    public Cave getCave() {
        return cave;
    }
    
    public void setCave(Cave cave) {
        this.cave = cave;
    }
    
    // Méthodes utilitaires
    public int getNombreTotalBouteilles() {
        return lignes != null ? 
            lignes.stream()
                  .mapToInt(Ligne::getNombreBouteillesActuelles)
                  .sum() : 0;
    }
    
    public int getCapaciteMaximale() {
        return lignes != null ? 
            lignes.stream()
                  .mapToInt(Ligne::getNombreBouteillesMax)
                  .sum() : 0;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }
}
