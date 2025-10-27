package fr.ttelab.vin.vin_back.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cave")
public class Cave {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nom;
    
    @Column(length = 1000)
    private String description;
    
    // Configuration des casiers
    @Column(name = "nombre_lignes_par_casier")
    private Integer nombreLignesParCasier = 2; // par défaut 2 lignes

    @ElementCollection
    @CollectionTable(name = "capacites_lignes", joinColumns = @JoinColumn(name = "cave_id"))
    @Column(name = "capacite")
    private List<Integer> capacitesParLigne = List.of(6, 5); // Exemple : ligne 0 → 6 bouteilles, ligne 1 → 5 bouteilles

    
    @OneToMany(mappedBy = "cave", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("cave-casiers")
    private List<Casier> casiers = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    @JsonBackReference("user-caves")
    private User owner;
    
    // Constructeurs
    public Cave() {}
    
    public Cave(String nom, String description) {
        this.nom = nom;
        this.description = description;
        this.casiers = new ArrayList<>();
    }
    
    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNom() {
        return nom;
    }
    
    public void setNom(String nom) {
        this.nom = nom;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Integer getNombreLignesParCasier() {
        return nombreLignesParCasier;
    }
    
    public void setNombreLignesParCasier(Integer nombreLignesParCasier) {
        this.nombreLignesParCasier = nombreLignesParCasier;
    }

    public List<Integer> getCapacitesParLigne() {
        return capacitesParLigne;
    }

    public void setCapacitesParLigne(List<Integer> capacitesParLigne) {
        this.capacitesParLigne = capacitesParLigne;
    }

    public List<Casier> getCasiers() {
        return casiers;
    }
    
    public void setCasiers(List<Casier> casiers) {
        this.casiers = casiers;
    }
    
    public User getOwner() {
        return owner;
    }
    
    public void setOwner(User owner) {
        this.owner = owner;
    }
    
    // Méthodes utilitaires

    public Casier creerNouveauCasier(Integer numeroCasier) {
        Casier casier = new Casier(numeroCasier);
        casier.setCave(this);

        List<Ligne> lignes = new ArrayList<>();
        for (int i = 0; i < capacitesParLigne.size(); i++) {
            Ligne ligne = new Ligne(capacitesParLigne.get(i));
            ligne.setCasier(casier);
            lignes.add(ligne);
        }
        casier.setLignes(lignes);

        return casier;
    }

    
    public int getCapaciteTotaleCave() {
        return casiers != null ? 
            casiers.stream()
                   .mapToInt(Casier::getCapaciteMaximale)
                   .sum() : 0;
    }
    
    public int getNombreTotalBouteilles() {
        return casiers != null ? 
            casiers.stream()
                   .mapToInt(Casier::getNombreTotalBouteilles)
                   .sum() : 0;
    }
}