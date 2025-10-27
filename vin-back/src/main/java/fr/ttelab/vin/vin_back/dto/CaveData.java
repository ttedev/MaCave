package fr.ttelab.vin.vin_back.dto;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

public class CaveData {
  private List<Cave> caves = new ArrayList<>();
  private int revision;


  // Getters et setters
  public List<Cave> getCaves() {return caves;}
  public void setCaves(List<Cave> caves) {this.caves = caves;}
  public int getRevision() {return revision;}
  public void setRevision(int revision) {this.revision = revision;}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class Cave {
    private int id;
    private String nom;
    private String description;
    private List<Casier> casiers = new ArrayList<>();
    private CasierConfig casierConfig;
    // Getters et setters
    public int getId() {return id;}
    public void setId(int id) {this.id = id;}
    public String getNom() {return nom;}
    public void setNom(String nom) {this.nom = nom;}
    public String getDescription() {return description;}
    public void setDescription(String description) {this.description = description;}
    public List<Casier> getCasiers() {return casiers;}
    public void setCasiers(List<Casier> casiers) {this.casiers = casiers;}
    public CasierConfig getCasierConfig() {return casierConfig;}
    public void setCasierConfig(CasierConfig casierConfig) {this.casierConfig = casierConfig;}
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class Casier {
    private int id;
    private List<List<Bouteille>> lignes = new ArrayList<>();
    // Getters et setters
    public int getId() {return id;}
    public void setId(int id) {this.id = id;}
    public List<List<Bouteille>> getLignes() {return lignes;}
    public void setLignes(List<List<Bouteille>> lignes) {this.lignes = lignes;}
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class Bouteille {
    private String chateau;
    private String appellation;
    private String annee;
    private String taille;
    private int prix;
    // Getters et setters
    public String getChateau() {return chateau;}
    public void setChateau(String chateau) {this.chateau = chateau;}
    public String getAppellation() {return appellation;}
    public void setAppellation(String appellation) {this.appellation = appellation;}
    public String getAnnee() {return annee;}
    public void setAnnee(String annee) {this.annee = annee;}
    public String getTaille() {return taille;}
    public void setTaille(String taille) {this.taille = taille;}
    public int getPrix() {return prix;}
    public void setPrix(int prix) {this.prix = prix;}
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class CasierConfig {
    private int nbLignes;
    private List<Integer> lignes  = new ArrayList<>();
    // Getters et setters
    public int getNbLignes() {return nbLignes;}
    public void setNbLignes(int nbLignes) {this.nbLignes = nbLignes;}
    public List<Integer> getLignes() {return lignes;}
    public void setlLgnes(List<Integer> capacitesParLigne){this.lignes = capacitesParLigne;};
  }

}