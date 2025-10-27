package fr.ttelab.vin.vin_back.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "app_user")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = true)
    private String password;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("user-caves")
    private List<Cave> caves = new ArrayList<>();

    @Column(name = "quotas_api")
    private Integer quotasApi = 100;
    
    // Constructeurs
    public User() {}
    
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.caves = new ArrayList<>();
    }
    
    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public List<Cave> getCaves() {
        return caves;
    }
    
    public void setCaves(List<Cave> caves) {
        this.caves = caves;
    }
    
    // Méthodes utilitaires
    public String getFullName() {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "").trim();
    }
    
    public void addCave(Cave cave) {
        caves.add(cave);
        cave.setOwner(this);
    }
    
    public void removeCave(Cave cave) {
        caves.remove(cave);
        cave.setOwner(null);
    }

    public Integer getQuotasApi() {
        return quotasApi;
    }

    public void setQuotasApi(Integer quotasApi) {
        this.quotasApi = quotasApi;
    }
}