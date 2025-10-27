package fr.ttelab.vin.vin_back.repository;

import fr.ttelab.vin.vin_back.model.Ligne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LigneRepository extends JpaRepository<Ligne, Long> {
    
    List<Ligne> findByCasierId(Long casierId);
    
    List<Ligne> findByCasierIdOrderById(Long casierId);
    
}