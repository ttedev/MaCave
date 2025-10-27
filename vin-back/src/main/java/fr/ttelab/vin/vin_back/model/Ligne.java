package fr.ttelab.vin.vin_back.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "ligne")
public class Ligne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "nombre_bouteilles_max", nullable = false)
    private Integer nombreBouteillesMax;

    @Column(name = "position",nullable = false)
    private Integer position;
    
    @OneToMany(mappedBy = "ligne", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("ligne-bouteilles")
    private List<Wine> bouteilles = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "casier_id")
    @JsonBackReference("casier-lignes")
    private Casier casier;

    
    // Constructeurs
    public Ligne() {
        this.bouteilles = new ArrayList<>();
    }
    
    public Ligne(Integer nombreBouteillesMax) {
        this.nombreBouteillesMax = nombreBouteillesMax;
        this.bouteilles = new ArrayList<>();
    }
    
    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Integer getNombreBouteillesMax() {
        return nombreBouteillesMax;
    }
    
    public void setNombreBouteillesMax(Integer nombreBouteillesMax) {
        this.nombreBouteillesMax = nombreBouteillesMax;
    }
    
    public List<Wine> getBouteilles() {
        return bouteilles;
    }
    
    public void setBouteilles(List<Wine> bouteilles) {
        this.bouteilles = bouteilles;
    }
    
    public Casier getCasier() {
        return casier;
    }
    
    public void setCasier(Casier casier) {
        this.casier = casier;
    }
    
    // Méthode utilitaire pour vérifier si la ligne est pleine
    public boolean isPleine() {
        return bouteilles != null && bouteilles.size() >= nombreBouteillesMax;
    }
    
    // Méthode utilitaire pour obtenir le nombre de bouteilles actuelles
    public int getNombreBouteillesActuelles() {
        return bouteilles != null ? bouteilles.size() : 0;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }
}
